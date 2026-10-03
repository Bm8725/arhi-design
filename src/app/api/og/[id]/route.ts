import { NextResponse } from 'next/server'
import sharp from 'sharp'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SITE = 'https://proarh4d.ro'

async function fallback() {
  const r = await fetch(`${SITE}/arhi4d.png`)
  return new NextResponse(await r.arrayBuffer(), { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=300' } })
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> | { id: string } }) {
  const { id } = await ctx.params
  try {
    if (!/^[0-9a-f-]{20,}$/i.test(id)) return await fallback()

    const base = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const r = await fetch(`${base}/rest/v1/products?id=eq.${encodeURIComponent(id)}&select=imagine_url&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
    const url: string | undefined = (await r.json())?.[0]?.imagine_url
    if (!url) return await fallback()

    const img = await fetch(url)
    if (!img.ok) return await fallback()

    const out = await sharp(Buffer.from(await img.arrayBuffer()), { animated: false }) // GIF: prima imagine
      .rotate()
      .resize(1200, 630, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer()

    return new NextResponse(new Uint8Array(out), {
      headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800' },
    })
  } catch {
    return await fallback()
  }
}