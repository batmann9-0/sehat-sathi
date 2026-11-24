// src/app/demo/page.tsx
import {
  demoNewTests,
  demoHistory,
  demoMedications,
  demoTranslatedInstructions,
} from "@/lib/demo-data";
import { findDuplicateTests, findGeneric } from "@/lib/demo-logic";
import type { Lab, GenericEntry } from "@/lib/demo-logic";
import labsJson from "../../../data/pakistan_labs.json";
import genericsJson from "../../../data/pakistan_generics.json";

const labs = labsJson as unknown as Lab[];
const generics = genericsJson as unknown as GenericEntry[];

const duplicates = findDuplicateTests(demoNewTests, demoHistory, labs);
const duplicateByName = new Map(duplicates.map((d) => [d.testName, d]));
const shieldSavingPKR = duplicates.reduce(
  (sum, d) => sum + (d.moneySavedPKR || 0),
  0,
);

type GenericMatch = GenericEntry & { savingPKR: number };

function genericFor(brandName: string): GenericMatch | null {
  const direct = findGeneric(brandName, generics);
  if (direct) return direct;

  const match = generics.find(
    (g) => g.brandedName.toLowerCase() === brandName.toLowerCase(),
  );
  if (!match) return null;

  return {
    ...match,
    savingPKR: match.estimatedBrandedPrice - match.estimatedGenericPrice,
  };
}

const alternatives = demoMedications
  .map((m) => ({ brandName: m.brandName, match: genericFor(m.brandName) }))
  .filter((a): a is { brandName: string; match: GenericMatch } => a.match !== null);

const sastaSavingPKR = alternatives.reduce(
  (sum, a) => sum + (a.match.savingPKR || 0),
  0,
);

const instructionByBrand = new Map(
  demoTranslatedInstructions.map((i) => [i.brandName, i]),
);

function IconShield() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3 l8 3 v6 c0 5 -3.5 8 -8 9 c-4.5 -1 -8 -4 -8 -9 v-6 z"
        stroke="var(--red)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ReportResultPage() {
  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Report result — Chughtai Lab</h1>
        <p className="page__subtitle">
          Filed from your prescription, checked against your earlier tests.
        </p>
      </div>

      <section className="section">
        <h2 className="section__title">Ordered tests</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Test</th>
              <th>Lab</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {demoNewTests.map((t, i) => {
              const dup = duplicateByName.get(t.testName);
              return (
                <tr key={`${t.testName}-${i}`}>
                  <td>
                    <span className="table__test">{t.testName}</span>
                    {dup && (
                      <span className="table__note">
                        Done {dup.daysAgo} days ago
                        {dup.previousLab ? ` at ${dup.previousLab}` : ""}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="table__meta">{t.labName ?? "Lab"}</span>
                  </td>
                  <td>
                    {dup ? (
                      <span className="stamp stamp--red">DUPLICATE</span>
                    ) : (
                      <span className="stamp stamp--gold">NEW</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {demoNewTests.length === 0 && (
              <tr>
                <td colSpan={3}>
                  <span className="table__meta">No tests on this prescription</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="section">
        <h2 className="section__title">Duplicate Shield</h2>
        <div className="alert-card">
          <div className="alert-card__head">
            <IconShield />
            <div className="alert-card__title">Avoided repeat tests</div>
          </div>
          <div className="alert-card__value">
            PKR {shieldSavingPKR.toLocaleString()}
          </div>
          <div className="alert-card__meta">
            {duplicates.length} duplicate{" "}
            {duplicates.length === 1 ? "test" : "tests"} already in your file
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">Sasta Badal</h2>
        {alternatives.length === 0 ? (
          <p className="note">No generic alternative found for these medicines.</p>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Generic</th>
                  <th>Price</th>
                  <th>You save</th>
                </tr>
              </thead>
              <tbody>
                {alternatives.map(({ brandName, match }) => (
                  <tr key={brandName}>
                    <td>
                      <span className="table__test">{brandName}</span>
                    </td>
                    <td>
                      <span className="table__test">{match.genericName}</span>
                      <span className="table__meta">
                        {match.activeIngredient}
                      </span>
                    </td>
                    <td>
                      <span className="table__meta">
                        PKR {match.estimatedBrandedPrice.toLocaleString()} →{" "}
                        PKR {match.estimatedGenericPrice.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className="text-saving">
                        PKR {match.savingPKR.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="divider" />
            <p className="text-saving">
              Total possible saving: PKR {sastaSavingPKR.toLocaleString()}
            </p>
          </>
        )}
        <p className="note" style={{ marginTop: 12 }}>
          Illustrative prices — confirm with your pharmacist.
        </p>
      </section>

      <section className="section">
        <h2 className="section__title">Medicines</h2>
        <div className="med-list">
          {demoMedications.map((m) => {
            const instruction = instructionByBrand.get(m.brandName);
            return (
              <div className="med-item" key={m.brandName}>
                <div className="med-item__head">
                  <div>
                    <div className="med-item__name">{m.brandName}</div>
                    <div className="med-item__meta">
                      {m.dosage} · {m.frequency} · {m.duration}
                    </div>
                  </div>
                </div>
                {instruction && (
                  <>
                    <div className="med-item__instruction">
                      <span className="med-item__instruction-label">
                        Roman Urdu
                      </span>
                      {instruction.instructionRomanUrdu}
                    </div>
                    {instruction.warning && (
                      <p className="note note--alert" style={{ marginTop: 8 }}>
                        {instruction.warning}
                      </p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="divider" />
      <p className="note">This is an organised summary, not a diagnosis.</p>
    </div>
  );
}