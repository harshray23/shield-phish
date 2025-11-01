'use server';
/**
 * @fileOverview Summarizes HTML content for phishing analysis.
 *
 * - summarizeHtmlForAnalysis - A function that summarizes the HTML content of a website.
 * - SummarizeHtmlForAnalysisInput - The input type for the summarizeHtmlForAnalysis function.
 * - SummarizeHtmlForAnalysisOutput - The return type for the summarizeHtmlForAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeHtmlForAnalysisInputSchema = z.object({
  htmlContent: z
    .string()
    .describe('The HTML content of the website to be analyzed.'),
});
export type SummarizeHtmlForAnalysisInput = z.infer<
  typeof SummarizeHtmlForAnalysisInputSchema
>;

const SummarizeHtmlForAnalysisOutputSchema = z.object({
  summary: z.string().describe('A summary of the HTML content.'),
});
export type SummarizeHtmlForAnalysisOutput = z.infer<
  typeof SummarizeHtmlForAnalysisOutputSchema
>;

export async function summarizeHtmlForAnalysis(
  input: SummarizeHtmlForAnalysisInput
): Promise<SummarizeHtmlForAnalysisOutput> {
  return summarizeHtmlForAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeHtmlForAnalysisPrompt',
  input: {schema: SummarizeHtmlForAnalysisInputSchema},
  output: {schema: SummarizeHtmlForAnalysisOutputSchema},
  prompt: `You are a security analyst specializing in phishing detection. Analyze the following HTML content and provide a concise summary of its structure, highlighting any suspicious elements or potential red flags. Be concise, and focus on aspects of the HTML that might be relevant to phishing.  Pay special attention to forms, links, and scripts.

HTML Content:
{{{htmlContent}}}`,
});

const summarizeHtmlForAnalysisFlow = ai.defineFlow(
  {
    name: 'summarizeHtmlForAnalysisFlow',
    inputSchema: SummarizeHtmlForAnalysisInputSchema,
    outputSchema: SummarizeHtmlForAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
