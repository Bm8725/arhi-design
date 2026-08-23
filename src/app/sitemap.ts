import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/client'


const baseUrl = 'https://proarh4d.ro'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Pagini statice — ajustează lista dacă mai ai/lipsesc rute ──
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/portofoliu`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/servicii`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/proiectare-arhitectura`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/randari-3d`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/politica-cookie`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/politica-confidentialitate`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // ── Pagini dinamice: produse active din Supabase ──
  // IMPORTANT: presupun că fiecare produs are o pagină la /shop/[id].
  // Dacă folosești un slug în loc de id, sau altă rută (ex: /produse/[slug]),
  // schimbă linia "url:" mai jos să reflecte structura ta reală.
  let productRoutes: MetadataRoute.Sitemap = []
  try {
    const supabase = createClient()
    const { data: products } = await supabase
      .from('products')
      .select('id, created_at')
      .eq('activ', true)

    if (products) {
      productRoutes = products.map((p) => ({
        url: `${baseUrl}/shop/${p.id}`,
        lastModified: new Date(p.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    }
  } catch (err) {
    // Dacă fetch-ul eșuează la build, nu blocăm tot sitemap-ul — doar sărim peste produse
    console.error('Sitemap: eroare la fetch produse', err)
  }

  return [...staticRoutes, ...productRoutes]
}