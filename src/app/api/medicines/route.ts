// src/app/api/medicines/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchMedicines, getMedicineDetails } from '@/lib/medicines';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const id = searchParams.get('id');

  if (q) {
    if (q.length < 2 || q.length > 60) {
      return NextResponse.json({ message: 'Query must be between 2 and 60 characters.' }, { status: 400 });
    }
    try {
      const data = await searchMedicines(q);
      return NextResponse.json({
        query: q,
        count: data.results.length,
        total: data.total,
        results: data.results,
      });
    } catch {
      return NextResponse.json({ message: 'Medicine search is unavailable right now — please try again shortly.' }, { status: 502 });
    }
  }

  if (id) {
    try {
      const data = await getMedicineDetails(id);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({ message: 'Medicine search is unavailable right now — please try again shortly.' }, { status: 502 });
    }
  }

  return NextResponse.json({ message: 'Provide either ?q or ?id' }, { status: 400 });
}