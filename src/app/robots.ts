import { MetadataRoute } from 'next'

// Next.js generează automat /robots.txt din acest fișier când e pus în app/robots.ts


const baseUrl = 'https://proarh4d.ro'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',        // zonele private (admin + client) nu au ce căuta indexate
          '/dashboard/*',
          '/login',
          '/signup',
          '/forgot-password',
          '/checkout',
          '/api/*',            // orice rută API internă
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}