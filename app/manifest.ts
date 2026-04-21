import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AUVORA',
    short_name: 'AUVORA',
    description: 'Your aura, curated.',
    start_url: '/',
    display: 'standalone',
    background_color: '#070509',
    theme_color: '#070509',
    icons: [
      {
        src: '/icon-192-v2.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512-v2.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-512-maskable-v2.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
