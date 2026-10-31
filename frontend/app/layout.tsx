import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CustomCursor from '../components/ui/CustomCursor';
import ScrollProgressBar from '../components/ui/ScrollProgressBar';
import SmoothScrollProvider from '../components/ui/SmoothScrollProvider';

export const metadata: Metadata = {
  title: 'Multilingual News Intelligence — News Without Borders',
  description:
    'Swiss International Typographic Style platform for explainable news framing analysis and cross-language event coverage verification across English, Hindi, Bengali, Kannada, Telugu, and Tamil.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#E85D26',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-warmOffWhite text-almostBlack font-sans antialiased selection:bg-burntOrange selection:text-pureWhite overflow-x-hidden">
        {/* Subtle Scroll Progress Indicator */}
        <ScrollProgressBar />

        {/* Minimal Interactive Custom Cursor */}
        <CustomCursor />

        {/* Smooth Scrolling Provider with Lenis + GSAP ScrollTrigger Synchronization */}
        <SmoothScrollProvider>
          {/* Global Navigation Shell */}
          <Navbar />

          {/* Global Main Content Foundation */}
          <main className="flex-1 w-full overflow-x-hidden">
            {children}
          </main>

          {/* Global Architectural Footer */}
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
