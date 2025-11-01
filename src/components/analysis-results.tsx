
import { CheckCircle2, AlertTriangle, ShieldCheck, ShieldAlert, FileText, ClipboardList, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { AnalysisResult } from '@/lib/types';
import { cn } from '@/lib/utils';
import { FormattedSuggestions } from './formatted-suggestions';

interface AnalysisResultsProps {
  results: AnalysisResult;
}

function ResultPill({ isPhishing }: { isPhishing: boolean }) {
    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium",
            !isPhishing ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
        )}>
            {!isPhishing ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
            {isPhishing ? 'Phishing Detected' : 'Seems Legitimate'}
        </span>
    );
}

function RiskIndicator({ score, riskLevel }: { score: number, riskLevel: string }) {
  let riskColor = 'bg-green-500';
  let textColor = 'text-green-300';
  
  switch(riskLevel.toUpperCase()) {
    case 'CRITICAL':
    case 'HIGH':
      riskColor = 'bg-red-500';
      textColor = 'text-red-300';
      break;
    case 'MEDIUM':
      riskColor = 'bg-yellow-500';
      textColor = 'text-yellow-300';
      break;
    case 'LOW':
    default:
      riskColor = 'bg-green-500';
      textColor = 'text-green-300';
      break;
  }

  return (
    <div className='text-center my-8'>
      <h2 className="font-headline text-2xl font-bold mb-4">Overall Risk Assessment</h2>
      <div className="max-w-md mx-auto">
        <Progress value={score} className="h-3 bg-primary/10 [&>*]:transition-all [&>*]:duration-500" indicatorClassName={riskColor} />
        <div className="flex justify-between text-sm font-medium mt-2 text-muted-foreground">
            <p>Risk Score: <span className='font-bold text-foreground'>{score} / 100</span></p>
            <p>Level: <span className={cn('font-bold', textColor)}>{riskLevel}</span></p>
        </div>
      </div>
    </div>
  );
}


export function AnalysisResults({ results }: AnalysisResultsProps) {
  const { url, riskScore, ssl, htmlSummary, suggestions } = results;

  const isPhishing = riskScore > 40;
  
  const riskLevel = riskScore > 80 ? 'Critical' : riskScore > 60 ? 'High' : riskScore > 40 ? 'Medium' : 'Low';

  const sslStatusClass = ssl.valid ? 'text-green-400' : 'text-red-400';

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
        
      <RiskIndicator score={riskScore || 0} riskLevel={riskLevel} />

      <div className="text-center">
        <ResultPill isPhishing={isPhishing} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-custom-gradient card-hover-effect">
            <CardHeader>
            <CardTitle className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                AI Summary
            </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-sm">{htmlSummary}</p>
            </CardContent>
        </Card>

        <Card className="bg-custom-gradient card-hover-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-primary" />
                SSL Certificate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
                <span className={cn('font-semibold', sslStatusClass)}>{ssl.valid ? 'Valid & Trusted' : 'Invalid or Untrusted'}</span>
            </div>
            {ssl.error && <p className="text-red-400">{ssl.error}</p>}
            {ssl.valid && ssl.subject && (
                 <div className="pt-2 text-xs text-muted-foreground space-y-1">
                    <p><span className='font-semibold text-foreground'>Subject:</span> {ssl.subject.CN}</p>
                    <p><span className='font-semibold text-foreground'>Issuer:</span> {ssl.issuer.CN}</p>
                    <p><span className='font-semibold text-foreground'>Expires:</span> {new Date(ssl.valid_to).toLocaleDateString()}</p>
                 </div>
            )}
          </CardContent>
        </Card>
      </div>

       <Card className="bg-custom-gradient card-hover-effect">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1" className="border-none">
              <AccordionTrigger className="p-6 hover:no-underline">
                <CardTitle className="flex items-center gap-3">
                  <Lightbulb className="w-6 h-6 text-primary" />
                  AI-Powered Detection Insights
                </CardTitle>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <FormattedSuggestions suggestions={suggestions} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
       </Card>
    </div>
  );
}
