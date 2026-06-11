import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Proarh.4d',
    short_name: 'Proarh.4d',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [{ src: '/proarh4d.ro.png', sizes: 'any', type: 'image/png' }],
  }
}
