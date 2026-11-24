// src/app/page.tsx
import { demoProfile, demoHistory, demoNewTests } from "@/lib/demo-data";
import { findDuplicateTests } from "@/lib/demo-logic";
import type { Lab, HistoryTest } from "@/lib/demo-logic";
import labsJson from "../../data/pakistan_labs.json";

const labs = labsJson as unknown as Lab[];

const duplicates = findDuplicateTests(demoNewTests, demoHistory, labs);
const duplicateByName = new Map(duplicates.map((d) => [d.testName, d]));

function daysAgoFrom(dateVal: string | Date): number {
  const d = new Date(dateVal);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function totalSavedPKR(): number {
  return duplicates.reduce((sum, d) => sum + (d.moneySavedPKR || 0), 0);
}

function greetingName(fullName: string | null | undefined): string {
  if (!fullName || fullName === "Demo Patient") return "";
  const first = fullName.split(" ")[0];
  return first ? `, ${first}` : "";
}

function CameraIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8 h3 l2 -3 h6 l2 3 h3 a2 2 0 0 1 2 2 v9 a2 2 0 0 1 -2 2 h-16 a2 2 0 0 1 -2 -2 v-9 a2 2 0 0 1 2 -2 z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3 l8 3 v6 c0 5 -3.5 8 -8 9 c-4.5 -1 -8 -4 -8 -9 v-6 z"
        stroke="var(--pine)"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="var(--mint)"
      />
    </svg>
  );
}

export default function HomePage() {
  const hba1c = demoHistory.find((r) => /hba1c/i.test(r.testName));
  const hba1cDays = hba1c ? daysAgoFrom(hba1c.testDate) : null;
  const saved = totalSavedPKR();

  return (
    <>
      <section className="section greeting">
        <h1>Assalam-o-Alaikum{greetingName(demoProfile.name)}</h1>
        <p>Your file is ready.</p>
      </section>

      <section className="section">
        <div className="card snap-card">
          <h2>Snap a Report</h2>
          <p>Take a photo of a paper report — we&apos;ll file it for you.</p>
          <button className="btn btn--pine" type="button">
            <CameraIcon /> Open Camera
          </button>
        </div>
      </section>

      {saved > 0 && (
        <section className="section">
          <div
            className="card"
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              background: "var(--mint)",
            }}
          >
            <ShieldIcon />
            <div>
              <div
                style={{
                  fontFamily: "Poppins, system-ui",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Shield saved you PKR {saved.toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                {duplicates.length} duplicate{" "}
                {duplicates.length === 1 ? "test" : "tests"} skipped.
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="section__title">Health Snapshot</div>
        <div className="snapshot-grid">
          <div className="card snapshot-card">
            <div className="snapshot-label">HbA1c</div>
            <div
              className="snapshot-value"
              style={{ fontSize: 20, lineHeight: 1.25 }}
            >
              {hba1cDays !== null ? `Done ${hba1cDays} days ago` : "—"}
            </div>
            <div className="snapshot-meta">{hba1c?.labName ?? "Lab"}</div>
          </div>
          <div className="card snapshot-card">
            <div className="snapshot-label">Blood Group</div>
            <div className="snapshot-value">{demoProfile.bloodGroup ?? "—"}</div>
            <div className="snapshot-meta">Verified on file</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__title">Your File</div>
        <ul className="file-list">
          {demoNewTests.map((t) => {
            const dup = duplicateByName.get(t.testName);
            const stampLabel = dup ? "DUPLICATE" : "NEW";
            const stampCls = dup ? "stamp--red" : "stamp--gold";
            return (
              <li key={`new-${t.testName}`} className="file-card">
                <div className="file-card__head">
                  <div className="file-card__title">{t.testName}</div>
                  <span className={`stamp ${stampCls}`}>{stampLabel}</span>
                </div>
                <div className="file-card__body">
                  <span>{t.labName ?? "Lab"}</span>
                  {dup ? (
                    <span>
                      Previously done {dup.daysAgo} days ago
                      {dup.previousLab ? ` · ${dup.previousLab}` : ""}
                    </span>
                  ) : (
                    <span>Ordered · awaiting results</span>
                  )}
                </div>
              </li>
            );
          })}
          {demoHistory.map((r, idx) => {
            const d = new Date(r.testDate);
            const formattedDate = d.toLocaleDateString("en-PK");
            return (
              <li
                key={`hist-${r.testName}-${formattedDate}-${idx}`}
                className="file-card"
              >
                <div className="file-card__head">
                  <div className="file-card__title">{r.testName}</div>
                  <span className="stamp stamp--pine">VERIFIED</span>
                </div>
                <div className="file-card__body">
                  <span>{r.labName ?? "Lab"}</span>
                  <span>{formattedDate}</span>
                </div>
              </li>
            );
          })}
          {demoHistory.length === 0 && demoNewTests.length === 0 && (
            <li className="file-card">
              <div className="file-card__head">
                <div className="file-card__title">No records yet</div>
                <span className="stamp stamp--gold">NEW</span>
              </div>
              <div className="file-card__body">
                <span>Snap your first report to begin your file.</span>
              </div>
            </li>
          )}
        </ul>
      </section>
    </>
  );
}