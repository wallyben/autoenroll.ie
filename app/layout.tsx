import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AutoEnroll.ie',
  description: 'Auto enrollment project for IE',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
