// src/lib/gemini.ts
import { PROMPT_A_EXTRACTOR } from './prompts';

export async function extractWithGemini(imageDataUrl: string): Promise<unknown> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const match = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid data URL format');
  }
  const [, mimeType, base64Data] = match;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
    method: 'POST',
    headers: {
      'x-goog-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { inline_data: { mime_type: mimeType, data: base64Data } },
            { text: PROMPT_A_EXTRACTOR },
          ],
        },
      ],
      generationConfig: { temperature: 0.1 },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API failed with status ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No text returned from Gemini API');
  }

  const cleaned = text.replace(/^```json\s*|\s*```$/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error('Failed to parse JSON from Gemini response');
  }
}