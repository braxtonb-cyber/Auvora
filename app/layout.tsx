import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AUVORA — Your Aura, Curated',
  description: 'An AI-powered aura operating system. Generate your complete lifestyle vibe.',
  keywords: ['aura', 'lifestyle', 'fashion', 'fragrance', 'vibe'],
  authors: [{ name: 'AUVORA' }],
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
