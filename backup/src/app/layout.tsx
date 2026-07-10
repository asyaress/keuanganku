import type React from 'react';
import './globals.css';

export const metadata = {
  title: 'Dompetku',
  description: 'Aplikasi keuangan personal minimalis ala iPhone',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
