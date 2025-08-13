import './globals.css';
import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export const metadata = {
  title: 'AEC Enterprise MVP',
  description: 'Gestão AEC para gabinetes de arquitetura e engenharia',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen grid grid-cols-[280px_1fr] grid-rows-[auto_1fr]">
            <div className="row-span-2 hidden md:block border-r"><Sidebar /></div>
            <div className="col-start-2 border-b"><Header /></div>
            <main className="col-start-2 p-4 md:p-6 lg:p-8">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}