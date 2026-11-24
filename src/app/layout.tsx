// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sehat Sathi — Patient Advocate",
  description: "Your medical file, explained in your language.",
};

function Logo() {
  return (
    <svg
      width="32"
      height="34"
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

function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 12 l9 -9 l9 9 M5 10 v10 h14 v-10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconRecords() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 5 h10 l6 6 v9 a2 2 0 0 1 -2 2 h-14 a2 2 0 0 1 -2 -2 v-13 a2 2 0 0 1 2 -2 z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconReport() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8 h3 l2 -3 h6 l2 3 h3 a2 2 0 0 1 2 2 v9 a2 2 0 0 1 -2 2 h-16 a2 2 0 0 1 -2 -2 v-9 a2 2 0 0 1 2 -2 z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconSos() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3 l8 3 v6 c0 5 -3.5 8 -8 9 c-4.5 -1 -8 -4 -8 -9 v-6 z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPrep() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 7 h12 M6 12 h12 M6 17 h8"
        stroke="currentColor"
        strokeWidth="1.5"
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
          <aside className="sidebar">
            <div className="sidebar__header">
              <div className="sidebar__logo">
                <Logo />
                <span className="sidebar__wordmark">Sehat Sathi</span>
              </div>
            </div>
            <nav className="sidebar__nav">
              <a href="/" className="nav-item nav-item--active">
                <span className="nav-item__icon">
                  <IconDashboard />
                </span>
                Dashboard
              </a>
              <a href="/records" className="nav-item">
                <span className="nav-item__icon">
                  <IconRecords />
                </span>
                My Records
              </a>
              <a href="/demo" className="nav-item">
                <span className="nav-item__icon">
                  <IconReport />
                </span>
                Report Result
              </a>
              <a href="/sos" className="nav-item">
                <span className="nav-item__icon">
                  <IconSos />
                </span>
                SOS Card
              </a>
              <a href="/doctor-prep" className="nav-item">
                <span className="nav-item__icon">
                  <IconPrep />
                </span>
                Doctor Prep
              </a>
            </nav>
            <div className="sidebar__footer">Explain, don&apos;t diagnose.</div>
          </aside>

          <div className="main-content">
            <header className="topbar">
              <div className="topbar__patient">
                Signed in as <strong>Demo Patient</strong>
              </div>
              <a href="/sos" className="btn btn--sos">
                <IconSos /> SOS
              </a>
            </header>
            <main>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}