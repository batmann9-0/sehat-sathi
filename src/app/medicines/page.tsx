// src/app/medicines/page.tsx
"use client";

import { useState, useEffect } from "react";
import genericsJson from "../../../data/pakistan_generics.json";
import type { MedicineSummary, MedicineDetails } from "@/lib/medicines";

type GenericEntry = {
  brandName: string;
  genericName: string;
  brandPricePKR: number;
  genericPricePKR: number;
  strength?: string;
};

function normalizeEntry(e: any): GenericEntry | null {
  const brand = e.brandName ?? e.brand ?? e.brandedName;
  const generic = e.genericName ?? e.generic;
  const brandPrice = e.brandPricePKR ?? e.estimatedBrandedPrice ?? e.pricePKR;
  const genericPrice = e.genericPricePKR ?? e.estimatedGenericPrice;

  if (!brand || !generic || typeof brandPrice !== "number" || typeof genericPrice !== "number") {
    return null;
  }

  return {
    brandName: brand,
    genericName: generic,
    brandPricePKR: brandPrice,
    genericPricePKR: genericPrice,
    strength: e.strength ?? e.activeIngredient ?? "",
  };
}

const generics: GenericEntry[] = (genericsJson as any[])
  .map(normalizeEntry)
  .filter((e): e is GenericEntry => e !== null);

function IconArrow() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12 h14 M13 6 l6 6 l-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBack() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M19 12 H5 M12 19 l-7 -7 l7 -7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function MedicinesPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MedicineSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [details, setDetails] = useState<MedicineDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      setTotal(0);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/medicines?q=${encodeURIComponent(query)}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Failed to search');
        }
        const data = await res.json();
        setResults(data.results);
        setTotal(data.total);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  async function loadDetails(id: string) {
    setDetailsLoading(true);
    setDetailsError(null);
    try {
      const res = await fetch(`/api/medicines?id=${encodeURIComponent(id)}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to load details');
      }
      const data = await res.json();
      setDetails(data);
      setSelectedId(id);
    } catch (e: any) {
      setDetailsError(e.message);
    } finally {
      setDetailsLoading(false);
    }
  }

  function handleBack() {
    setSelectedId(null);
    setDetails(null);
    setDetailsError(null);
  }

  const filteredGenerics = generics.filter((g) => {
    const q = query.toLowerCase();
    if (!q) return false;
    return (
      g.brandName.toLowerCase().includes(q) ||
      g.genericName.toLowerCase().includes(q) ||
      (g.strength && g.strength.toLowerCase().includes(q))
    );
  });

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">
          Medicines <span className="ur">ادویات</span>
        </h1>
        <p className="page__subtitle">
          Find generic alternatives · <span className="ur">سستے متبادل تلاش کریں</span>
        </p>
      </div>

      <section className="section">
        <div className="form-field">
          <label className="form-label">
            Search medicines <span className="ur">دوا تلاش کریں</span>
          </label>
          <input
            className="input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Panadol"
          />
        </div>
      </section>

      {selectedId ? (
        <section className="section">
          <button className="btn btn--text" onClick={handleBack} style={{ marginBottom: 16 }}>
            <IconBack /> Back to results <span className="ur">واپس نتائج پر</span>
          </button>

          {detailsLoading ? (
            <p className="note">Loading details… · <span className="ur">تفصیلات لوڈ ہو رہی ہیں</span></p>
          ) : detailsError ? (
            <p className="note note--alert">{detailsError}</p>
          ) : details ? (
            <div className="record-card">
              <div className="record-card__head">
                <h2 className="record-card__title">{details.name}</h2>
                <span className="stamp stamp--pine">{details.price}</span>
              </div>
              <div className="record-card__body stack">
                {details.sections.length === 0 ? (
                  <p className="note">No detailed information available.</p>
                ) : (
                  details.sections.map((sec, i) => (
                    <div key={i} style={{ marginBottom: 24 }}>
                      <h3 className="section__title" style={{ marginBottom: 8 }}>
                        {sec.title || sec.section}
                      </h3>
                      <div className="section-content">
                        {sec.content}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </section>
      ) : (
        <section className="section">
          {isLoading ? (
            <p className="note">Searching… · <span className="ur">تلاش جاری ہے</span></p>
          ) : error ? (
            <p className="note note--alert">{error}</p>
          ) : query.length >= 2 ? (
            <>
              {total > results.length && (
                <p className="note" style={{ marginBottom: 12 }}>
                  Showing {results.length} of {total} · <span className="ur">{results.length} میں سے {total} دکھا رہے ہیں</span>
                </p>
              )}
              {results.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state__title">No matches</div>
                  <div className="empty-state__meta">
                    Try a different search · <span className="ur">دوسری تلاش کریں</span>
                  </div>
                </div>
              ) : (
                <div className="generic-list">
                  {results.map((med) => (
                    <button
                      key={med.id}
                      className="generic-row"
                      style={{ width: "100%", textAlign: "left", cursor: "pointer", background: "var(--card)", border: "1px solid var(--border)" }}
                      onClick={() => loadDetails(med.id)}
                    >
                      <div className="generic-info">
                        <div className="generic-name">{med.name}</div>
                        <div className="generic-price">{med.price}</div>
                      </div>
                      <div className="generic-arrow">
                        <IconArrow />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="note">Type at least 2 characters to search · <span className="ur">تلاش کے لیے کم از کم 2 حروف ٹائپ کریں</span></p>
          )}
        </section>
      )}

      <div className="divider" />

      <section className="section">
        <h2 className="section__title">
          Sasta Badal <span className="ur">سستا بدل</span>
        </h2>
        {filteredGenerics.length === 0 ? (
          query.length >= 2 ? (
            <div className="empty-state">
              <div className="empty-state__title">No generic matches</div>
              <div className="empty-state__meta">
                Try a different search · <span className="ur">دوسری تلاش کریں</span>
              </div>
            </div>
          ) : (
            <p className="note">Search above to see generic alternatives · <span className="ur">سستے متبادل دیکھنے کے لیے اوپر تلاش کریں</span></p>
          )
        ) : (
          <div className="generic-list">
            {filteredGenerics.map((g, i) => {
              const saving = g.brandPricePKR - g.genericPricePKR;
              return (
                <div className="generic-row" key={`${g.brandName}-${i}`}>
                  <div className="generic-info">
                    <div className="generic-name">{g.brandName}</div>
                    <div className="generic-price">
                      PKR {g.brandPricePKR.toLocaleString()}
                      {g.strength && ` · ${g.strength}`}
                    </div>
                  </div>

                  <div className="generic-arrow">
                    <IconArrow />
                  </div>

                  <div className="generic-info">
                    <div className="generic-name">{g.genericName}</div>
                    <div className="generic-price">
                      PKR {g.genericPricePKR.toLocaleString()}
                    </div>
                  </div>

                  <div className="text-saving">
                    You save PKR {saving.toLocaleString()} · <span className="ur">بچت</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="divider" />
      <p className="note">
        Illustrative prices — confirm the generic with your pharmacist. ·{" "}
        <span className="ur">قیمت تقریبی ہے، فارماسسٹ سے تصدیق کریں</span>
      </p>
    </div>
  );
}