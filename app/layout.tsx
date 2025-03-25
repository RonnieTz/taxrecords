import type { Metadata } from 'next';
import { NextAuthProvider } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tax Records App',
  description: 'Manage your tax records easily',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
