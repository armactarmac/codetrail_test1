import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Code Trails — Score your code',
  description: 'A focused workspace for scoring code quality.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
