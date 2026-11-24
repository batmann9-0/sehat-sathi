// src/app/sos/page.tsx
import QRCode from "qrcode";
import { demoProfile } from "@/lib/demo-data";
import { buildSosCard } from "@/lib/demo-logic";

export default async function SosPage() {
  const sos = buildSosCard(demoProfile);
  const qrText = sos.qrPayload || sos.displayText;
  const qrDataUrl = await QRCode.toDataURL(qrText);

  const allergies = sos.allergies ?? [];
  const conditions = sos.chronicConditions ?? [];

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">SOS card</h1>
        <p className="page__subtitle">
          Show this card in an emergency — it works without internet.
        </p>
      </div>

      <section className="section">
        <div className="record-card">
          <div className="record-card__head">
            <h2 className="record-card__title">{sos.name ?? "Patient"}</h2>
            <span className="stamp stamp--pine">VERIFIED</span>
          </div>

          <div className="record-card__body stack">
            <div>
              <div className="field-label">Blood group</div>
              <div className="hero-number">{sos.bloodGroup ?? "—"}</div>
            </div>

            <div className="divider" />

            <div className="summary-grid">
              <div>
                <div className="field-label">Allergies</div>
                <div className="field-value field-value--alert">
                  {allergies.length > 0 ? allergies.join(", ") : "None known"}
                </div>
              </div>
              <div>
                <div className="field-label">Conditions</div>
                <div className="field-value">
                  {conditions.length > 0 ? conditions.join(", ") : "None on file"}
                </div>
              </div>
            </div>

            <div>
              <div className="field-label">Emergency contact</div>
              <div className="field-value">{sos.emergencyContact ?? "—"}</div>
            </div>

            <div className="divider" />

            <div>
              <div className="field-label">Scan for the full file</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="qr-image"
                src={qrDataUrl}
                alt="QR code containing this emergency card"
              />
              <p className="note" style={{ marginTop: 12 }}>
                Any phone camera can read this — no app, no internet needed on
                your side.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}