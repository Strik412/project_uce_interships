import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Project Internships Portal',
  description: 'Portal for students, companies, and professors',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
