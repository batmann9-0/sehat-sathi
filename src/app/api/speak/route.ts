// src/app/api/speak/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const text = (body as any)?.text;
  const lang = (body as any)?.lang;

  if (
    typeof text !== 'string' ||
    text.trim().length === 0 ||
    text.length > 6000 ||
    (lang !== undefined && lang !== 'ur' && lang !== 'en')
  ) {
    return NextResponse.json(
      { error: 'A text of at most 6000 characters and lang ur or en are required.' },
      { status: 400 }
    );
  }

  const finalLang = lang === 'ur' ? 'ur' : 'en';

  if (!process.env.SPEAK_PROXY_URL) {
    return NextResponse.json({ error: 'Speech is not configured on the server.' }, { status: 503 });
  }

  try {
    const proxyRes = await fetch(process.env.SPEAK_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '1',
        'x-bridge-token': process.env.SPEAK_PROXY_TOKEN ?? '',
      },
      body: JSON.stringify({ text, lang: finalLang }),
    });

    if (!proxyRes.ok) {
      return NextResponse.json({ error: 'Speech bridge failed.' }, { status: 502 });
    }

    const data = await proxyRes.json();
    if (!data || typeof data.audioBase64 !== 'string') {
      return NextResponse.json({ error: 'Speech bridge failed.' }, { status: 502 });
    }

    const buffer = Buffer.from(data.audioBase64, 'base64');
    return new Response(buffer, {
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  } catch {
    return NextResponse.json({ error: 'Speech bridge failed.' }, { status: 502 });
  }
}