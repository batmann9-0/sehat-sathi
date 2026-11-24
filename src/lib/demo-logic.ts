/**
 * Sehat Sathi — pure demo logic. NO AI dependency, fully unit-testable.
 *
 * These functions implement the deterministic parts of the demo:
 *  - Duplicate Test Shield (60-day window + money saved)
 *  - Sasta Badal generic finder
 *  - Auto-SOS emergency card builder
 * The Qwen reasoner (Prompt B) can propose the same outputs, but the
 * demo path uses these so the 60-second demo never depends on a model call.
 */

export interface LabTestOffer {
  testName: string;
  pricePKR: number;
}

export interface Lab {
  id: string;
  name: string;
  city: string;
  trustTier: number;
  testsOffered: LabTestOffer[];
}

export interface GenericEntry {
  brandedName: string;
  genericName: string;
  activeIngredient: string;
  estimatedBrandedPrice: number;
  estimatedGenericPrice: number;
  category: string;
}

export interface NewTestRequest {
  testName: string;
  /** Lab the patient is about to use for the repeat — its price is the money saved. */
  labName?: string;
}

export interface HistoryTest {
  testName: string;
  testDate: string | Date;
  labName?: string | null;
}

export interface DuplicateAlert {
  testName: string;
  previousDate: string; // ISO YYYY-MM-DD
  previousLab: string | null;
  daysAgo: number;
  moneySavedPKR: number;
}

export interface PatientProfileLike {
  name?: string | null;
  bloodGroup?: string | null;
  allergies?: string[];
  chronicConditions?: string[];
  emergencyContact?: string | null;
}

export interface SosCard {
  name: string | null;
  bloodGroup: string | null;
  allergies: string[];
  chronicConditions: string[];
  emergencyContact: string | null;
  displayText: string;
  /** Plain-text payload for a future QR code (a later QR-rendering step). */
  qrPayload: string;
}

export const DUPLICATE_WINDOW_DAYS = 60;

function normalizeTestName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

function priceAtLab(labs: Lab[], labName: string | undefined | null, testName: string): number | null {
  if (!labName) return null;
  const lab = labs.find((l) => normalizeTestName(l.name) === normalizeTestName(labName));
  const offer = lab?.testsOffered.find(
    (t) => normalizeTestName(t.testName) === normalizeTestName(testName),
  );
  return offer ? offer.pricePKR : null;
}

/**
 * Duplicate Test Shield.
 *
 * For each newly ordered test, find the most recent matching test in
 * history within the last 60 days. Money saved is the price of repeating
 * that test: the price at the lab the patient is about to use
 * (newTest.labName) when known, otherwise the price at the lab where
 * the previous test was done, otherwise 0.
 */
export function findDuplicateTests(
  newTests: Array<NewTestRequest | string>,
  history: HistoryTest[],
  labs: Lab[],
  now: Date = new Date(),
): DuplicateAlert[] {
  const alerts: DuplicateAlert[] = [];

  for (const raw of newTests) {
    const request: NewTestRequest = typeof raw === 'string' ? { testName: raw } : raw;

    const candidates = history
      .filter((h) => normalizeTestName(h.testName) === normalizeTestName(request.testName))
      .map((h) => ({ h, date: toDate(h.testDate) }))
      .filter(({ date }) => !Number.isNaN(date.getTime()))
      .map(({ h, date }) => ({
        h,
        date,
        daysAgo: Math.floor((now.getTime() - date.getTime()) / 86_400_000),
      }))
      .filter(({ daysAgo }) => daysAgo >= 0 && daysAgo <= DUPLICATE_WINDOW_DAYS)
      .sort((a, b) => a.daysAgo - b.daysAgo);

    if (candidates.length === 0) continue;

    const mostRecent = candidates[0];
    const moneySavedPKR =
      priceAtLab(labs, request.labName, request.testName) ??
      priceAtLab(labs, mostRecent.h.labName, request.testName) ??
      0;

    alerts.push({
      testName: request.testName,
      previousDate: mostRecent.date.toISOString().slice(0, 10),
      previousLab: mostRecent.h.labName ?? null,
      daysAgo: mostRecent.daysAgo,
      moneySavedPKR,
    });
  }

  return alerts;
}

/** Sasta Badal: find the generic alternative for a branded medicine. */
export function findGeneric(
  brandName: string,
  generics: GenericEntry[],
): (GenericEntry & { savingPKR: number }) | null {
  const needle = brandName.trim().toLowerCase();
  if (!needle) return null;

  const entry =
    generics.find((g) => g.brandedName.trim().toLowerCase() === needle) ??
    generics.find(
      (g) =>
        needle.startsWith(g.brandedName.trim().toLowerCase()) ||
        g.brandedName.trim().toLowerCase().startsWith(needle),
    );

  if (!entry) return null;
  return {
    ...entry,
    savingPKR: Math.max(0, entry.estimatedBrandedPrice - entry.estimatedGenericPrice),
  };
}

/** Auto-SOS Emergency Card: the data a QR / lock-screen card renders. */
export function buildSosCard(profile: PatientProfileLike): SosCard {
  const allergies = [...(profile.allergies ?? [])];
  const chronicConditions = [...(profile.chronicConditions ?? [])];
  const bloodGroup = profile.bloodGroup ?? null;
  const emergencyContact = profile.emergencyContact ?? null;
  const name = profile.name ?? null;

  const lines = [
    'SEHAT SATHI — EMERGENCY CARD',
    name ? `Name: ${name}` : null,
    `Blood Group: ${bloodGroup ?? 'Unknown'}`,
    `Allergies: ${allergies.length ? allergies.join(', ') : 'None known'}`,
    `Chronic Conditions: ${chronicConditions.length ? chronicConditions.join(', ') : 'None known'}`,
    emergencyContact ? `Emergency Contact: ${emergencyContact}` : null,
  ].filter((l): l is string => l !== null);

  const displayText = lines.join('\n');

  return {
    name,
    bloodGroup,
    allergies,
    chronicConditions,
    emergencyContact,
    displayText,
    qrPayload: displayText,
  };
}
