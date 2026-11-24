// src/app/sos/page.tsx
import { demoProfile } from "@/lib/demo-data";
import { buildSosCard } from "@/lib/demo-logic";
import QRCode from "qrcode";

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

export default async function SosPage() {
  const sos = buildSosCard(demoProfile);
  const qrSvg = await QRCode.toString(sos.qrPayload, {
    type: "svg",
    margin: 1,
  });

  return (
    <>
      <section className="section">
        <h1 style={{ color: "#fff" }}>Emergency Card</h1>
        <p style={{ color: "rgba(255,255,255,0.7)" }}>
          Show to first responders.
        </p>
      </section>

      <section className="section">
        <div className="sos-card sos-card--full">
          <div className="sos-card__name">{sos.name}</div>

          <div className="sos-blood">
            <div className="sos-blood__label">Blood Group</div>
            <div className="sos-blood__value">{sos.bloodGroup ?? "—"}</div>
          </div>

          <div className="sos-grid">
            <div className="sos-row">
              <div className="sos-label">Allergies</div>
              <div className="sos-value">
                {sos.allergies?.length ? (
                  <ul className="sos-chips">
                    {sos.allergies.map((a) => (
                      <li key={a} className="sos-chip sos-chip--red">
                        {a}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span>None known</span>
                )}
              </div>
            </div>

            <div className="sos-row">
              <div className="sos-label">Conditions</div>
              <div className="sos-value">
                {sos.chronicConditions?.length ? (
                  <ul className="sos-chips">
                    {sos.chronicConditions.map((c) => (
                      <li key={c} className="sos-chip">
                        {c}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span>None</span>
                )}
              </div>
            </div>

            <div className="sos-row">
              <div className="sos-label">Emergency contact</div>
              <div className="sos-value sos-value--big">
                {sos.emergencyContact ?? "—"}
              </div>
            </div>
          </div>

          <div className="qr-box" aria-label="Emergency QR code">
            <div dangerouslySetInnerHTML={{ __html: qrSvg }} />
          </div>

          <p className="sos-card__hint">
            Scan to load this card on any phone — no app needed.
          </p>

          <button className="btn btn--sos" type="button" style={{ width: "100%" }}>
            <ShareIcon /> Share
          </button>
        </div>
      </section>
    </>
  );
}