// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import NavShell from "./NavShell";

export const metadata: Metadata = {
  title: "Sehat Sathi — Patient Advocate",
  description: "Your medical file, explained in your language.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NavShell>{children}</NavShell>
      </body>
    </html>
  );
}