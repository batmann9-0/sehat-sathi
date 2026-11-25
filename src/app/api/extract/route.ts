// src/app/api/extract/route.ts
import { NextResponse } from 'next/server';
import { extractWithGemini } from '@/lib/gemini';
import { extractDocument } from '@/lib/qwen';
import { z } from 'zod';

const ExtractBody = z.object({
  imageUrl: z
    .string()
    .min(1)
    .url()
    .refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
      message: 'URL must start with http:// or https://',
    }),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  // NEW BEHAVIOR: imageDataUrl path
  if (
    typeof body === 'object' &&
    body !== null &&
    'imageDataUrl' in body &&
    typeof (body as any).imageDataUrl === 'string' &&
    (body as any).imageDataUrl.trim() !== ''
  ) {
    const imageDataUrl = (body as any).imageDataUrl;

    // Proxy bridge takes priority when configured
    if (process.env.EXTRACT_PROXY_URL) {
      try {
        const proxyRes = await fetch(process.env.EXTRACT_PROXY_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': '1',
            'x-bridge-token': process.env.EXTRACT_PROXY_TOKEN ?? '',
          },
          body: JSON.stringify({ imageDataUrl }),
        });

        if (!proxyRes.ok) {
          return NextResponse.json({ error: 'Extraction bridge failed.' }, { status: 502 });
        }

        const proxyBody = await proxyRes.json();
        return NextResponse.json(proxyBody, { status: 200 });
      } catch {
        return NextResponse.json({ error: 'Extraction bridge failed.' }, { status: 502 });
      }
    }

    // Fallback: direct Gemini call
    if (process.env.GEMINI_API_KEY) {
      try {
        const extraction = await extractWithGemini(imageDataUrl);
        return NextResponse.json({ ok: true, extraction }, { status: 200 });
      } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Extraction failed' }, { status: 502 });
      }
    } else {
      return NextResponse.json({ error: 'Extraction is not configured on the server.' }, { status: 503 });
    }
  }

  // ORIGINAL CONTRACT: ModelScope extraction path
  const parsed = ExtractBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Invalid request payload' },
      { status: 400 }
    );
  }

  const { imageUrl } = parsed.data;

  try {
    const extracted = await extractDocument(imageUrl);
    return NextResponse.json({ extracted }, { status: 200 });
  } catch (e: any) {
    const msg = e.message || 'Extraction failed';
    if (msg.includes('MODELSCOPE_API_TOKEN is not set')) {
      return NextResponse.json(
        { error: `${msg} Add it to .env — Sehat Sathi does not fake AI results.` },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}