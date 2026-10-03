import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { headers } from 'next/headers'

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

async function getOrigin() {
  const h = await headers()
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000'
  const proto = h.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

const clean = (s: string | null | undefined) => (s || '').replace(/\s+/g, ' ').trim()
const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s)

export async function generateMetadata({ params }: { params: Promise<{ id: string }> | { id: string } }): Promise<Metadata> {
  const { id } = await params
  const [p, origin] = await Promise.all([getProduct(id), getOrigin()])

  const title = p?.nume ? `${clean(p.nume)} | Proarh.4d` : 'Proarh.4d'

  const price = p?.pret != null && !isNaN(Number(p.pret)) ? `${Number(p.pret).toFixed(2).replace('.', ',')} lei` : ''
  const meta = [clean(p?.categorie), price].filter(Boolean).join(' · ')
  const about = clean(p?.descriere_scurta) || clean(p?.descriere) || 'Proiect digital cu descărcare instantă în contul tău, după plată.'
  const description = cut(meta ? `${meta} — ${about}` : about, 160)

  const image = p?.imagine_url && /^https?:\/\//i.test(p.imagine_url) ? p.imagine_url : `${origin}/arhi4d.png`

  return {
    metadataBase: new URL(origin),
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