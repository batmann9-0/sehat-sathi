import { describe, it, expect } from 'vitest';
import { GET as genericsGET } from '../../src/app/api/generics/route';
import { POST as processPOST } from '../../src/app/api/process/route';
import { POST as extractPOST } from '../../src/app/api/extract/route';
import type { ExtractedDocument } from '../../src/lib/qwen';

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

const demoExtraction: ExtractedDocument = {
  patientName: 'Demo Patient',
  documentDate: '2026-11-20',
  documentType: 'PRESCRIPTION',
  labName: 'Chughtai',
  bloodGroup: 'B+',
  testResults: [
    { testName: 'HbA1c', resultValue: '6.1', unit: '%', referenceRange: '4.0-5.6', isAbnormal: true, testDate: '2026-11-20' },
  ],
  medications: [{ brandName: 'Brufen 400', dosage: '400mg', frequency: 'BID', duration: '5 days' }],
  allergies: ['Sulfa'],
  chronicConditions: [],
  doctorName: 'Dr Demo',
};

describe('GET /api/generics — Sasta Badal', () => {
  it('lists all 4 mock generics with no brand query', async () => {
    const res = await genericsGET(new Request('http://localhost/api/generics'));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.generics).toHaveLength(4);
    expect(body.note).toContain('pharmacist');
  });

  it('finds Brufen 400 -> Ibuprofen, saving Rs 80 (mock price 120 - 40)', async () => {
    const res = await genericsGET(new Request('http://localhost/api/generics?brand=Brufen%20400'));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.found).toBe(true);
    expect(body.generic.genericName).toBe('Ibuprofen');
    expect(body.generic.savingPKR).toBe(80);
  });

  it('reports found:false for an unknown brand', async () => {
    const res = await genericsGET(new Request('http://localhost/api/generics?brand=NotARealDrug'));
    const body = await res.json();
    expect(body.found).toBe(false);
    expect(body.generic).toBeNull();
  });
});

describe('POST /api/process — Shield + Sasta Badal + SOS, no key needed', () => {
  it('flags the HbA1c duplicate, finds the generic, builds the SOS card, qwen null without a key', async () => {
    const req = new Request('http://localhost/api/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        newData: demoExtraction,
        existingProfile: { name: 'Demo Patient', emergencyContact: 'Ahmed — 0300 1234567' },
        history: [{ testName: 'HbA1c', testDate: daysAgoIso(10), labName: 'Aga Khan' }],
      }),
    });
    const res = await processPOST(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.duplicateAlerts).toHaveLength(1);
    expect(body.duplicateAlerts[0].moneySavedPKR).toBe(1200); // HbA1c at Chughtai
    expect(body.genericAlternatives).toHaveLength(1);
    expect(body.genericAlternatives[0].savingPKR).toBe(80);
    expect(body.sosCard.bloodGroup).toBe('B+');
    expect(body.sosCard.allergies).toContain('Sulfa');
    expect(body.sosCard.emergencyContact).toBe('Ahmed — 0300 1234567');
    // No MODELSCOPE_API_TOKEN in this env: Prompt B is honestly absent, not faked.
    expect(body.qwenReasoning).toBeNull();
    expect(body.qwenError).toBeNull();
  });

  it('rejects a missing newData with 400', async () => {
    const req = new Request('http://localhost/api/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await processPOST(req);
    expect(res.status).toBe(400);
  });

  it('rejects a non-JSON body with 400', async () => {
    const req = new Request('http://localhost/api/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });
    const res = await processPOST(req);
    expect(res.status).toBe(400);
  });
});

describe('POST /api/extract — no fake results without a key', () => {
  it('answers 503 (not invented JSON) when MODELSCOPE_API_TOKEN is unset', async () => {
    expect(process.env.MODELSCOPE_API_TOKEN).toBeUndefined();
    const req = new Request('http://localhost/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: 'https://example.com/report.jpg' }),
    });
    const res = await extractPOST(req);
    const body = await res.json();
    expect(res.status).toBe(503);
    expect(body.error).toContain('MODELSCOPE_API_TOKEN');
  });

  it('rejects a missing imageUrl with 400', async () => {
    const req = new Request('http://localhost/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await extractPOST(req);
    expect(res.status).toBe(400);
  });

  it('rejects a non-http(s) imageUrl with 400', async () => {
    const req = new Request('http://localhost/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: 'ftp://example.com/report.jpg' }),
    });
    const res = await extractPOST(req);
    expect(res.status).toBe(400);
  });
});
