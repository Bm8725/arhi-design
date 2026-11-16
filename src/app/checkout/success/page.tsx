'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

type State = 'checking' | 'paid' | 'pending' | 'error'

const MAX_TRIES = 15 // ~30 secunde

export default function CheckoutSuccessPage() {
  const supabase = useMemo(() => createClient(), [])
  const [state, setState] = useState<State>('checking')

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id')
    if (!sessionId) {
      setState('error')
      return
    }

    let stopped = false
    let tries = 0
    let timer: ReturnType<typeof setTimeout> | undefined

    const clearCart = () => {
      try {
        localStorage.removeItem('digital_cart')
      } catch {
        /* storage indisponibil */
      }
      window.dispatchEvent(new Event('storage'))
      window.dispatchEvent(new Event('cartUpdated'))
    }

    const tick = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          if (!stopped) setState('error')
          return
        }

        const res = await fetch(`/api/checkout/status?session_id=${encodeURIComponent(sessionId)}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        const data = await res.json().catch(() => ({}))
        if (stopped) return

        if (data.status === 'paid') {
          clearCart()
          setState('paid')
          return
        }
      } catch {
        /* reîncercăm */
      }

      tries += 1
      if (tries >= MAX_TRIES) {
        clearCart() // Stripe a redirecționat aici, deci plata a fost trimisă
        if (!stopped) setState('pending')
        return
      }
      timer = setTimeout(tick, 2000)
    }

    tick()
    return () => {
      stopped = true
      if (timer) clearTimeout(timer)
    }
  }, [supabase])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Mono:wght@400;500;700&display=swap');
      `}</style>

      <div className="min-h-screen bg-white relative" style={{ fontFamily: "'DM Mono', monospace" }}>
        <Navbar />

        <main className="max-w-xl mx-auto px-6 pt-36 pb-24 text-center">
          {state === 'checking' && (
            <div role="status">
              <div
                className="mx-auto mb-5 w-8 h-8 rounded-full border-2 border-[#bfa054]/25 border-t-[#bfa054] animate-spin"
                aria-hidden="true"
              />
              <h1 className="text-2xl text-black mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Confirmăm plata...
              </h1>
              <p className="text-[13px] text-zinc-500">Durează câteva secunde. Nu închideți pagina.</p>
            </div>
          )}

          {state === 'paid' && (
            <div>
              <CheckCircle2 size={44} className="mx-auto text-emerald-600 mb-5" />
              <h1 className="text-3xl text-black mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                Plata a fost confirmată
              </h1>
              <p className="text-[13px] text-zinc-600 leading-relaxed mb-8">
                Mulțumim! Fișierele sunt acum disponibile în contul dvs., la secțiunea de descărcări.
              </p>
              <Link
                href="/dashboard/client"
                className="inline-flex items-center justify-center bg-black text-white px-8 py-4 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#bfa054] transition-colors"
              >
                Mergi la descărcările mele
              </Link>
            </div>
          )}

          {state === 'pending' && (
            <div>
              <Clock size={44} className="mx-auto text-[#bfa054] mb-5" />
              <h1 className="text-3xl text-black mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                Plata se procesează
              </h1>
              <p className="text-[13px] text-zinc-600 leading-relaxed mb-8">
                Confirmarea durează mai mult decât de obicei. Produsele vor apărea în cont în câteva minute.
                Dacă nu le vedeți, scrieți-ne și rezolvăm imediat.
              </p>
              <Link
                href="/dashboard/client"
                className="inline-flex items-center justify-center bg-black text-white px-8 py-4 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#bfa054] transition-colors"
              >
                Mergi în cont
              </Link>
            </div>
          )}

          {state === 'error' && (
            <div role="alert">
              <AlertTriangle size={44} className="mx-auto text-red-600 mb-5" />
              <h1 className="text-3xl text-black mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                Nu am putut verifica comanda
              </h1>
              <p className="text-[13px] text-zinc-600 leading-relaxed mb-8">
                Linkul este invalid sau sesiunea a expirat. Dacă ați plătit, produsele apar în cont în scurt timp.
              </p>
              <Link
                href="/dashboard/client"
                className="inline-flex items-center justify-center bg-black text-white px-8 py-4 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#bfa054] transition-colors"
              >
                Mergi în cont
              </Link>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  )
}