import { describe, it, expect } from 'vitest';
import {
  findDuplicateTests,
  findGeneric,
  buildSosCard,
  type Lab,
  type GenericEntry,
} from '../../src/lib/demo-logic';
import labsJson from '../../data/pakistan_labs.json';
import genericsJson from '../../data/pakistan_generics.json';

const labs = labsJson as Lab[];
const generics = genericsJson as GenericEntry[];

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

describe('findDuplicateTests — Duplicate Test Shield', () => {
  it('flags HbA1c done 10 days ago at Aga Khan and saves Rs 1,200 (Chughtai repeat price)', () => {
    const alerts = findDuplicateTests(
      [{ testName: 'HbA1c', labName: 'Chughtai' }],
      [{ testName: 'HbA1c', testDate: daysAgoIso(10), labName: 'Aga Khan' }],
      labs,
    );
    expect(alerts).toHaveLength(1);
    expect(alerts[0].testName).toBe('HbA1c');
    expect(alerts[0].previousLab).toBe('Aga Khan');
    expect(alerts[0].daysAgo).toBe(10);
    expect(alerts[0].moneySavedPKR).toBe(1200);
  });

  it('falls back to the previous lab price when no repeat lab is given', () => {
    const alerts = findDuplicateTests(
      ['CBC'],
      [{ testName: 'CBC', testDate: daysAgoIso(5), labName: 'Aga Khan' }],
      labs,
    );
    expect(alerts).toHaveLength(1);
    expect(alerts[0].moneySavedPKR).toBe(1200); // CBC at Aga Khan
  });

  it('does not flag a test older than the 60-day window (90 days)', () => {
    const alerts = findDuplicateTests(
      [{ testName: 'HbA1c', labName: 'Chughtai' }],
      [{ testName: 'HbA1c', testDate: daysAgoIso(90), labName: 'Aga Khan' }],
      labs,
    );
    expect(alerts).toHaveLength(0);
  });

  it('does not flag a test that was never done', () => {
    const alerts = findDuplicateTests(
      [{ testName: 'Lipid Profile', labName: 'Chughtai' }],
      [{ testName: 'HbA1c', testDate: daysAgoIso(10), labName: 'Aga Khan' }],
      labs,
    );
    expect(alerts).toHaveLength(0);
  });
});

describe('findGeneric — Sasta Badal', () => {
  it('maps Brufen 400 to Ibuprofen with a saving of Rs 80 (120 - 40)', () => {
    const result = findGeneric('Brufen 400', generics);
    expect(result).not.toBeNull();
    expect(result?.genericName).toBe('Ibuprofen');
    expect(result?.activeIngredient).toBe('Ibuprofen');
    expect(result?.savingPKR).toBe(80);
  });

  it('maps Augmentin 625 with a saving of Rs 270 (450 - 180)', () => {
    const result = findGeneric('Augmentin 625', generics);
    expect(result?.genericName).toBe('Amoxicillin/Clavulanate');
    expect(result?.savingPKR).toBe(270);
  });

  it('demo prescription total saving is Rs 350 (Augmentin 270 + Brufen 80)', () => {
    const total = ['Augmentin 625', 'Brufen 400']
      .map((b) => findGeneric(b, generics))
      .reduce((sum, g) => sum + (g?.savingPKR ?? 0), 0);
    expect(total).toBe(350);
  });

  it('is case-insensitive and tolerates a bare brand name', () => {
    expect(findGeneric('brufen', generics)?.genericName).toBe('Ibuprofen');
  });

  it('returns null for an unknown brand', () => {
    expect(findGeneric('SomeUnknownDrug 10', generics)).toBeNull();
  });
});

describe('buildSosCard — Auto-SOS Emergency Card', () => {
  it('builds a card with blood group, allergies and conditions', () => {
    const card = buildSosCard({
      name: 'Demo Patient',
      bloodGroup: 'B+',
      allergies: ['Sulfa'],
      chronicConditions: ['Type 2 Diabetes'],
      emergencyContact: 'Family — 0300-0000000 (demo)',
    });
    expect(card.bloodGroup).toBe('B+');
    expect(card.allergies).toContain('Sulfa');
    expect(card.chronicConditions).toContain('Type 2 Diabetes');
    expect(card.displayText).toContain('Blood Group: B+');
    expect(card.displayText).toContain('Sulfa');
    expect(card.displayText).toContain('Type 2 Diabetes');
    expect(card.qrPayload).toBe(card.displayText);
  });

  it('handles an empty profile without throwing', () => {
    const card = buildSosCard({});
    expect(card.bloodGroup).toBeNull();
    expect(card.displayText).toContain('None known');
  });
});
