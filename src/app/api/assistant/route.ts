// src/app/api/assistant/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const message = (body as any)?.message;
  const lang = (body as any)?.lang;
  const history = (body as any)?.history;

  if (
    typeof message !== 'string' ||
    message.trim().length === 0 ||
    message.length > 2000 ||
    (lang !== undefined && lang !== 'ur' && lang !== 'en') ||
    (history !== undefined && !Array.isArray(history))
  ) {
    return NextResponse.json(
      { error: 'A message of at most 2000 characters, lang ur or en, and optional history array are required.' },
      { status: 400 }
    );
  }

  const finalLang = lang === 'ur' ? 'ur' : 'en';

  if (!process.env.ASSISTANT_PROXY_URL) {
    return NextResponse.json({ error: 'Assistant is not configured on the server.' }, { status: 503 });
  }

  try {
    const proxyRes = await fetch(process.env.ASSISTANT_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '1',
        'x-bridge-token': process.env.ASSISTANT_PROXY_TOKEN ?? '',
      },
      body: JSON.stringify({ message, lang: finalLang, history }),
    });

    if (!proxyRes.ok) {
      return NextResponse.json({ error: 'Assistant bridge failed.' }, { status: 502 });
    }

    const data = await proxyRes.json();
    if (!data || typeof data.reply !== 'string') {
      return NextResponse.json({ error: 'Assistant bridge failed.' }, { status: 502 });
    }

    return NextResponse.json({ reply: data.reply }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Assistant bridge failed.' }, { status: 502 });
  }
}