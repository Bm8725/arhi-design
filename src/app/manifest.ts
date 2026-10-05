import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Proarh.4d',
    short_name: 'Proarh.4d',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/proarh4d.ro-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/proarh4d.ro-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ],
  }
}
