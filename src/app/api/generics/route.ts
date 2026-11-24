/**
 * Sehat Sathi — GET /api/generics (Sasta Badal).
 *
 *   GET /api/generics                 -> all branded -> generic mappings
 *   GET /api/generics?brand=Brufen 400 -> the matching entry + savingPKR
 *
 * Prices are the hackathon mock data in data/pakistan_generics.json —
 * illustrative mock prices per 10-tablet strip (see README, "Mock data").
 * Every result carries the safety note: confirm with your pharmacist.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import genericsJson from '../../../../data/pakistan_generics.json';
import { findGeneric, type GenericEntry } from '@/lib/demo-logic';

const generics = genericsJson as GenericEntry[];

const BrandQuery = z.string().trim().min(1).max(120);

const SAFETY_NOTE =
  'Prices are illustrative mock prices per 10-tablet strip. Always confirm a generic alternative with your pharmacist.';

export async function GET(req: Request) {
  const rawBrand = new URL(req.url).searchParams.get('brand');
  if (!rawBrand) {
    return NextResponse.json({ generics, note: SAFETY_NOTE });
  }
  const parsed = BrandQuery.safeParse(rawBrand);
  if (!parsed.success) {
    return NextResponse.json({ error: 'brand query parameter is invalid.' }, { status: 400 });
  }
  const found = findGeneric(parsed.data, generics);
  if (!found) {
    return NextResponse.json({ found: false, brand: parsed.data, generic: null, note: SAFETY_NOTE });
  }
  return NextResponse.json({ found: true, brand: parsed.data, generic: found, note: SAFETY_NOTE });
}
