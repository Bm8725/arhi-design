// src/app/api/checkout/route.ts
import { NextResponse } from 'next/server'
import { stripe, ORDER_STATUS, CURRENCY, toCents } from '@/lib/stripe'
import { supabaseAdmin, getUserFromRequest } from '@/lib/supabase/admin'
import { grantDownloads } from '@/lib/orders'

export const runtime = 'nodejs'

const MAX_ITEMS = 20

interface ProductRow {
  id: string | number
  nume: string
  pret: number | string
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

// Doar în dezvoltare: adaugă motivul real al erorii în mesaj (în producție nu apare nimic)
const dev = (label: string, err: unknown) => {
  if (process.env.NODE_ENV === 'production') return ''
  const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'fără detalii'
  return ` [${label}: ${msg}]`
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Autentificare necesară.' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cerere invalidă.' }, { status: 400 })
  }

  const ids = Array.from(
    new Set(
      Array.isArray(body.items)
        ? body.items.filter((x): x is string | number => typeof x === 'string' || typeof x === 'number')
        : []
    )
  )
  const nume = str(body.nume, 120)
  const telefon = str(body.telefon, 40)

  if (ids.length === 0 || ids.length > MAX_ITEMS) {
    return NextResponse.json({ error: 'Coșul este gol sau conține prea multe produse.' }, { status: 400 })
  }
  if (!nume || !telefon) {
    return NextResponse.json({ error: 'Completați numele și telefonul.' }, { status: 400 })
  }
  if (body.acceptTerms !== true) {
    return NextResponse.json({ error: 'Trebuie să acceptați Termenii și condițiile.' }, { status: 400 })
  }

  const admin = supabaseAdmin()

  // 1) Prețurile vin din baza de date, NU din coșul trimis de browser
  const { data: found, error: prodError } = await admin.from('products').select('id, nume, pret').in('id', ids)
  const products = (found ?? []) as ProductRow[]
  if (prodError || products.length !== ids.length) {
    return NextResponse.json({ error: 'Unele produse nu mai sunt disponibile.' }, { status: 400 })
  }

  // 2) Produse deținute deja
  const { data: ownedRows } = await admin
    .from('downloads')
    .select('product_id')
    .eq('user_id', user.id)
    .in('product_id', ids)
  const owned = new Set((ownedRows ?? []).map((r) => String(r.product_id)))

  const freeItems = products.filter((p) => toCents(p.pret) <= 0 && !owned.has(String(p.id)))
  const paidItems = products.filter((p) => toCents(p.pret) > 0)

  const alreadyOwnedPaid = paidItems.filter((p) => owned.has(String(p.id)))
  if (alreadyOwnedPaid.length > 0) {
    return NextResponse.json(
      { error: `Aveți deja: ${alreadyOwnedPaid.map((p) => p.nume).join(', ')}. Eliminați-le din coș.` },
      { status: 409 }
    )
  }

  // 3) Produsele gratuite se acordă imediat
  let grantedFree = 0
  if (freeItems.length > 0) {
    const { data: freeOrder, error: freeErr } = await admin
      .from('orders')
      .insert({
        email: user.email,
        total: 0,
        status: ORDER_STATUS.paid,
        user_id: user.id,
        billing_name: nume,
        billing_phone: telefon,
      })
      .select('id')
      .single()
    if (freeErr || !freeOrder) {
      console.error('free order', freeErr)
      return NextResponse.json(
        { error: `Nu am putut procesa produsele gratuite.${dev('orders', freeErr)}` },
        { status: 500 }
      )
    }
    const { error: freeItemsErr } = await admin.from('order_items').insert(
      freeItems.map((p) => ({
        order_id: freeOrder.id,
        product_id: String(p.id),
        nume_produs: p.nume,
        pret_la_cumparare: 0,
      }))
    )
    if (freeItemsErr) {
      console.error('free order_items', freeItemsErr)
      await admin.from('orders').delete().eq('id', freeOrder.id)
      return NextResponse.json(
        { error: `Nu am putut procesa produsele gratuite.${dev('order_items', freeItemsErr)}` },
        { status: 500 }
      )
    }
    try {
      await grantDownloads(admin, user.id, freeOrder.id, freeItems.map((p) => p.id))
      grantedFree = freeItems.length
    } catch (e) {
      console.error('grant free', e)
      return NextResponse.json({ error: 'Nu am putut activa descărcările gratuite.' }, { status: 500 })
    }
  }

  if (paidItems.length === 0) {
    return NextResponse.json({ free: true, granted: grantedFree })
  }

  // 4) Produse plătite: cer acordul pentru pierderea dreptului de retragere
  if (body.acceptWithdrawal !== true) {
    return NextResponse.json(
      { error: 'Pentru conținut digital trebuie să confirmați că renunțați la dreptul de retragere.' },
      { status: 400 }
    )
  }

  const totalCents = paidItems.reduce((sum, p) => sum + toCents(p.pret), 0)

  const { data: order, error: orderErr } = await admin
    .from('orders')
    .insert({
      email: user.email,
      total: totalCents / 100,
      status: ORDER_STATUS.pending,
      user_id: user.id,
      billing_name: nume,
      billing_phone: telefon,
      currency: CURRENCY,
      withdrawal_waiver_at: new Date().toISOString(),
    })
    .select('id')
    .single()
  if (orderErr || !order) {
    console.error('order', orderErr)
    return NextResponse.json({ error: `Nu am putut crea comanda.${dev('orders', orderErr)}` }, { status: 500 })
  }

  const { error: itemsErr } = await admin.from('order_items').insert(
    paidItems.map((p) => ({
      order_id: order.id,
      product_id: String(p.id),
      nume_produs: p.nume,
      pret_la_cumparare: toCents(p.pret) / 100,
    }))
  )
  if (itemsErr) {
    console.error('order_items', itemsErr)
    await admin.from('orders').delete().eq('id', order.id)
    return NextResponse.json({ error: `Nu am putut crea comanda.${dev('order_items', itemsErr)}` }, { status: 500 })
  }

  // 5) Sesiune Stripe Checkout (pagină de plată găzduită de Stripe)
  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'ro',
      customer_email: user.email ?? undefined,
      client_reference_id: String(order.id),
      metadata: { order_id: String(order.id), user_id: user.id },
      payment_intent_data: { metadata: { order_id: String(order.id), user_id: user.id } },
      line_items: paidItems.map((p) => ({
        quantity: 1,
        price_data: {
          currency: CURRENCY,
          unit_amount: toCents(p.pret),
          product_data: { name: p.nume },
        },
      })),
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      success_url: `${site}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/checkout?canceled=1`,
    })

    await admin.from('orders').update({ stripe_session_id: session.id }).eq('id', order.id)
    return NextResponse.json({ url: session.url, granted: grantedFree })
  } catch (e) {
    console.error('stripe session', e)
    await admin.from('orders').delete().eq('id', order.id)
    const message = e instanceof Error ? e.message : ''
    const tooSmall = /amount.*(small|least)|at least/i.test(message)
    return NextResponse.json(
      {
        error: tooSmall
          ? 'Suma comenzii este sub minimul acceptat de procesatorul de plăți.'
          : `Nu am putut porni plata. Încercați din nou.${dev('stripe', e)}`,
      },
      { status: 502 }
    )
  }
}