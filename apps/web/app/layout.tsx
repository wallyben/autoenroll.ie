import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'AutoEnroll.ie',
  description: 'GDPR-safe auto-enrolment validator and eligibility checker'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto p-6 space-y-8">{children}</div>
      </body>
    </html>
  );
}
