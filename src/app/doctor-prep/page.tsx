// src/app/doctor-prep/page.tsx
import { demoDoctorPrep } from "@/lib/demo-data";

function ArrowDown() {
  return (
    <div className="arrow-down" aria-hidden>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 4 v14 M6 14 l6 6 l6 -6"
          stroke="var(--pine)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function DoctorPrepPage() {
  const prep = demoDoctorPrep;

  return (
    <>
      <section className="section">
        <h1>Doctor Prep</h1>
        <p style={{ color: "var(--muted)" }}>
          What the doctor will see — organised from what you said.
        </p>
      </section>

      <section className="section">
        <div className="section__title">You said</div>
        <div className="speech-bubble">
          <p className="speech-bubble__text">{prep.symptomsRomanUrdu}</p>
        </div>
      </section>

      <ArrowDown />

      <section className="section">
        <div className="section__title">Doctor sees</div>
        <ul className="file-list">
          <li className="file-card">
            <div className="file-card__head">
              <div className="file-card__title">Prep summary</div>
              <span className="stamp stamp--pine">VERIFIED</span>
            </div>
            <ul className="doctor-bullets">
              {prep.summaryBullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </li>
        </ul>
      </section>

      <section className="section">
        <div className="prep-pill">Organised, not a diagnosis.</div>
      </section>
    </>
  );
}