// src/app/records/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { demoHistory } from "@/lib/demo-data";

const STORAGE_KEY = "sehat-sathi-records";

type UploadedRecord = {
  id: string;
  name: string;
  kind: "image" | "pdf";
  sizeKB: number;
  addedAt: string;
  dataUrl: string;
  extraction?: any;
};

function isUploadedRecord(value: unknown): value is UploadedRecord {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.name === "string" &&
    (r.kind === "image" || r.kind === "pdf") &&
    typeof r.sizeKB === "number" &&
    typeof r.addedAt === "string" &&
    typeof r.dataUrl === "string"
  );
}

function persist(records: UploadedRecord[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function makeId(): string {
  return `rec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function relativeDate(value: string | Date): string {
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "—";
  const days = Math.max(0, Math.floor((Date.now() - then) / 86400000));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function addedOn(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function IconUpload() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 16 V4 M8 8 l4 -4 l4 4 M4 16 v3 a2 2 0 0 0 2 2 h12 a2 2 0 0 0 2 -2 v-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconDocument() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 3 h8 l4 4 v14 a1 1 0 0 1 -1 1 H6 a1 1 0 0 1 -1 -1 V4 a1 1 0 0 1 1 -1 z M14 3 v4 h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconFolder() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 7 a1 1 0 0 1 1 -1 h5 l2 2 h9 a1 1 0 0 1 1 1 v10 a1 1 0 0 1 -1 1 H4 a1 1 0 0 1 -1 -1 z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function RecordsPage() {
  const [records, setRecords] = useState<UploadedRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageIsError, setMessageIsError] = useState(false);
  const [extractingId, setExtractingId] = useState<string | null>(null);
  const [extractErrors, setExtractErrors] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let stored: UploadedRecord[] = [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) stored = parsed.filter(isUploadedRecord);
      }
    } catch {
      stored = [];
    }
    setRecords(stored);
    setHydrated(true);
  }, []);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    const accepted = files.filter(
      (f) => f.type.startsWith("image/") || f.type === "application/pdf",
    );
    const rejectedCount = files.length - accepted.length;

    if (accepted.length === 0) {
      setMessageIsError(true);
      setMessage("Only images (JPG, PNG) and PDF files can be filed.");
      return;
    }

    setIsReading(true);
    setMessage(null);
    setMessageIsError(false);

    const incoming: UploadedRecord[] = [];
    for (const file of accepted) {
      try {
        const dataUrl = await readFileAsDataUrl(file);
        incoming.push({
          id: makeId(),
          name: file.name,
          kind: file.type === "application/pdf" ? "pdf" : "image",
          sizeKB: Math.max(1, Math.round(file.size / 1024)),
          addedAt: new Date().toISOString(),
          dataUrl,
        });
      } catch {
        // Skip unreadable files, keep the rest of the batch.
      }
    }

    setIsReading(false);

    if (incoming.length === 0) {
      setMessageIsError(true);
      setMessage("Those files could not be read. Try again.");
      return;
    }

    setRecords((prev) => {
      const next = [...incoming, ...prev];
      const saved = persist(next);
      if (!saved) {
        setMessageIsError(true);
        setMessage(
          "Filed for this session only — browser storage is full. Remove an old record to save permanently.",
        );
      } else if (rejectedCount > 0) {
        setMessageIsError(false);
        setMessage(
          `${incoming.length} filed. ${rejectedCount} skipped — images and PDF only.`,
        );
      } else {
        setMessageIsError(false);
        setMessage(
          `${incoming.length} ${incoming.length === 1 ? "record" : "records"} added to your file.`,
        );
      }
      return next;
    });
  }

  function removeRecord(id: string) {
    setRecords((prev) => {
      const next = prev.filter((r) => r.id !== id);
      persist(next);
      return next;
    });
    setMessageIsError(false);
    setMessage("Record removed.");
    setExtractErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  async function handleDigitise(record: UploadedRecord) {
    setExtractingId(record.id);
    setExtractErrors((prev) => {
      const next = { ...prev };
      delete next[record.id];
      return next;
    });

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: record.dataUrl }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Extraction failed");
      }

      const updatedRecords = records.map((r) =>
        r.id === record.id ? { ...r, extraction: data.extraction } : r
      );
      setRecords(updatedRecords);
      persist(updatedRecords);
    } catch (e: any) {
      setExtractErrors((prev) => ({ ...prev, [record.id]: e.message }));
    } finally {
      setExtractingId(null);
    }
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">
          My Records <span className="ur">میرے ریکارڈ</span>
        </h1>
        <p className="page__subtitle">
          Every report and prescription, in one file.
        </p>
      </div>

      <section className="section">
        <div
          className={
            isDragging
              ? "upload-dropzone upload-dropzone--active"
              : "upload-dropzone"
          }
          role="button"
          tabIndex={0}
          aria-label="Add reports: drag and drop, or press Enter to browse"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            void handleFiles(e.dataTransfer.files);
          }}
        >
          <div className="dropzone__icon">
            <IconUpload />
          </div>
          <div className="dropzone__title">
            {isReading ? "Reading your files…" : "Drop reports here or browse"}
          </div>
          <div className="dropzone__meta">
            JPG, PNG or PDF, several at once ·{" "}
            <span className="ur">رپورٹ یہاں ڈالیں یا منتخب کریں</span>
          </div>
        </div>

        <input
          ref={inputRef}
          className="visually-hidden"
          type="file"
          accept="image/*,application/pdf"
          multiple
          onChange={(e) => {
            void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {message && (
          <p
            className={messageIsError ? "note note--alert" : "note"}
            style={{ marginTop: 12 }}
            role="status"
          >
            {message}
          </p>
        )}
      </section>

      <section className="section">
        <h2 className="section__title">
          Uploaded records <span className="ur">اپ لوڈ شدہ ریکارڈ</span>
        </h2>

        {!hydrated ? (
          <p className="note">Loading your file…</p>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">
              <IconFolder />
            </div>
            <div className="empty-state__title">
              No uploads yet <span className="ur">ابھی کوئی ریکارڈ نہیں</span>
            </div>
            <div className="empty-state__meta">
              Add your first report above ·{" "}
              <span className="ur">اپنی پہلی رپورٹ اوپر شامل کریں</span>
            </div>
          </div>
        ) : (
          <ul className="upload-list">
            {records.map((r) => (
              <li className="upload-row" key={r.id} style={{ flexDirection: "column", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, width: "100%" }}>
                  {r.kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="upload-thumb" src={r.dataUrl} alt="" />
                  ) : (
                    <span className="upload-thumb" aria-hidden>
                      <IconDocument />
                    </span>
                  )}

                  <div className="upload-info">
                    <div className="upload-name">{r.name}</div>
                    <div className="upload-meta">
                      {addedOn(r.addedAt)} · {r.sizeKB.toLocaleString()} KB ·{" "}
                      {r.kind === "pdf" ? "PDF" : "Image"}
                    </div>
                  </div>

                  <span className="stamp stamp--gold">NEW</span>

                  {r.kind === "image" && (
                    <button
                      type="button"
                      className={r.extraction ? "btn btn--text" : "btn btn--primary"}
                      onClick={() => handleDigitise(r)}
                      disabled={extractingId === r.id}
                      style={{ marginLeft: "auto", flexShrink: 0 }}
                    >
                      {extractingId === r.id
                        ? "Reading… · پڑھا جا رہا ہے"
                        : r.extraction
                        ? "Re-read · دوبارہ پڑھیں"
                        : "Digitise · ڈیجیٹائز کریں"}
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn--text"
                    onClick={() => removeRecord(r.id)}
                    style={{ flexShrink: 0 }}
                  >
                    Remove <span className="ur">ہٹائیں</span>
                  </button>
                </div>

                {r.extraction && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)", width: "100%" }}>
                    {(r.extraction.patientName || r.extraction.labName) && (
                      <div style={{ marginBottom: 12, fontSize: 14, color: "var(--ink)" }}>
                        {r.extraction.patientName && <strong>{r.extraction.patientName}</strong>}
                        {r.extraction.patientName && r.extraction.labName && " · "}
                        {r.extraction.labName && <span>{r.extraction.labName}</span>}
                      </div>
                    )}
                    {r.extraction.testResults && r.extraction.testResults.length > 0 && (
                      <table className="table" style={{ marginTop: 8 }}>
                        <thead>
                          <tr>
                            <th>Test</th>
                            <th>Result</th>
                            <th>Reference</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {r.extraction.testResults.map((tr: any, idx: number) => (
                            <tr key={idx}>
                              <td>
                                <span className="table__test">{tr.testName}</span>
                              </td>
                              <td>
                                <span className="table__meta">
                                  {tr.resultValue}
                                  {tr.unit ? ` ${tr.unit}` : ""}
                                </span>
                              </td>
                              <td>
                                <span className="table__meta">{tr.referenceRange || "—"}</span>
                              </td>
                              <td>
                                {tr.isAbnormal ? (
                                  <span className="stamp stamp--red">Abnormal · غیر معمولی</span>
                                ) : (
                                  <span className="stamp stamp--pine">Normal · معمول</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
                {extractErrors[r.id] && (
                  <p className="note note--alert" style={{ marginTop: 8, width: "100%" }}>
                    {extractErrors[r.id]}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="divider" />

      <section className="section">
        <h2 className="section__title">
          Digitised records <span className="ur">ڈیجیٹل ریکارڈ</span>
        </h2>
        <table className="table">
          <thead>
            <tr>
              <th>Test</th>
              <th>Lab</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {demoHistory.map((r, i) => (
              <tr key={`${r.testName}-${i}`}>
                <td>
                  <span className="table__test">{r.testName}</span>
                </td>
                <td>
                  <span className="table__meta">{r.labName ?? "Lab"}</span>
                </td>
                <td>
                  <span className="table__meta">{relativeDate(r.testDate)}</span>
                </td>
                <td>
                  <span className="stamp stamp--pine">DONE</span>
                </td>
              </tr>
            ))}
            {demoHistory.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <span className="table__meta">No digitised records yet</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}