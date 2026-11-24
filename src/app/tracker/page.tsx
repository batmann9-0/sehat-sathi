// src/app/tracker/page.tsx
"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "sehat-sathi-readings";

type Reading = {
  id: string;
  type: "bp" | "sugar" | "weight";
  values: {
    systolic?: number;
    diastolic?: number;
    sugar?: number;
    context?: "fasting" | "random";
    weight?: number;
  };
  at: string;
};

function loadReadings(): Reading[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveReadings(readings: Reading[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(readings));
  } catch {
    // Storage full or unavailable
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function relativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const days = Math.max(0, Math.floor((Date.now() - then) / 86400000));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 6 h18 M8 6 V4 a2 2 0 0 1 2 -2 h4 a2 2 0 0 1 2 2 v2 M6 6 l1 14 a2 2 0 0 0 2 2 h6 a2 2 0 0 0 2 -2 l1 -14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TrackerPage() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [type, setType] = useState<"bp" | "sugar" | "weight">("bp");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [sugar, setSugar] = useState("");
  const [sugarContext, setSugarContext] = useState<"fasting" | "random">("fasting");
  const [weight, setWeight] = useState("");

  useEffect(() => {
    setReadings(loadReadings());
    setHydrated(true);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newReading: Reading = {
      id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      values: {},
      at: new Date().toISOString(),
    };

    if (type === "bp") {
      const sys = parseFloat(systolic);
      const dia = parseFloat(diastolic);
      if (Number.isNaN(sys) || Number.isNaN(dia)) return;
      newReading.values = { systolic: sys, diastolic: dia };
      setSystolic("");
      setDiastolic("");
    } else if (type === "sugar") {
      const val = parseFloat(sugar);
      if (Number.isNaN(val)) return;
      newReading.values = { sugar: val, context: sugarContext };
      setSugar("");
    } else {
      const val = parseFloat(weight);
      if (Number.isNaN(val)) return;
      newReading.values = { weight: val };
      setWeight("");
    }

    const updated = [newReading, ...readings];
    setReadings(updated);
    saveReadings(updated);
  }

  function deleteReading(id: string) {
    const updated = readings.filter((r) => r.id !== id);
    setReadings(updated);
    saveReadings(updated);
  }

  const latestBP = readings.find((r) => r.type === "bp");
  const latestSugar = readings.find((r) => r.type === "sugar");
  const latestWeight = readings.find((r) => r.type === "weight");

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">
          Health Tracker <span className="ur">صحت ٹریکر</span>
        </h1>
        <p className="page__subtitle">
          Log readings at home · <span className="ur">گھر پر ریکارڈ کریں</span>
        </p>
      </div>

      <section className="section">
        <form onSubmit={handleSubmit}>
          <div className="form-field" style={{ marginBottom: 16 }}>
            <label className="form-label">
              Type <span className="ur">قسم</span>
            </label>
            <select
              className="input"
              value={type}
              onChange={(e) => setType(e.target.value as "bp" | "sugar" | "weight")}
            >
              <option value="bp">Blood Pressure · بلڈ پریشر</option>
              <option value="sugar">Blood Sugar · بلڈ شوگر</option>
              <option value="weight">Weight · وزن</option>
            </select>
          </div>

          {type === "bp" && (
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">
                  Systolic (mmHg) <span className="ur">سسٹولک</span>
                </label>
                <input
                  className="input"
                  type="number"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  placeholder="120"
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label">
                  Diastolic (mmHg) <span className="ur">ڈائیاسٹولک</span>
                </label>
                <input
                  className="input"
                  type="number"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  placeholder="80"
                  required
                />
              </div>
            </div>
          )}

          {type === "sugar" && (
            <>
              <div className="form-field" style={{ marginBottom: 16 }}>
                <label className="form-label">
                  Blood Sugar (mg/dL) <span className="ur">بلڈ شوگر</span>
                </label>
                <input
                  className="input"
                  type="number"
                  value={sugar}
                  onChange={(e) => setSugar(e.target.value)}
                  placeholder="90"
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label">
                  Context <span className="ur">سیاق</span>
                </label>
                <select
                  className="input"
                  value={sugarContext}
                  onChange={(e) => setSugarContext(e.target.value as "fasting" | "random")}
                >
                  <option value="fasting">Fasting · خالی پیٹ</option>
                  <option value="random">Random · عام</option>
                </select>
              </div>
            </>
          )}

          {type === "weight" && (
            <div className="form-field">
              <label className="form-label">
                Weight (kg) <span className="ur">وزن</span>
              </label>
              <input
                className="input"
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="70"
                required
              />
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn--primary">
              Save <span className="ur">محفوظ کریں</span>
            </button>
          </div>

          <p className="form-info">
            Usual ranges: BP below 120/80 · fasting sugar 70–99 mg/dL. This app records and organises — it does not diagnose.
            <br />
            <span className="ur">عام حدود: بلڈ پریشر 120/80 سے کم · خالی پیٹ شوگر 70–99۔ یہ ایپ صرف ریکارڈ کرتی ہے، تشخیص نہیں۔</span>
          </p>
        </form>
      </section>

      {!hydrated ? null : readings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__title">No readings yet</div>
          <div className="empty-state__meta">
            Log your first reading above · <span className="ur">اپنی پہلی ریڈنگ اوپر لکھیں</span>
          </div>
        </div>
      ) : (
        <>
          <section className="section">
            <h2 className="section__title">
              Latest <span className="ur">تازہ ترین</span>
            </h2>
            <div className="tracker-cards">
              <div className="tracker-card">
                <div className="field-label">
                  Blood Pressure <span className="ur">بلڈ پریشر</span>
                </div>
                {latestBP ? (
                  <>
                    <div className="tracker-card__value">
                      {latestBP.values.systolic}/{latestBP.values.diastolic}
                    </div>
                    <div className="tracker-card__meta">
                      {relativeDate(latestBP.at)}
                    </div>
                  </>
                ) : (
                  <div className="tracker-card__meta">No readings</div>
                )}
              </div>

              <div className="tracker-card">
                <div className="field-label">
                  Blood Sugar <span className="ur">بلڈ شوگر</span>
                </div>
                {latestSugar ? (
                  <>
                    <div className="tracker-card__value">
                      {latestSugar.values.sugar}
                    </div>
                    <div className="tracker-card__meta">
                      {latestSugar.values.context === "fasting" ? "Fasting" : "Random"} ·{" "}
                      {relativeDate(latestSugar.at)}
                    </div>
                  </>
                ) : (
                  <div className="tracker-card__meta">No readings</div>
                )}
              </div>

              <div className="tracker-card">
                <div className="field-label">
                  Weight <span className="ur">وزن</span>
                </div>
                {latestWeight ? (
                  <>
                    <div className="tracker-card__value">
                      {latestWeight.values.weight} kg
                    </div>
                    <div className="tracker-card__meta">
                      {relativeDate(latestWeight.at)}
                    </div>
                  </>
                ) : (
                  <div className="tracker-card__meta">No readings</div>
                )}
              </div>
            </div>
          </section>

          <section className="section">
            <h2 className="section__title">
              History <span className="ur">تاریخ</span>
            </h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {readings.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className="table__test">
                        {r.type === "bp"
                          ? "BP"
                          : r.type === "sugar"
                          ? "Sugar"
                          : "Weight"}
                      </span>
                    </td>
                    <td>
                      <span className="table__meta">
                        {r.type === "bp"
                          ? `${r.values.systolic}/${r.values.diastolic}`
                          : r.type === "sugar"
                          ? `${r.values.sugar} mg/dL`
                          : `${r.values.weight} kg`}
                      </span>
                    </td>
                    <td>
                      <span className="table__meta">{formatDate(r.at)}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn--text"
                        onClick={() => deleteReading(r.id)}
                        aria-label="Delete reading"
                      >
                        <IconTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}