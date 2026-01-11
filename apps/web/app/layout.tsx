import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Practicas Profesionales | Portal',
  description: 'Portal minimo para estudiantes, empresas y profesores',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
