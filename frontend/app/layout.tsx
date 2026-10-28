import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';

export const metadata: Metadata = {
  title: 'Multilingual News Intelligence — Explainable News Framing & Bias Detection',
  description: 'Explainable news framing analysis and cross-language event coverage verification across English, Hindi, Kannada, Telugu, and Tamil.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-700">© 2026 Multilingual News Intelligence System</p>
          <p className="text-slate-500">Developed by Ritik Singh | RV University, Bengaluru</p>
        </footer>
      </body>
    </html>
  );
}

