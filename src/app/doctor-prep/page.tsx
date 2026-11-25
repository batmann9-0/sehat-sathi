// src/app/doctor-prep/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { demoDoctorPrep } from "@/lib/demo-data";
import SpeakButton from "../SpeakButton";

type TestResult = {
  testName: string;
  resultValue: string | number;
  unit?: string;
  referenceRange?: string;
  isAbnormal?: boolean;
};

type Extraction = {
  patientName?: string;
  labName?: string;
  documentDate?: string;
  bloodGroup?: string;
  testResults?: TestResult[];
  medications?: any[];
};

export default function DoctorPrepPage() {
  const [extraction, setExtraction] = useState<Extraction | null>(null);
  const [notes, setNotes] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("sehat-sathi-records");
      if (raw) {
        const records = JSON.parse(raw);
        const withExtraction = records.filter((r: any) => r.extraction);
        if (withExtraction.length > 0) {
          withExtraction.sort((a: any, b: any) => 
            new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
          );
          setExtraction(withExtraction[0].extraction);
        }
      }
    } catch {
      // ignore
    }

    try {
      const rawNotes = window.localStorage.getItem("sehat-sathi-prep-notes");
      if (rawNotes) setNotes(rawNotes);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    try {
      window.localStorage.setItem("sehat-sathi-prep-notes", val);
    } catch {
      // ignore
    }
  };

  if (!hydrated) return null;

  const abnormalTests = extraction?.testResults?.filter((t) => t.isAbnormal) || [];
  const allTests = extraction?.testResults || [];
  const medications = extraction?.medications || [];

  const englishText = [
    `Patient: ${extraction?.patientName || "Unknown"} — ${extraction?.labName || "Unknown Lab"}, ${extraction?.documentDate || "Unknown Date"}.`,
    ...abnormalTests.map(t => `${t.testName}: ${t.resultValue} ${t.unit || ""} (usual range ${t.referenceRange || "unknown"}).`),
    ...(abnormalTests.length === 0 ? ["All results are within their usual ranges."] : []),
    notes ? `Additional notes: ${notes}` : "",
    "This is an organised summary, not a diagnosis."
  ].filter(Boolean).join(" ");

  const urduText = [
    `مریض: ${extraction?.patientName || "نامعلوم"} — ${extraction?.labName || "نامعلوم لیب"}، ${extraction?.documentDate || "نامعلوم تاریخ"}۔`,
    ...abnormalTests.map(t => `${t.testName}: ${t.resultValue} ${t.unit || ""} (معمول کی حد ${t.referenceRange || "نامعلوم"}).`),
    ...(abnormalTests.length === 0 ? ["تمام نتائج معمول کی حد میں ہیں۔"] : []),
    notes ? `اضافی نوٹس: ${notes}` : "",
    "یہ منظم خلاصہ ہے، تشخیص نہیں۔"
  ].filter(Boolean).join(" ");

  if (!extraction) {
    return (
      <div className="page">
        <div className="page__header">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
            <h1 className="page__title" style={{ marginBottom: 0 }}>
              Doctor visit prep <span className="ur">ڈاکٹر کی تیاری</span>
            </h1>
            <span className="stamp stamp--gold">Demo — digitise a report in My Records to build your own · ڈیمو</span>
          </div>
          <p className="page__subtitle">
            Digitise a report in My Records to build your own · <span className="ur">اپنی بنانے کے لیے میرے ریکارڈ میں رپورٹ ڈیجیٹائز کریں</span>
          </p>
          <Link href="/records" className="btn btn--primary" style={{ marginTop: 16 }}>
            Go to My Records · <span className="ur">میرے ریکارڈز</span>
          </Link>
        </div>

        <section className="section">
          <h2 className="section__title">
            Your summary <span className="ur">آپ کا خلاصہ</span>
          </h2>
          {demoDoctorPrep.summaryBullets.length > 0 ? (
            <ul className="bullet-list">
              {demoDoctorPrep.summaryBullets.map((item, i) => (
                <li key={`summary-${i}`}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="note">No summary prepared yet.</p>
          )}
        </section>

        <div className="divider" />

        <section className="section">
          <h2 className="section__title">
            Tell the doctor — in your words <span className="ur">ڈاکٹر کو اپنی زبان میں بتائیں</span>
          </h2>
          <div className="record-card">
            <div className="record-card__body">
              <p style={{ fontSize: 16, lineHeight: 1.55, fontStyle: "italic" }}>
                {demoDoctorPrep.symptomsRomanUrdu}
              </p>
            </div>
          </div>
        </section>

        <div className="divider" />
        <p className="note">
          Organised, not a diagnosis. · <span className="ur">منظم خلاصہ، تشخیص نہیں</span>
        </p>

        <div className="divider" />

        <section className="section">
          <h2 className="section__title">
            Your notes <span className="ur">آپ کے نوٹس</span>
          </h2>
          <div className="form-field">
            <label className="form-label">
              Anything else the doctor should know · <span className="ur">مزید تفصیل جو رپورٹ میں نہیں</span>
            </label>
            <textarea
              className="input"
              rows={4}
              value={notes}
              onChange={handleNotesChange}
              placeholder="e.g., mild fever since yesterday, allergic to penicillin / مثلاً: کل سے ہلکا بخار، پینسلین سے الرجی"
            />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">
          Doctor Visit Prep <span className="ur">ڈاکٹر کے لیے تیاری</span>
        </h1>
        <p className="page__subtitle">
          {extraction.patientName || "Unknown"} — {extraction.labName || "Unknown Lab"}, {extraction.documentDate || "Unknown Date"}
        </p>
        <SpeakButton englishText={englishText} urduText={urduText} />
      </div>

      <section className="section">
        <h2 className="section__title">
          Key results to discuss <span className="ur">اہم نتائج</span>
        </h2>
        {abnormalTests.length > 0 ? (
          <ul className="bullet-list">
            {abnormalTests.map((t, i) => (
              <li key={i}>
                <strong>{t.testName}</strong>: {t.resultValue} {t.unit || ""} (usual range {t.referenceRange || "unknown"})
              </li>
            ))}
          </ul>
        ) : (
          <p className="note">
            All results are within their usual ranges. · <span className="ur">تمام نتائج معمول کی حد میں ہیں۔</span>
          </p>
        )}
      </section>

      <section className="section">
        <h2 className="section__title">
          All results <span className="ur">تمام نتائج</span>
        </h2>
        {allTests.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Test</th>
                <th>Value</th>
                <th>Reference</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {allTests.map((t, i) => (
                <tr key={i}>
                  <td><span className="table__test">{t.testName}</span></td>
                  <td><span className="table__meta">{t.resultValue} {t.unit || ""}</span></td>
                  <td><span className="table__meta">{t.referenceRange || "—"}</span></td>
                  <td>
                    {t.isAbnormal ? (
                      <span className="stamp stamp--red">Abnormal · غیر معمولی</span>
                    ) : (
                      <span className="stamp stamp--pine">Normal · معمول</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="note">No test results found in this report.</p>
        )}
      </section>

      {medications.length > 0 && (
        <section className="section">
          <h2 className="section__title">
            Medicines on this report <span className="ur">اس رپورٹ کی ادویات</span>
          </h2>
          <ul className="bullet-list">
            {medications.map((m, i) => (
              <li key={i}>
                {typeof m === "string" ? m : (m.name || m.brandName || "Unknown medicine")}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="divider" />
      <p className="note">
        This is an organised summary, not a diagnosis. · <span className="ur">یہ منظم خلاصہ ہے، تشخیص نہیں</span>
      </p>

      <div className="divider" />

      <section className="section">
        <h2 className="section__title">
          Your notes <span className="ur">آپ کے نوٹس</span>
        </h2>
        <div className="form-field">
          <label className="form-label">
            Anything else the doctor should know · <span className="ur">مزید تفصیل جو رپورٹ میں نہیں</span>
          </label>
          <textarea
            className="input"
            rows={4}
            value={notes}
            onChange={handleNotesChange}
            placeholder="e.g., mild fever since yesterday, allergic to penicillin / مثلاً: کل سے ہلکا بخار، پینسلین سے الرجی"
          />
        </div>
      </section>
    </div>
  );
}