/**
 * Sehat Sathi — scripted 60-second demo story. DEMO DATA ONLY.
 *
 * One patient, one story (from the buildathon plan): a crumpled
 * prescription orders CBC + HbA1c and prescribes Augmentin 625mg TDS
 * and Brufen 400mg, for a patient who is allergic to Sulfa, has blood
 * group B+ and Type 2 Diabetes — and who already had an HbA1c done
 * 10 days ago at Aga Khan, which is what makes the Duplicate Test
 * Shield fire in the demo.
 *
 * Everything here is hand-written demo data — no real patient, no real
 * document, no AI call. The Roman Urdu strings below are demo strings
 * written for the pitch, in the same style Prompt B is asked to
 * produce live. They explain the prescription as written; they are
 * not medical advice for any real person.
 *
 * Dates are computed relative to "now" at load/render time so the
 * history test always sits inside the 60-day Duplicate Shield window,
 * exactly as the demo-logic tests do.
 */
import type {
  HistoryTest,
  NewTestRequest,
  PatientProfileLike,
} from './demo-logic';

/** Full ISO timestamp `days` days before now (same helper style as the tests). */
export function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

/** The demo patient. Clearly a demo profile, not a real person. */
export const demoProfile: PatientProfileLike = {
  name: 'Demo Patient',
  bloodGroup: 'B+',
  allergies: ['Sulfa'],
  chronicConditions: ['Type 2 Diabetes'],
  emergencyContact: 'Family — 0300-0000000 (demo)',
};

/**
 * The demo patient's history: one HbA1c, 10 days ago, at Aga Khan.
 * Lab names match data/pakistan_labs.json exactly ("Aga Khan",
 * "Chughtai") because the price lookup matches lab names.
 */
export const demoHistory: HistoryTest[] = [
  { testName: 'HbA1c', testDate: daysAgoIso(10), labName: 'Aga Khan' },
];

/** Tests ordered on the new crumpled prescription, at the lab the patient is about to use. */
export const demoNewTests: NewTestRequest[] = [
  { testName: 'CBC', labName: 'Chughtai' },
  { testName: 'HbA1c', labName: 'Chughtai' },
];

export interface DemoMedication {
  /** Matches a brandedName in data/pakistan_generics.json where a generic exists. */
  brandName: string;
  dosage: string;
  /** As written on the prescription (TDS, BD, ...). */
  frequency: string;
  duration: string;
}

/** Medications on the new crumpled prescription. */
export const demoMedications: DemoMedication[] = [
  { brandName: 'Augmentin 625', dosage: '625mg', frequency: 'TDS', duration: '5 days' },
  { brandName: 'Brufen 400', dosage: '400mg', frequency: 'BD', duration: '3 days' },
];

export interface DemoTranslatedInstruction {
  brandName: string;
  /** Hand-written demo string — the style Prompt B produces live. */
  instructionRomanUrdu: string;
  warning: string | null;
}

/**
 * Vernacular Medication Translator — demo output for the prescription
 * above. Roman Urdu, timing in everyday words, warnings as written in
 * the plan's demo style. Explain, don't diagnose.
 */
export const demoTranslatedInstructions: DemoTranslatedInstruction[] = [
  {
    brandName: 'Augmentin 625',
    instructionRomanUrdu:
      'Augmentin ki ek goli din mein teen baar — nashte, dopahar aur raat ke khanay ke baad — lein. Poora 5 din ka course mukammal karein, beech mein na chhorein.',
    warning:
      'Aap ki allergy Sulfa hai — Augmentin mein Sulfa nahi hota, lekin koi bhi nayi dawa shuru karne se pehle apne doctor ya pharmacist ko apni Sulfa allergy zaroor batayein.',
  },
  {
    brandName: 'Brufen 400',
    instructionRomanUrdu:
      'Brufen ki ek goli din mein do baar — nashte aur raat ke khanay ke baad — lein, sirf 3 din ke liye.',
    warning: 'Bhookay pait bilkul na lein — khaali pait lene se pait mein jalan ya dard ho sakta hai.',
  },
];

/** What Prompt A would extract from the crumpled prescription — the demo's Step 1. */
export const demoPrescriptionSummary = {
  documentType: 'PRESCRIPTION',
  sourceNote: 'Crumpled handwritten prescription (demo document — no real photo, no AI call in this flow)',
  patientName: demoProfile.name,
  allergiesWrittenOnPrescription: ['Sulfa'],
  bloodGroup: 'B+',
  chronicConditions: ['Type 2 Diabetes'],
  orderedTests: demoNewTests.map((t) => t.testName),
  medications: demoMedications,
} as const;

/**
 * Doctor Visit Prep — demo example. The patient speaks in Roman Urdu;
 * Sehat Sathi structures it into a short professional summary the
 * doctor can read in seconds. Structuring only — no diagnosis.
 */
export const demoDoctorPrep = {
  symptomsRomanUrdu:
    'Doctor sahab, mujhe teen din se tez bukhaar hai, poore jism mein dard rehta hai, aur raat ko khansi zyada ho jaati hai jis se neend kharab hoti hai.',
  summaryBullets: [
    'High fever for the past 3 days',
    'Generalised body aches for 3 days',
    'Cough, worse at night, disturbing sleep',
  ],
} as const;
