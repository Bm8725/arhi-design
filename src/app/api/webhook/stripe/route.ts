// src/app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe, ORDER_STATUS, CURRENCY, toCents } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { grantDownloads } from '@/lib/orders'

export const runtime = 'nodejs'

async function fulfill(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id ?? session.client_reference_id
  if (!orderId) {
    console.error('[stripe] sesiune fără order_id', session.id)
    return
  }

  const admin = supabaseAdmin()
  const { data: order, error } = await admin
    .from('orders')
    .select('id, user_id, total, status')
    .eq('id', orderId)
    .maybeSingle()
  if (error) throw error
  if (!order) {
    console.error('[stripe] comandă inexistentă', orderId)
    return
  }

  // Verificare: suma și moneda plătite trebuie să corespundă comenzii din baza de date
  const expected = toCents(order.total)
  if (session.amount_total !== expected || session.currency !== CURRENCY) {
    console.error('[stripe] sumă/monedă diferită', {
      orderId,
      expected,
      got: session.amount_total,
      currency: session.currency,
    })
    return
  }

  // Marchează plătită (doar dacă încă e pending) – siguranță la retrimiterea evenimentului
  if (order.status !== ORDER_STATUS.paid) {
    const paymentIntent = typeof session.payment_intent === 'string' ? session.payment_intent : null
    const { error: updErr } = await admin
      .from('orders')
      .update({
        status: ORDER_STATUS.paid,
        stripe_session_id: session.id,
        stripe_payment_intent: paymentIntent,
      })
      .eq('id', orderId)
      .eq('status', ORDER_STATUS.pending)
    if (updErr) throw updErr
  }

  // Acordă accesul la fișiere (rulează și la retry; nu creează duplicate)
  const { data: items, error: itemsErr } = await admin
    .from('order_items')
    .select('product_id')
    .eq('order_id', orderId)
  if (itemsErr) throw itemsErr

  await grantDownloads(
    admin,
    order.user_id,
    order.id,
    (items ?? []).map((i) => i.product_id)
  )
}

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!signature || !secret) {
    return NextResponse.json({ error: 'Configurare webhook lipsă.' }, { status: 400 })
  }

  const raw = await req.text() // corpul brut, necesar pentru verificarea semnăturii
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret)
  } catch {
    return NextResponse.json({ error: 'Semnătură invalidă.' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.payment_status === 'paid') await fulfill(session)
        break
      }
      case 'checkout.session.expired': {
        // Sesiune neplătită: ștergem comanda rămasă „pending”
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.order_id
        if (orderId) {
          await supabaseAdmin().from('orders').delete().eq('id', orderId).eq('status', ORDER_STATUS.pending)
        }
        break
      }
      default:
        break
    }
  } catch (e) {
    console.error('[stripe] eroare la procesare', e)
    // 500 => Stripe retrimite evenimentul
    return NextResponse.json({ error: 'Eroare la procesare.' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}