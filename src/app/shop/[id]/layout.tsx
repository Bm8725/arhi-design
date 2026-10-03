import type { Metadata } from 'next'
import type { ReactNode } from 'react'

const SITE = 'https://proarh4d.ro'

// WhatsApp / Facebook nu afișează bine aceste formate, deci trec prin /api/og/[id], care le face JPEG
const NEEDS_CONVERT = /\.(gif|webp|avif|svg|bmp|tiff?)(\?.*)?$/i

type Product = {
  nume: string | null
  categorie: string | null
  pret: number | null
  descriere: string | null
  descriere_scurta: string | null
  imagine_url: string | null
}

async function getProduct(id: string): Promise<Product | null> {
  if (!/^[0-9a-f-]{20,}$/i.test(id)) return null
  try {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const res = await fetch(
      `${base}/rest/v1/products?id=eq.${encodeURIComponent(id)}&select=nume,categorie,pret,descriere,descriere_scurta,imagine_url&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, next: { revalidate: 60 } }
    )
    if (!res.ok) return null
    const rows = await res.json()
    return rows?.[0] ?? null
  } catch {
    return null
  }
}

const clean = (s: string | null | undefined) => (s || '').replace(/\s+/g, ' ').trim()
const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s)

export async function generateMetadata({ params }: { params: Promise<{ id: string }> | { id: string } }): Promise<Metadata> {
  const { id } = await params
  const p = await getProduct(id)

  const title = p?.nume ? `${clean(p.nume)} | Proarh4d.ro` : 'Proarh4d.ro'

  const price = p?.pret != null && !isNaN(Number(p.pret)) ? `${Number(p.pret).toFixed(2).replace('.', ',')} lei` : ''
  const meta = [clean(p?.categorie), price].filter(Boolean).join(' · ')
  const about = clean(p?.descriere_scurta) || clean(p?.descriere) || 'Proiect digital cu descărcare instantă în contul tău, după plată.'
  const description = cut(meta ? `${meta} — ${about}` : about, 160)

  const photo = p?.imagine_url && /^https?:\/\//i.test(p.imagine_url) ? p.imagine_url : null
  const image = !photo ? `${SITE}/arhi4d.png` : NEEDS_CONVERT.test(photo) ? `${SITE}/api/og/${id}` : photo

  return {
    metadataBase: new URL(SITE),
    title,
    description,
    alternates: { canonical: `/shop/${id}` },
    openGraph: { type: 'website', locale: 'ro_RO', siteName: 'Proarh.4d', title, description, url: `/shop/${id}`, images: [{ url: image, alt: clean(p?.nume) || 'Proarh.4d' }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}

export default function ProductLayout({ children }: { children: ReactNode }) {
  return children
}