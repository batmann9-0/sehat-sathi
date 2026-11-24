// src/app/medicines/page.tsx
"use client";

import { useState } from "react";
import genericsJson from "../../../data/pakistan_generics.json";

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

export default function MedicinesPage() {
  const [query, setQuery] = useState("");

  const filtered = generics.filter((g) => {
    const q = query.toLowerCase();
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
            Search <span className="ur">تلاش</span>
          </label>
          <input
            className="input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Brand or generic name"
          />
        </div>
      </section>

      <section className="section">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__title">No matches</div>
            <div className="empty-state__meta">
              Try a different search · <span className="ur">دوسری تلاش کریں</span>
            </div>
          </div>
        ) : (
          <div className="generic-list">
            {filtered.map((g, i) => {
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