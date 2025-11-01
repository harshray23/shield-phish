'use server';

import https from 'https';
import crypto from 'crypto';
import { z } from 'zod';
import { summarizeHtmlForAnalysis } from '@/ai/flows/summarize-html-for-analysis';
import { suggestImprovements } from '@/ai/flows/suggest-improvements-for-phishing-detection';
import type { SslDetails, AnalysisResult } from '@/lib/types';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp, collection, addDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import * as cheerio from 'cheerio';
import { getDomain } from 'tldts';
import { getAuth } from 'firebase/auth';


const UrlSchema = z.string().url({ message: 'Please enter a valid URL.' });
const MAX_CONTENT_LENGTH = 250000; // Limit content to avoid token limits
const FETCH_TIMEOUT = 8000; // 8 seconds

const certToPlainObject = (cert: any) => {
  if (!cert) return null;
  const plain = {
      subject: cert.subject,
      issuer: cert.issuer,
      valid_from: cert.valid_from,
      valid_to: cert.valid_to,
  };
  return JSON.parse(JSON.stringify(plain));
};

const getSslDetails = (hostname: string): Promise<SslDetails> =>
  new Promise((resolve) => {
    const options = {
      hostname: hostname,
      port: 443,
      method: 'GET',
      agent: new https.Agent({
        rejectUnauthorized: true, // This enforces validation against NodeJS's built-in CA list
      }),
      timeout: FETCH_TIMEOUT,
    };

    const req = https.request(options, (res) => {
      try {
        const certificate = (res.socket as any).getPeerCertificate();
        if (certificate && Object.keys(certificate).length > 0) {
          const certDetails = certToPlainObject(certificate);
          const validTo = new Date(certDetails.valid_to);
          if (validTo < new Date()) {
            resolve({ valid: false, error: 'Certificate has expired.' });
            return;
          }
          resolve({
            valid: true,
            ...certDetails,
          });
        } else {
          resolve({ valid: false, error: 'No certificate details found. The certificate may be self-signed or invalid.' });
        }
      } catch (e) {
         resolve({ valid: false, error: 'Could not retrieve certificate details.' });
      }
    });

    req.on('error', (e: any) => {
      if (e.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
          resolve({ valid: false, error: 'Certificate is not trusted by a recognized Certificate Authority (e.g., self-signed).' });
      } else if (e.code === 'ERR_TLS_CERT_ALTNAME_INVALID') {
           resolve({ valid: false, error: `Hostname mismatch. The certificate is not valid for ${hostname}.` });
      } else {
          resolve({ valid: false, error: e.message });
      }
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ valid: false, error: 'Request for SSL details timed out.' });
    });

    req.end();
  });

async function saveAnalysisToHistory(userId: string, result: AnalysisResult) {
    const { firestore } = initializeFirebase();
    const historyCollectionRef = collection(firestore, 'users', userId, 'analysisHistory');
    
    const historyItem = {
        userId: userId,
        url: result.url,
        riskScore: result.riskScore,
        createdAt: serverTimestamp(),
    };

    addDoc(historyCollectionRef, historyItem).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: historyCollectionRef.path,
            operation: 'create',
            requestResourceData: historyItem,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}


