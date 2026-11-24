// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sehat Sathi — AI Patient Advocate",
  description: "Your medical file, explained in your language.",
};

function Logo() {
  // White medical cross inside a pine rounded speech-bubble square.
  return (
    <svg
      width="38"
      height="40"
      viewBox="0 0 40 42"
      aria-label="Sehat Sathi logo"
      role="img"
    >
      <path
        d="M6 2 h28 a6 6 0 0 1 6 6 v20 a6 6 0 0 1 -6 6 h-20 l-8 6 v-6 a6 6 0 0 1 -6 -6 v-20 a6 6 0 0 1 6 -6 z"
        fill="#0C4A34"
      />
      <rect x="16" y="8" width="8" height="20" rx="1.5" fill="#fff" />
      <rect x="10" y="14" width="20" height="8" rx="1.5" fill="#fff" />
    </svg>
  );
}

function SosIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="10" y="4" width="4" height="16" rx="1" fill="#fff" />
      <rect x="4" y="10" width="16" height="4" rx="1" fill="#fff" />
    </svg>
  );
}

function TabIconFile() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 5 h10 l6 6 v9 a2 2 0 0 1 -2 2 h-14 a2 2 0 0 1 -2 -2 v-13 a2 2 0 0 1 2 -2 z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TabIconMedicines() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="5"
        y="10"
        width="14"
        height="9"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M9 10 v-3 a3 3 0 0 1 6 0 v3"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function TabIconPrep() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 7 h12 M6 12 h12 M6 17 h8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TabIconProfile() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M4 20 c2 -4 6 -5 8 -5 s6 1 8 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="app-header">
            <div className="app-header__brand">
              <Logo />
              <span className="app-header__title">Sehat Sathi</span>
            </div>
            <div className="app-header__avatar" aria-label="Account">
              A
            </div>
          </header>

          <aside className="sidebar" aria-label="Primary">
            <div className="sidebar__patient">
              <div className="sidebar__patient-name">Ahmed</div>
              <div className="sidebar__patient-meta">
                B+ · Type 2 Diabetes
              </div>
            </div>
            <button
              className="sidebar__nav-item sidebar__nav-item--active"
              type="button"
            >
              <TabIconFile /> File
            </button>
            <button className="sidebar__nav-item" type="button">
              <TabIconMedicines /> Medicines
            </button>
            <button className="sidebar__nav-item" type="button">
              <TabIconPrep /> Prep
            </button>
            <button className="sidebar__nav-item" type="button">
              <TabIconProfile /> Profile
            </button>
          </aside>

          <main className="main">{children}</main>

          <footer className="footer-pill">Explain, don&apos;t diagnose.</footer>

          <nav className="tab-bar" aria-label="Primary">
            <button
              className="tab-bar__item tab-bar__item--active"
              type="button"
            >
              <TabIconFile />
              File
            </button>
            <button className="tab-bar__item" type="button">
              <TabIconMedicines />
              Medicines
            </button>
            <button className="tab-bar__sos" type="button" aria-label="SOS">
              <SosIcon />
            </button>
            <button className="tab-bar__item" type="button">
              <TabIconPrep />
              Prep
            </button>
            <button className="tab-bar__item" type="button">
              <TabIconProfile />
              Profile
            </button>
          </nav>
        </div>
      </body>
    </html>
  );
}