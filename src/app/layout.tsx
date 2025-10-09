import './globals.css';
import { ReactNode } from 'react';
import NavBar from '@/components/NavBar';
import Providers from '@/components/Providers';

export const metadata = { title: 'Jouw receptenboek', description: 'Nooit meer je recepten kwijt!' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <NavBar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
