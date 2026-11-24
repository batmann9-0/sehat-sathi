// src/app/family/page.tsx
"use client";

import { useEffect, useState } from "react";
import { demoProfile } from "@/lib/demo-data";

const STORAGE_KEY = "sehat-sathi-family";

type FamilyMember = {
  id: string;
  name: string;
  relation: string;
  bloodGroup: string;
  conditions: string[];
  allergies: string[];
};

const relationOptions = [
  { value: "Self", en: "Self", ur: "خود" },
  { value: "Spouse", en: "Spouse", ur: "شریک حیات" },
  { value: "Parent", en: "Parent", ur: "والدین" },
  { value: "Child", en: "Child", ur: "بچہ" },
  { value: "Other", en: "Other", ur: "دیگر" },
];

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function loadFamily(): FamilyMember[] {
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

function saveFamily(members: FamilyMember[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  } catch {
    // Storage full or unavailable
  }
}

function seedFamily(): FamilyMember {
  return {
    id: "self",
    name: demoProfile.name ?? "Demo Patient",
    relation: "Self",
    bloodGroup: demoProfile.bloodGroup ?? "B+",
    conditions: demoProfile.chronicConditions ?? [],
    allergies: demoProfile.allergies ?? [],
  };
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

export default function FamilyPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("Spouse");
  const [bloodGroup, setBloodGroup] = useState("B+");
  const [conditions, setConditions] = useState("");

  useEffect(() => {
    let stored = loadFamily();
    if (stored.length === 0) {
      stored = [seedFamily()];
      saveFamily(stored);
    }
    setMembers(stored);
    setHydrated(true);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const newMember: FamilyMember = {
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      relation,
      bloodGroup,
      conditions: conditions
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      allergies: [],
    };

    const updated = [...members, newMember];
    setMembers(updated);
    saveFamily(updated);

    setName("");
    setConditions("");
  }

  function deleteMember(id: string) {
    const updated = members.filter((m) => m.id !== id);
    setMembers(updated);
    saveFamily(updated);
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">
          Family <span className="ur">خاندان</span>
        </h1>
        <p className="page__subtitle">
          Each member gets their own file · <span className="ur">ہر فرد کی اپنی فائل</span>
        </p>
      </div>

      <section className="section">
        <h2 className="section__title">
          Add member <span className="ur">رکن شامل کریں</span>
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">
                Name <span className="ur">نام</span>
              </label>
              <input
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                required
              />
            </div>
            <div className="form-field">
              <label className="form-label">
                Relation <span className="ur">رشتہ</span>
              </label>
              <select
                className="input"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
              >
                {relationOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.en} · {opt.ur}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row" style={{ marginTop: 16 }}>
            <div className="form-field">
              <label className="form-label">
                Blood Group <span className="ur">بلڈ گروپ</span>
              </label>
              <select
                className="input"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              >
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">
                Conditions <span className="ur">بیماریاں</span>
              </label>
              <input
                className="input"
                type="text"
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                placeholder="Comma separated"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn--primary">
              Add <span className="ur">شامل کریں</span>
            </button>
          </div>
        </form>
      </section>

      <div className="divider" />

      <section className="section">
        <h2 className="section__title">
          Members <span className="ur">ارکان</span>
        </h2>

        {!hydrated ? (
          <p className="note">Loading…</p>
        ) : members.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__title">No members</div>
            <div className="empty-state__meta">
              Add your first family member above ·{" "}
              <span className="ur">اپنا پہلا خاندانی رکن اوپر شامل کریں</span>
            </div>
          </div>
        ) : (
          <div className="member-list">
            {members.map((m) => (
              <div className="member-card" key={m.id}>
                <div className="member-card__head">
                  <div>
                    <div className="member-card__name">{m.name}</div>
                    <div className="member-card__relation">
                      {relationOptions.find((r) => r.value === m.relation)?.en ?? m.relation} ·{" "}
                      <span className="ur">
                        {relationOptions.find((r) => r.value === m.relation)?.ur ?? ""}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span className="stamp stamp--pine">{m.bloodGroup}</span>
                    {m.relation !== "Self" && (
                      <button
                        type="button"
                        className="btn btn--text"
                        onClick={() => deleteMember(m.id)}
                        aria-label="Remove member"
                      >
                        <IconTrash />
                      </button>
                    )}
                  </div>
                </div>

                {m.conditions.length > 0 && (
                  <div className="member-card__meta">
                    <strong>Conditions:</strong>{" "}
                    {m.conditions.map((c, i) => (
                      <span className="tag" key={i}>
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {m.allergies.length > 0 && (
                  <div className="member-card__meta">
                    <strong>Allergies:</strong>{" "}
                    {m.allergies.map((a, i) => (
                      <span className="tag tag--red" key={i}>
                        {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}