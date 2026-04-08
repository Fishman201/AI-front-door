import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';
import { Home } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Front Door',
  description: 'AI Governance Intake Portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col transition-colors duration-300 print:bg-white print:text-black`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-navy focus:font-bold focus:shadow-xl focus:rounded-b-lg top-0 left-4 outline-none ring-2 ring-teal block print:hidden">
            Skip to main content
          </a>
          
          <header className="bg-navy p-4 flex justify-between items-center shadow-lg relative z-20 shrink-0 print:hidden">
            <Link href="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-teal-light focus:ring-offset-2 focus:ring-offset-navy rounded-lg p-1 -ml-1 transition-all">
               <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center font-bold text-white shadow-inner shrink-0 group-hover:bg-teal-light transition-colors" aria-hidden="true">
                 AI
               </div>
               <h1 className="text-white text-xl md:text-2xl font-bold tracking-tight group-hover:text-teal-light transition-colors">AI Front Door</h1>
            </Link>
            <div className="flex items-center space-x-3 md:space-x-6">
               <span className="text-teal-light text-sm hidden font-medium sm:block opacity-90 tracking-wide">UNCLASSIFIED</span>
               <div className="flex items-center gap-2">
                 <Link href="/" className="p-2 rounded-md bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-teal-light transition-all focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 focus:ring-offset-navy shadow-inner" aria-label="Go to home" title="Home">
                   <Home size={20} aria-hidden="true" />
                 </Link>
                 <ThemeToggle />
               </div>
            </div>
          </header>
          
          <div className="h-2 w-full bg-teal shrink-0 shadow-sm print:hidden" aria-hidden="true" />
          
          <main id="main-content" className="flex-grow flex flex-col relative print:block">
            {children}
          </main>
          
          <footer className="bg-navy border-t-2 border-teal-light shrink-0 mt-auto print:hidden">
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-slate-300 text-sm">
                <div className="text-center md:text-left">
                   <p className="font-semibold text-white tracking-wide">AI Front Door Governance Portal</p>
                   <p className="mt-1 text-slate-400">Reference manual: <span className="font-mono bg-slate-800 px-1 py-0.5 rounded text-xs">BAB-ENG-MAN-157 v3.0</span></p>
                </div>
                <div className="text-center md:text-right">
                   <p className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded inline-block font-mono text-xs font-bold tracking-widest border border-slate-700 shadow-inner">
                     UNCLASSIFIED
                   </p>
                   <div className="mt-3 flex items-center justify-center md:justify-end gap-4 text-xs font-medium text-slate-400">
                     <a href="#" className="hover:text-teal-light transition-colors focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 focus:ring-offset-navy rounded px-1">Privacy Policy</a>
                     <a href="#" className="hover:text-teal-light transition-colors focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 focus:ring-offset-navy rounded px-1">Accessibility</a>
                     <span className="opacity-50">v1.1.0</span>
                   </div>
                </div>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
