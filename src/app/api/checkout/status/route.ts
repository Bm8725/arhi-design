// src/app/api/checkout/status/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin, getUserFromRequest } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Autentificare necesară.' }, { status: 401 })

  const sessionId = new URL(req.url).searchParams.get('session_id')
  if (!sessionId || sessionId.length > 200) {
    return NextResponse.json({ error: 'session_id lipsă.' }, { status: 400 })
  }

  // Doar comanda utilizatorului curent
  const { data: order, error } = await supabaseAdmin()
    .from('orders')
    .select('status')
    .eq('stripe_session_id', sessionId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: 'Eroare la verificare.' }, { status: 500 })
  return NextResponse.json({ status: order?.status ?? 'unknown' })
}