import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, DM_Mono, Jost } from 'next/font/google';
import { MotionConfig } from '@/components/motion/MotionConfig';
import './globals.css';

// ── Fonts — loaded centrally so design/tokens.ts references resolve app-wide ──

const cormorant = Cormorant_Garamond({
  subsets:  ['latin'],
  weight:   ['300', '400', '500'],
  style:    ['normal', 'italic'],
  variable: '--font-cormorant',
  display:  'swap',
});

const jost = Jost({
  subsets:  ['latin'],
  weight:   ['300', '400', '500'],
  variable: '--font-jost',
  display:  'swap',
});

const dmMono = DM_Mono({
  subsets:  ['latin'],
  weight:   ['300', '400'],
  variable: '--font-dm-mono',
  display:  'swap',
});

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'AUVORA — Your Aura, Curated',
  description: 'An AI-powered aura operating system. Generate your complete lifestyle vibe.',
  keywords: ['aura', 'lifestyle', 'fashion', 'fragrance', 'vibe'],
  authors: [{ name: 'AUVORA by Brogan Atelier' }],
  manifest: '/manifest.webmanifest?v=2',
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', sizes: 'any' },
      { url: '/icon.png?v=2', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico?v=2'],
    apple: [{ url: '/apple-icon.png?v=2', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'AUVORA',
    description: 'Your aura, curated.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0E0C0B',
};

// ── Root layout ───────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cormorant.variable} ${jost.variable} ${dmMono.variable}`}
    >
      <body>
        <MotionConfig>{children}</MotionConfig>
      </body>
    </html>
  );
}
