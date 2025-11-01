'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Analyze this URL and classify it as "Safe" or "Phishing".
    URL: ${url}
    Give a JSON response like this:
    {
      "result": "Safe or Phishing",
      "reason": "short reason why"
    }`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();

    return new Response(JSON.stringify({ text }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
