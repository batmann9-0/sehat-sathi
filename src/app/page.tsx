// src/app/page.tsx
import {
  demoProfile,
  demoHistory,
  demoNewTests,
  demoMedications,
  demoTranslatedInstructions,
} from "@/lib/demo-data";
import { findDuplicateTests } from "@/lib/demo-logic";
import type { Lab } from "@/lib/demo-logic";
import labsJson from "../../data/pakistan_labs.json";

const labs = labsJson as unknown as Lab[];

const duplicates = findDuplicateTests(demoNewTests, demoHistory, labs);
const totalSavedPKR = duplicates.reduce(
  (sum, d) => sum + (d.moneySavedPKR || 0),
  0,
);

const instructionByBrand = new Map(
  demoTranslatedInstructions.map((i) => [i.brandName, i]),
);

function daysAgo(dateVal: string | Date): string {
  const d = new Date(dateVal);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

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

export default function DashboardPage() {
  const allergies = demoProfile.allergies ?? [];
  const conditions = demoProfile.chronicConditions ?? [];

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Your health file</h1>
        <p className="page__subtitle">
          Everything we&apos;ve filed for you, organised and ready.
        </p>
      </div>

      <section className="section">
        <div className="record-card">
          <div className="record-card__head">
            <h2 className="record-card__title">Patient Summary</h2>
            <span className="stamp stamp--pine">VERIFIED</span>
          </div>
          <div className="record-card__body">
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                Name
              </div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {demoProfile.name ?? "—"}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                  Blood Group
                </div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  {demoProfile.bloodGroup ?? "—"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                  Allergies
                </div>
                <div style={{ fontSize: 14 }}>
                  {allergies.length > 0 ? allergies.join(", ") : "None"}
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                Conditions
              </div>
              <div style={{ fontSize: 14 }}>
                {conditions.length > 0 ? conditions.join(", ") : "None"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid-2col">
        <section className="section">
          <h3 className="section__title">Latest results</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Test</th>
                <th>Date</th>
                <th>Lab</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {demoHistory.map((r, idx) => (
                <tr key={`${r.testName}-${idx}`}>
                  <td>
                    <div className="table__test">{r.testName}</div>
                  </td>
                  <td>
                    <div className="table__meta">{daysAgo(r.testDate)}</div>
                  </td>
                  <td>
                    <div className="table__meta">{r.labName ?? "Lab"}</div>
                  </td>
                  <td>
                    <span className="stamp stamp--pine">DONE</span>
                  </td>
                </tr>
              ))}
              {demoHistory.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: 32, color: "var(--muted)" }}>
                    No results yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="section">
          <h3 className="section__title">Duplicate Shield</h3>
          <div className="alert-card">
            <div className="alert-card__head">
              <IconShield />
              <div className="alert-card__title">Money saved</div>
            </div>
            <div className="alert-card__value">
              PKR {totalSavedPKR.toLocaleString()}
            </div>
            <div className="alert-card__meta">
              {duplicates.length} duplicate{" "}
              {duplicates.length === 1 ? "test" : "tests"} skipped
            </div>
          </div>

          <h3 className="section__title" style={{ marginTop: 32 }}>
            Medicines
          </h3>
          <div className="med-list">
            {demoMedications.map((m) => {
              const instruction = instructionByBrand.get(m.brandName);
              return (
                <div key={m.brandName} className="med-item">
                  <div className="med-item__head">
                    <div>
                      <div className="med-item__name">{m.brandName}</div>
                      <div className="med-item__meta">
                        {m.dosage} · {m.frequency} · {m.duration}
                      </div>
                    </div>
                  </div>
                  {instruction && (
                    <div className="med-item__instruction">
                      <span className="med-item__instruction-label">
                        Roman Urdu
                      </span>
                      {instruction.instructionRomanUrdu}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}