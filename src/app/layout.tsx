import './globals.css';
import { ReactNode } from 'react';
import NavBar from '@/components/NavBar';
import Providers from '@/components/Providers';

export const metadata = { title: 'MealBook', description: 'Save and browse your recipes' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <NavBar />
          <main className="container mx-auto">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