export async function analyzeUrl(url: string): Promise<{ success: boolean; data?: AnalysisResult; error?: string }> {
  const validation = UrlSchema.safeParse(url);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  let urlObject: URL;
  try {
     urlObject = new URL(url);
  } catch (e) {
    return { success: false, error: 'Invalid URL format.' };
  }
  
  const { firestore, auth } = initializeFirebase();
  const currentUser = auth.currentUser;

  const urlHash = crypto.createHash('sha256').update(urlObject.href).digest('hex');
  const cacheDocRef = doc(firestore, 'analysisCache', urlHash);

  try {
    const cacheDocSnap = await getDoc(cacheDocRef);
    if (cacheDocSnap.exists()) {
      const cachedData = cacheDocSnap.data();
      if (cachedData.createdAt && cachedData.createdAt instanceof Timestamp) {
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (new Date().getTime() - cachedData.createdAt.toDate().getTime() < sevenDays) {
          const resultData = { ...cachedData, createdAt: cachedData.createdAt.toDate().toISOString() } as AnalysisResult;
          if (currentUser) {
            await saveAnalysisToHistory(currentUser.uid, resultData);
          }
          return { success: true, data: resultData };
        }
      }
    }

    const fetchResponse = await fetch(urlObject.href, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
       redirect: 'follow',
       signal: AbortSignal.timeout(FETCH_TIMEOUT),
    });

    if (!fetchResponse.ok) {
      return { success: false, error: `Failed to access URL. Status: ${fetchResponse.status} ${fetchResponse.statusText}` };
    }
    const fullHtmlContent = await fetchResponse.text();

    if (!fullHtmlContent) {
        return { success: false, error: 'Unable to retrieve website content. The page might be empty or protected.' };
    }
    
    const htmlContent = fullHtmlContent.substring(0, MAX_CONTENT_LENGTH);

    const [summaryResult, suggestionsResult, sslDetails] = await Promise.all([
      summarizeHtmlForAnalysis({ htmlContent }),
      suggestImprovements({ url: urlObject.href, htmlContent }),
      urlObject.protocol === 'https:'
        ? getSslDetails(urlObject.hostname)
        : Promise.resolve({ valid: false, error: 'Site is not secure (does not use HTTPS).' }),
    ]);

    const $ = cheerio.load(htmlContent);
    const mainDomain = getDomain(urlObject.hostname);
    let riskScore = 0;
    
    if (!sslDetails.valid) {
      riskScore += 30;
    }

    const suspiciousKeywords = ['verify', 'account', 'update', 'secure', 'bank', 'login', 'password', 'urgent', 'suspension', 'confirm'];
    const bodyText = $('body').text().toLowerCase();
    let keywordCount = 0;
    suspiciousKeywords.forEach(keyword => {
      if (bodyText.includes(keyword)) {
        keywordCount++;
      }
    });
    riskScore += Math.min(keywordCount * 5, 25);

    $('form').each((i, elem) => {
      const action = $(elem).attr('action');
      if (action) {
        try {
          const formActionUrl = new URL(action, urlObject.origin);
          const formActionDomain = getDomain(formActionUrl.hostname);
          if (formActionDomain !== mainDomain) {
            riskScore += 40;
          }
        } catch (e) {
        }
      }
    });

    const resourceDomains = new Set<string>();
    $('script[src], link[href], img[src]').each((i, elem) => {
        const src = $(elem).attr('src') || $(elem).attr('href');
        if (src) {
            try {
                const resourceUrl = new URL(src, urlObject.origin);
                const resourceDomain = getDomain(resourceUrl.hostname);
                if (resourceDomain && resourceDomain !== mainDomain) {
                    resourceDomains.add(resourceDomain);
                }
            } catch (e) {
            }
        }
    });
    if (resourceDomains.size > 5) {
        riskScore += 15;
    }
    
    const canonical = $('link[rel="canonical"]').attr('href');
    if (canonical) {
        try {
            const canonicalUrl = new URL(canonical, urlObject.origin);
            const canonicalDomain = getDomain(canonicalUrl.hostname);
            if (canonicalDomain !== mainDomain) {
                riskScore += 10;
            }
        } catch(e) {/* ignore */}
    }

    riskScore = Math.round(Math.max(0, Math.min(riskScore, 100)));

    const hasPasswordField = $('input[type="password"]').length > 0;
    const hasExternalFormAction = $('form').filter((i, elem) => {
        const action = $(elem).attr('action');
        if (action) {
            try {
                const formActionUrl = new URL(action, urlObject.origin);
                return getDomain(formActionUrl.hostname) !== mainDomain;
            } catch (e) { return false; }
        }
        return false;
    }).length > 0;

    if (!sslDetails.valid && hasPasswordField && hasExternalFormAction) {
        riskScore = Math.max(riskScore, 90);
    }

    const result: AnalysisResult = {
      url: urlObject.href,
      ssl: sslDetails,
      htmlSummary: summaryResult.summary,
      suggestions: suggestionsResult.suggestions,
      riskScore,
      createdAt: new Date().toISOString(),
    };
    
    const dataToSave = { ...result, createdAt: serverTimestamp() };

    setDoc(cacheDocRef, dataToSave).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: cacheDocRef.path,
        operation: 'create',
        requestResourceData: dataToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    if (currentUser) {
        await saveAnalysisToHistory(currentUser.uid, result);
    }

    return { success: true, data: result };

  } catch (error: any) {
    console.error('Analysis failed:', error);

    if (error.name === 'AbortError') {
      return { success: false, error: 'The request timed out. The website may be slow, offline, or blocking requests.' };
    }
    if (error.cause && typeof error.cause === 'object' && 'code' in error.cause) {
      if (error.cause.code === 'ENOTFOUND') {
        return { success: false, error: 'Could not find the website. Please check the URL for typos.' };
      }
    }
    if (error instanceof z.ZodError) {
        return { success: false, error: 'AI model returned an unexpected data structure. Please try again.' };
    }

    return { success: false, error: error.message || 'An unexpected error occurred during analysis.' };
  }
}
