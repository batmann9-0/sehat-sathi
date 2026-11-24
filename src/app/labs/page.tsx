// src/app/labs/page.tsx
import labsJson from "../../../data/pakistan_labs.json";

type Lab = {
  name: string;
  city: string;
  trustTier: number;
  testsOffered: Array<{ testName: string; pricePKR: number }>;
};

const labs = labsJson as unknown as Lab[];

function tierStamp(tier: number): { cls: string; label: string } {
  if (tier === 3) return { cls: "stamp--pine", label: "Trust Tier 3 · درجہ ۳" };
  if (tier === 2) return { cls: "stamp--pine", label: "Trust Tier 2 · درجہ ۲" };
  return { cls: "stamp--gold", label: "Trust Tier 1 · درجہ ۱" };
}

export default function LabsPage() {
  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">
          Labs <span className="ur">لیبارٹریز</span>
        </h1>
        <p className="page__subtitle">
          Labs and prices for comparison · <span className="ur">موازنہ کے لیے لیبز اور قیمتیں</span>
        </p>
      </div>

      <section className="section">
        {labs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__title">No labs available</div>
            <div className="empty-state__meta">
              Check back later · <span className="ur">بعد میں دیکھیں</span>
            </div>
          </div>
        ) : (
          <ul className="file-list">
            {labs.map((lab, i) => {
              const stamp = tierStamp(lab.trustTier);
              return (
                <li className="file-card" key={`${lab.name}-${i}`}>
                  <div className="file-card__head">
                    <div className="file-card__title">{lab.name}</div>
                    <span className={`stamp ${stamp.cls}`}>{stamp.label}</span>
                  </div>
                  <div className="file-card__body" style={{ marginBottom: 16 }}>
                    <span>{lab.city}</span>
                  </div>

                  {lab.testsOffered && lab.testsOffered.length > 0 ? (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Test</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lab.testsOffered.map((t, j) => (
                          <tr key={`${t.testName}-${j}`}>
                            <td>
                              <span className="table__test">{t.testName}</span>
                            </td>
                            <td>
                              <span className="table__meta">
                                PKR {t.pricePKR.toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="note">No tests listed</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}