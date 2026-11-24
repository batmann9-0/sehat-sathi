// src/app/NavShell.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", en: "Dashboard", ur: "ڈیش بورڈ" },
  { href: "/records", en: "My Records", ur: "میرے ریکارڈ" },
  { href: "/demo", en: "Report Result", ur: "رپورٹ کا نتیجہ" },
  { href: "/sos", en: "SOS Card", ur: "ایمرجنسی کارڈ" },
  { href: "/doctor-prep", en: "Doctor Prep", ur: "ڈاکٹر کی تیاری" },
  { href: "/tracker", en: "Health Tracker", ur: "صحت ٹریکر" },
  { href: "/medicines", en: "Medicines", ur: "ادویات" },
  { href: "/labs", en: "Labs", ur: "لیبارٹریز" },
  { href: "/family", en: "Family", ur: "خاندان" },
];

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

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7 h16 M4 12 h16 M4 17 h16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
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

function IconTracker() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 12 h4 l2 -6 l4 12 l2 -6 h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMedicines() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="5"
        y="10"
        width="14"
        height="9"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M9 10 v-3 a3 3 0 0 1 6 0 v3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function IconLabs() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 3 v6 l-5 9 a2 2 0 0 0 2 3 h12 a2 2 0 0 0 2 -3 l-5 -9 v-6 M8 3 h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconFamily() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3 20 c1 -4 4 -6 6 -6 s5 2 6 6 M14 20 c1 -3 2 -4 3 -4 s2 1 3 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const navIcons: Record<string, React.ReactNode> = {
  "/": <IconDashboard />,
  "/records": <IconRecords />,
  "/demo": <IconReport />,
  "/sos": <IconSos />,
  "/doctor-prep": <IconPrep />,
  "/tracker": <IconTracker />,
  "/medicines": <IconMedicines />,
  "/labs": <IconLabs />,
  "/family": <IconFamily />,
};

export default function NavShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(false);
      } else {
        setOpen(false);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function toggle() {
    if (isMobile) {
      setOpen((v) => !v);
    } else {
      setCollapsed((v) => !v);
    }
  }

  const expanded = isMobile ? open : !collapsed;

  const shellClasses = ["app-shell"];
  if (open) shellClasses.push("nav-open");
  if (collapsed) shellClasses.push("nav-collapsed");

  return (
    <div className={shellClasses.join(" ")}>
      <div
        className="nav-scrim"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside className="sidebar" aria-label="Primary">
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <Logo />
            <div>
              <div className="sidebar__wordmark">Sehat Sathi</div>
              <div
                className="ur"
                style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}
              >
                صحت ساتھی
              </div>
            </div>
          </div>
        </div>

        <nav className="sidebar__nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item${isActive ? " nav-item--active" : ""}`}
              >
                <span className="nav-item__icon">{navIcons[item.href]}</span>
                <span className="nav-item__label">
                  <span>{item.en}</span>
                  <span className="ur">{item.ur}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar__footer">
          Explain, don&apos;t diagnose. ·{" "}
          <span className="ur">تشخیص نہیں، صرف وضاحت</span>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <button
            type="button"
            className="nav-toggle"
            onClick={toggle}
            aria-label="Menu"
            aria-expanded={expanded}
            aria-controls="primary-nav"
          >
            <IconMenu />
          </button>

          <div className="topbar__patient">
            Demo Patient · <span className="ur">ڈیمو مریض</span>
          </div>

          <Link href="/sos" className="btn btn--sos">
            SOS · <span className="ur">مدد</span>
          </Link>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}