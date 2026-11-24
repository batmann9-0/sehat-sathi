// src/app/doctor-prep/page.tsx
import { demoDoctorPrep } from "@/lib/demo-data";

export default function DoctorPrepPage() {
  const summaryBullets = demoDoctorPrep.summaryBullets ?? [];
  const symptoms = demoDoctorPrep.symptomsRomanUrdu ?? "";

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Doctor visit prep</h1>
        <p className="page__subtitle">
          Your file, turned into a two-minute conversation.
        </p>
      </div>

      <section className="section">
        <h2 className="section__title">Your summary</h2>
        {summaryBullets.length > 0 ? (
          <ul className="bullet-list">
            {summaryBullets.map((item, i) => (
              <li key={`summary-${i}`}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="note">No summary prepared yet.</p>
        )}
      </section>

      <div className="divider" />

      <section className="section">
        <h2 className="section__title">Tell the doctor — in your words</h2>
        <div className="record-card">
          <div className="record-card__body">
            <p style={{ fontSize: 16, lineHeight: 1.55, fontStyle: "italic" }}>
              {symptoms}
            </p>
          </div>
        </div>
      </section>

      <div className="divider" />
      <p className="note">Organised, not a diagnosis.</p>
    </div>
  );
}