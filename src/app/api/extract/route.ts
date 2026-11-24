/**
 * Sehat Sathi — POST /api/extract.
 *
 * Snap & Digitize: takes a document image URL, runs Qwen Prompt A
 * (vision model) via src/lib/qwen.ts and returns the structured
 * extraction. It never fakes a result: with no MODELSCOPE_API_TOKEN it
 * answers 503, never invented JSON.
 *
 * Persistence is a later step: Document / TestResult / Medication rows
 * are written once `prisma generate` + `prisma db push` have run
 * against a configured DATABASE_URL.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { extractDocument } from '@/lib/qwen';

const ExtractBody = z.object({
  imageUrl: z
    .string()
    .trim()
    .min(1, 'imageUrl is required — a publicly reachable image URL for the document photo.')
    .url('imageUrl must be a valid URL.')
    .refine((u) => u.startsWith('http://') || u.startsWith('https://'), {
      message: 'imageUrl must be an http(s) URL.',
    }),
});

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const parsed = ExtractBody.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid request body.' },
      { status: 400 },
    );
  }

  try {
    const extracted = await extractDocument(parsed.data.imageUrl);
    return NextResponse.json({ extracted });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Extraction failed.';
    if (message.includes('MODELSCOPE_API_TOKEN is not set')) {
      return NextResponse.json(
        { error: message + ' Add it to .env — Sehat Sathi does not fake AI results.' },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
