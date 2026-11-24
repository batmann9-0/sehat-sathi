import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sehat Sathi — AI Patient Advocate for Pakistan',
  description:
    'Your reports, prescriptions and medicines, explained in simple Roman Urdu. Explain, don\u2019t diagnose.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
