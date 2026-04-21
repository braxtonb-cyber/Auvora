import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AUVORA — Your Aura, Curated',
  description: 'An AI-powered aura operating system. Generate your complete lifestyle vibe.',
  keywords: ['aura', 'lifestyle', 'fashion', 'fragrance', 'vibe'],
  authors: [{ name: 'AUVORA' }],
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
  themeColor: '#070509',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
