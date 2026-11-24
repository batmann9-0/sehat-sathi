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
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">My Records</h1>
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
            {isReading ? "Reading your files…" : "Drop reports here"}
          </div>
          <div className="dropzone__meta">
            or click to browse — JPG, PNG or PDF, several at once
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
        <h2 className="section__title">Uploaded records</h2>

        {!hydrated ? (
          <p className="note">Loading your file…</p>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">
              <IconFolder />
            </div>
            <div className="empty-state__title">No uploads yet</div>
            <div className="empty-state__meta">
              No uploads yet — add your first report above.
            </div>
          </div>
        ) : (
          <ul className="upload-list">
            {records.map((r) => (
              <li className="upload-row" key={r.id}>
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

                <button
                  type="button"
                  className="btn btn--text"
                  onClick={() => removeRecord(r.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="divider" />

      <section className="section">
        <h2 className="section__title">Digitised records</h2>
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
                  <span className="table__meta">
                    {relativeDate(r.testDate)}
                  </span>
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