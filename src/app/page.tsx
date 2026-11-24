/**
 * Sehat Sathi — minimal app shell (foundation build).
 *
 * This page is NOT the designed UI — the product design is approved
 * separately. It renders the project name, the 7 locked features, and
 * the demo values computed live from src/lib/demo-logic.ts against the
 * scripted demo dataset in src/lib/demo-data.ts, so the foundation can
 * be verified end to end. Plain markup only.
 */
import labsJson from '../../data/pakistan_labs.json';
import genericsJson from '../../data/pakistan_generics.json';
import {
  findDuplicateTests,
  findGeneric,
  buildSosCard,
  type Lab,
  type GenericEntry,
} from '@/lib/demo-logic';
import {
  demoProfile,
  demoHistory,
  demoNewTests,
  demoMedications,
  demoDoctorPrep,
} from '@/lib/demo-data';

const labs = labsJson as Lab[];
const generics = genericsJson as GenericEntry[];

const FEATURES: Array<{ title: string; blurb: string }> = [
  { title: 'Snap & Digitize', blurb: 'Photo a messy, handwritten report and get structured data (Qwen vision model, Prompt A).' },
  { title: 'Duplicate Test Shield', blurb: 'A test ordered again within 60 days is flagged, with the money you would save.' },
  { title: 'Vernacular Medication Translator', blurb: 'Prescription jargon turned into simple Roman Urdu you can follow (Qwen chat model, Prompt B).' },
  { title: 'Auto-SOS Emergency Card', blurb: 'Blood group, allergies and chronic conditions on one emergency card.' },
  { title: 'Lab Trust & Benchmarking', blurb: 'The lab on the document is checked against accredited trust tiers.' },
  { title: 'Sasta Badal', blurb: 'A branded medicine and its cheaper generic alternative, side by side.' },
  { title: 'Doctor Visit Prep', blurb: 'Speak your symptoms in Roman Urdu, get a short professional summary for the doctor.' },
];

export default function Home() {
  const duplicateAlerts = findDuplicateTests(demoNewTests, demoHistory, labs);
  const genericAlternatives = demoMedications
    .map((m) => findGeneric(m.brandName, generics))
    .filter((g): g is NonNullable<typeof g> => g !== null);
  const totalGenericSaving = genericAlternatives.reduce((sum, g) => sum + g.savingPKR, 0);
  const sosCard = buildSosCard(demoProfile);

  return (
    <main>
      <h1>Sehat Sathi</h1>
      <p>
        AI Patient Advocate for Pakistan — built with Qwen only. Your reports,
        prescriptions and medicines, explained in simple Roman Urdu.
      </p>
      <p>
        <strong>Safety rule: Explain, don&rsquo;t diagnose.</strong> Sehat Sathi
        explains your documents — your doctor decides.
      </p>

      <h2>The 7 features</h2>
      <ol>
        {FEATURES.map((f) => (
          <li key={f.title}>
            <strong>{f.title}</strong> — {f.blurb}
          </li>
        ))}
      </ol>

      <h2>Demo values (computed live by the demo logic)</h2>

      <h3>Duplicate Test Shield</h3>
      {duplicateAlerts.length === 0 ? (
        <p>No duplicate tests in the demo window.</p>
      ) : (
        <ul>
          {duplicateAlerts.map((a) => (
            <li key={a.testName}>
              {a.testName} — already done {a.daysAgo} days ago
              {a.previousLab ? ` at ${a.previousLab}` : ''}. Money saved by not
              repeating it: Rs {a.moneySavedPKR.toLocaleString('en-PK')}.
            </li>
          ))}
        </ul>
      )}

      <h3>Sasta Badal</h3>
      <ul>
        {genericAlternatives.map((g) => (
          <li key={g.brandedName}>
            {g.brandedName} (Rs {g.estimatedBrandedPrice}) &rarr; {g.genericName} (Rs{' '}
            {g.estimatedGenericPrice}) — saving Rs {g.savingPKR}. Confirm with your
            pharmacist.
          </li>
        ))}
      </ul>
      <p>Total Sasta Badal saving in the demo: Rs {totalGenericSaving}.</p>

      <h3>Auto-SOS Emergency Card</h3>
      <pre>{sosCard.displayText}</pre>

      <h3>Doctor Visit Prep (demo example)</h3>
      <p>
        <em>{demoDoctorPrep.symptomsRomanUrdu}</em>
      </p>
      <ul>
        {demoDoctorPrep.summaryBullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </main>
  );
}
