'use server';

/**
 * @fileOverview This file defines a Genkit flow that leverages an LLM to analyze website URLs and HTML structures,
 * receiving suggestions on how to improve the phishing detection rules and indicators within the ShieldPhish system.
 *
 * - suggestImprovements - A function that accepts a URL and HTML content and returns improvement suggestions for phishing detection.
 * - SuggestImprovementsInput - The input type for the suggestImprovements function.
 * - SuggestImprovementsOutput - The return type for the suggestImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestImprovementsInputSchema = z.object({
  url: z.string().describe('The URL of the website to analyze.'),
  htmlContent: z.string().describe('The HTML content of the website to analyze.'),
});
export type SuggestImprovementsInput = z.infer<typeof SuggestImprovementsInputSchema>;

const SuggestImprovementsOutputSchema = z.object({
  suggestions: z.string().describe('Suggestions for improving phishing detection rules and indicators.'),
});
export type SuggestImprovementsOutput = z.infer<typeof SuggestImprovementsOutputSchema>;

export async function suggestImprovements(input: SuggestImprovementsInput): Promise<SuggestImprovementsOutput> {
  return suggestImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestImprovementsPrompt',
  input: {schema: SuggestImprovementsInputSchema},
  output: {schema: SuggestImprovementsOutputSchema},
  prompt: `You are a cybersecurity expert specializing in phishing detection.

  Analyze the following website URL and HTML content and provide suggestions on how to improve the phishing detection rules and indicators within the ShieldPhish system.

  URL: {{{url}}}
  HTML Content: {{{htmlContent}}}

  Here are some examples of known phishing URLs. Use these as a reference to identify similar patterns in the provided URL.
  - https://tjarjetacredbhd2025.imi.lat/
  - https://cyberflarezonex.ru.com/bin/
  - https://allegro.marshalle.shop
  - https://cooppank-ee.earnity.co.tz
  - https://swedbank-eesti.turvalinekonto.info
  - https://cmneo.xyz
  - https://inicio-off.shop/
  - https://eligible-hyperliquid.xyz/
  - http://www.exodus-wallet.co.com

  Provide specific recommendations for identifying phishing attempts based on the URL and HTML structure. Focus on potential red flags and patterns, like the use of specific terms often associated with phishing scams, suspicious URLs, or unusual HTML structures. Return your suggestions in a single string.
`,
});

const suggestImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestImprovementsFlow',
    inputSchema: SuggestImprovementsInputSchema,
    outputSchema: SuggestImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
