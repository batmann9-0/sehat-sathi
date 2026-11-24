// src/app/demo/page.tsx
import {
  demoProfile,
  demoPrescriptionSummary,
  demoMedications,
  demoTranslatedInstructions,
  demoNewTests,
  demoHistory,
} from "@/lib/demo-data";
import { findDuplicateTests, findGeneric } from "@/lib/demo-logic";
import type { Lab, GenericEntry } from "@/lib/demo-logic";
import labsJson from "../../../data/pakistan_labs.json";
import genericsJson from "../../../data/pakistan_generics.json";

const labs = labsJson as unknown as Lab[];
const generics = genericsJson as unknown as GenericEntry[];

const duplicates = findDuplicateTests(demoNewTests, demoHistory, labs);
const totalSavedPKR = duplicates.reduce(
  (sum, d) => sum + (d.moneySavedPKR || 0),
  0,
);

type GenericResult = GenericEntry & { savingPKR: number };
const genericByBrand = new Map<string, GenericResult>();
for (const med of demoMedications) {
  const g = findGeneric(med.brandName, generics);
  if (g) genericByBrand.set(med.brandName, g);
}
const sastaTotalPKR = Array.from(genericByBrand.values()).reduce(
  (sum, g) => sum + (g.savingPKR || 0),
  0,
);

const instructionByBrand = new Map(
  demoTranslatedInstructions.map((i) => [i.brandName, i]),
);

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 12 v7 a2 2 0 0 0 2 2 h12 a2 2 0 0 0 2 -2 v-7 M12 3 v13 M8 7 l4 -4 l4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3 l8 3 v6 c0 5 -3.5 8 -8 9 c-4.5 -1 -8 -4 -8 -9 v-6 z"
        stroke="var(--red)"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="#fbe7e5"
      />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 19 c0 -8 6 -14 14 -14 c0 8 -6 14 -14 14 z M5 19 l7 -7"
        stroke="var(--pine)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DemoPage() {
  const rx = demoPrescriptionSummary;
  const allergies = rx.allergiesWrittenOnPrescription?.length
    ? rx.allergiesWrittenOnPrescription
    : demoProfile.allergies ?? [];

  return (
    <>
      <section className="section">
        <h1>Report Result</h1>
        <p style={{ color: "var(--muted)" }}>
          What we filed from your latest snap.
        </p>
      </section>

      <section className="section">
        <div className="section__title">Your File</div>
        <ul className="file-list">
          <li className="file-card">
            <div className="file-card__head">
              <div className="file-card__title">
                Prescription · Chughtai
              </div>
              <span className="stamp stamp--pine">VERIFIED</span>
            </div>
            <div className="file-card__body">
              <span>{rx.documentType}</span>
              <span>{rx.patientName}</span>
              <span>
                {rx.orderedTests.length} test
                {rx.orderedTests.length === 1 ? "" : "s"} ordered
              </span>
            </div>
          </li>
        </ul>
      </section>

      <section className="section">
        <div className="section__title">Duplicate Shield</div>
        <div className="card sasta-total" style={{ background: "#fbe7e5" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <ShieldIcon />
            <div style={{ flex: 1 }}>
              <div className="sasta-total__title">
                Saved PKR {totalSavedPKR.toLocaleString()}
              </div>
              <div className="sasta-total__meta">
                {duplicates.length} duplicate{" "}
                {duplicates.length === 1 ? "test" : "tests"} skipped.
              </div>
            </div>
            <span className="stamp stamp--red">DUPLICATE</span>
          </div>
          {duplicates.length > 0 && (
            <ul className="sasta-total__list">
              {duplicates.map((d) => (
                <li key={d.testName}>
                  <strong>{d.testName}</strong> — already done {d.daysAgo} days
                  ago{d.previousLab ? ` at ${d.previousLab}` : ""}. Saved PKR{" "}
                  {d.moneySavedPKR.toLocaleString()}.
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="section">
        <div className="section__title">Medicines</div>
        <ul className="med-list">
          {demoMedications.map((m) => {
            const instruction = instructionByBrand.get(m.brandName);
            const generic = genericByBrand.get(m.brandName);
            return (
              <li key={m.brandName} className="card med-item">
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
                    <div className="instruction">
                      <span className="instruction__label">Roman Urdu</span>
                      <p>{instruction.instructionRomanUrdu}</p>
                    </div>
                    {instruction.warning && (
                      <div className="warning">⚠ {instruction.warning}</div>
                    )}
                  </>
                )}
                {generic && (
                  <div className="sasta-line">
                    <LeafIcon />
                    <div className="sasta-line__text">
                      <strong>Sasta Badal:</strong> {generic.genericName} — save
                      PKR {generic.savingPKR.toLocaleString()}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {sastaTotalPKR > 0 && (
        <section className="section">
          <div className="card sasta-total">
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <LeafIcon />
              <div style={{ flex: 1 }}>
                <div className="sasta-total__title">
                  Sasta Badal total: PKR {sastaTotalPKR.toLocaleString()}
                </div>
                <div className="sasta-total__meta">
                  {genericByBrand.size} of {demoMedications.length} medicines
                  have a generic alternative.
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="safety-pill">
          <span className="safety-pill__dot" />
          <span>
            Allergies on file:{" "}
            <strong>{allergies.length ? allergies.join(", ") : "None"}</strong>
          </span>
        </div>
        <button className="btn btn--pine" type="button" style={{ width: "100%", marginTop: 12 }}>
          <ShareIcon /> Share with Doctor
        </button>
      </section>
    </>
  );
}