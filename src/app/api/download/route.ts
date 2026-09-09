import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/download?token=...
// Caută rândul din `downloads` după token, verifică limita de descărcări,
// incrementează contoarele și redirecționează spre fișierul real.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.json({ error: 'Link invalid — lipsește token-ul.' }, { status: 400 })
  }

  const supabase = createClient()

  // 1. Găsim rândul de download după token
  const { data: downloadRow, error: dErr } = await supabase
    .from('downloads')
    .select('id, product_id, nr_descarcari, max_descarcari')
    .eq('token', token)
    .maybeSingle()

  if (dErr) {
    console.error('download token lookup error:', dErr)
    return NextResponse.json({ error: 'Eroare la verificarea link-ului.' }, { status: 500 })
  }
  if (!downloadRow) {
    return NextResponse.json({ error: 'Link invalid sau expirat.' }, { status: 404 })
  }

  // 2. Verificăm limita de descărcări
  if (downloadRow.nr_descarcari >= downloadRow.max_descarcari) {
    return NextResponse.json(
      { error: `Ai atins limita de ${downloadRow.max_descarcari} descărcări pentru acest produs.` },
      { status: 403 }
    )
  }

  // 3. Preluăm produsul (fișierul de descărcat)
  const { data: product, error: pErr } = await supabase
    .from('products')
    .select('fisier_url, nume')
    .eq('id', downloadRow.product_id)
    .single()

  if (pErr || !product?.fisier_url) {
    return NextResponse.json({ error: 'Fișierul nu este disponibil momentan.' }, { status: 404 })
  }

  // 4. Incrementăm contoarele (atomic, via funcțiile SQL din download_functions.sql)
  const [{ error: incDlErr }, { error: incProdErr }] = await Promise.all([
    supabase.rpc('increment_download_count', { d_id: downloadRow.id }),
    supabase.rpc('increment_product_downloads', { p_id: downloadRow.product_id }),
  ])
  if (incDlErr) console.error('increment_download_count error:', incDlErr)
  if (incProdErr) console.error('increment_product_downloads error:', incProdErr)

  // 5. Redirect către fișierul real
  return NextResponse.redirect(product.fisier_url)
}