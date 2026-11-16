'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Lock, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface Product {
  id: string
  nume: string
  pret: number
}

/* Insigne de plată (SVG inline, fără imagini externe).
   Pentru logo-urile oficiale exacte, descarcă-le din pachetele de brand Visa / Mastercard / Stripe
   și înlocuiește conținutul de mai jos. */
function VisaBadge() {
  return (
    <span className="pay-badge" role="img" aria-label="Visa">
      <svg viewBox="0 0 48 16" width="44" height="15" aria-hidden="true">
        <text
          x="0"
          y="13"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="16"
          fontWeight="900"
          fontStyle="italic"
          fill="#1A1F71"
          letterSpacing="0.5"
        >
          VISA
        </text>
      </svg>
    </span>
  )
}

function MastercardBadge() {
  return (
    <span className="pay-badge" role="img" aria-label="Mastercard">
      <svg viewBox="0 0 32 20" width="34" height="21" aria-hidden="true">
        <circle cx="11" cy="10" r="8" fill="#EB001B" />
        <circle cx="21" cy="10" r="8" fill="#F79E1B" />
        <path d="M16 3.755A8 8 0 0 1 16 16.245A8 8 0 0 1 16 3.755Z" fill="#FF5F00" />
      </svg>
    </span>
  )
}

function StripeBadge() {
  return (
    <span className="pay-badge pay-badge-stripe" role="img" aria-label="Plată procesată de Stripe">
      <Lock size={12} aria-hidden="true" />
      <span>
        Powered by <strong>Stripe</strong>
      </span>
    </span>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [mounted, setMounted] = useState(false)
  const [cart, setCart] = useState<Product[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Informații facturare
  const [nume, setNume] = useState('')
  const [telefon, setTelefon] = useState('')

  // Acorduri legale
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptWithdrawal, setAcceptWithdrawal] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    async function checkUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return router.push('/login')

      setUserId(session.user.id)

      // Preluăm datele salvate în profil, dacă există
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        setNume(profile.full_name || '')
        setTelefon(profile.phone || '')
      }

      // Coșul din browser e doar pentru afișare; prețurile reale se calculează pe server
      try {
        const savedCart = localStorage.getItem('digital_cart')
        if (savedCart) setCart(JSON.parse(savedCart))
      } catch {
        /* coș corupt: îl ignorăm */
      }

      if (new URLSearchParams(window.location.search).get('canceled') === '1') {
        setNotice('Plata a fost anulată. Coșul a fost păstrat, puteți încerca din nou.')
      }

      setCheckingAuth(false)
      setTimeout(() => setMounted(true), 50)
    }
    checkUser()
  }, [router, supabase])

  const total = cart.reduce((sum, item) => sum + Number(item.pret), 0)
  const isFree = cart.length > 0 && total === 0
  const paidItems = cart.filter((item) => Number(item.pret) > 0)
  const freeItems = cart.filter((item) => Number(item.pret) <= 0)
  const hasPaidItems = paidItems.length > 0

  const canSubmit =
    !loading && cart.length > 0 && acceptTerms && (!hasPaidItems || acceptWithdrawal)

  const handleFinalPlata = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || cart.length === 0 || !canSubmit) return

    setError(null)
    setLoading(true)
    let redirecting = false

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          items: cart.map((i) => i.id),
          nume,
          telefon,
          acceptTerms,
          acceptWithdrawal,
        }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.error || 'Eroare la procesarea comenzii. Încercați din nou.')
        return
      }

      // Produse plătite: mergem la pagina de plată Stripe
      if (data.url) {
        redirecting = true
        window.location.href = data.url
        return
      }

      // Doar produse gratuite: accesul a fost activat pe server
      localStorage.removeItem('digital_cart')
      window.dispatchEvent(new Event('storage'))
      window.dispatchEvent(new Event('cartUpdated'))
      router.push('/dashboard/client')
    } catch (err) {
      console.error(err)
      setError('Nu m-am putut conecta la server. Verificați conexiunea și încercați din nou.')
    } finally {
      if (!redirecting) setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'DM Mono', monospace",
          fontSize: '12px',
          color: '#bfa054',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}
      >
        Se verifică accesul...
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Mono:wght@400;500;700&display=swap');

        .a-root { min-height: 100vh; background: #ffffff; font-family: 'DM Mono', monospace; color: #1a1a1a; position: relative; }
        .a-ambient { position: fixed; inset: 0; pointer-events: none; background: radial-gradient(ellipse 80% 50% at 15% 20%, rgba(226,179,110,0.12) 0%, transparent 60%); }
        .a-wrap { max-width: 1100px; margin: 0 auto; padding: 140px 40px 100px; opacity: 0; transform: translateY(20px); transition: all 0.7s ease; position: relative; z-index: 1; }
        .a-wrap.ready { opacity: 1; transform: translateY(0); }
        .a-title { font-family: 'Playfair Display', serif; font-size: 36px; color: #000000; font-weight: 400; margin-bottom: 48px; letter-spacing: -0.02em; }
        .a-title em { font-style: italic; color: #bfa054; font-weight: 400; }

        .checkout-grid { display: grid; grid-template-columns: 1fr; gap: 40px; }
        @media (min-width: 992px) { .checkout-grid { grid-template-columns: 1.4fr 1fr; } }
        @media (max-width: 600px) { .a-wrap { padding: 110px 20px 70px; } .a-form-section, .summary-card { padding: 26px 20px; } }

        .a-form-section { background: #ffffff; border: 1px solid #e5e5e5; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .a-form-section h3 { font-family: 'Playfair Display', serif; color: #000000; font-weight: 700; }
        .a-form-section p.a-hint { color: rgba(26,26,26,0.6); line-height: 1.6; }

        .a-field { margin-bottom: 32px; border-bottom: 2px solid #1a1a1a; padding-bottom: 8px; transition: border-color 0.2s ease; }
        .a-field:focus-within { border-bottom-color: #bfa054; }
        .a-label { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #000000; font-weight: 700; display: block; margin-bottom: 8px; }
        .a-input { width: 100%; background: none; border: none; outline: none; font-family: 'DM Mono', monospace; font-size: 15px; color: #000000; font-weight: 700; }

        .a-check { display: flex; gap: 12px; align-items: flex-start; font-size: 12px; line-height: 1.6; color: #1a1a1a; margin-bottom: 14px; cursor: pointer; }
        .a-check input { margin-top: 3px; width: 16px; height: 16px; accent-color: #bfa054; flex: none; cursor: pointer; }
        .a-check a { color: #8a6d2b; text-decoration: underline; text-underline-offset: 3px; }
        .a-check strong { font-weight: 700; }

        .summary-card { background: #fdfdfd; border: 1px solid #e5e5e5; padding: 40px; height: fit-content; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .summary-card h3 { font-family: 'Playfair Display', serif; color: #000000; font-weight: 700; border-bottom: 1px solid #e5e5e5; padding-bottom: 12px; margin-bottom: 16px; }
        .item-row { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; color: #1a1a1a; font-weight: 500; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px dashed #e5e5e5; }
        .item-row span:last-child { font-weight: 700; white-space: nowrap; }
        .summary-empty { font-size: 13px; color: rgba(26,26,26,0.5); padding: 12px 0; }
        .summary-total { display: flex; justify-content: space-between; font-family: 'Playfair Display', serif; font-size: 22px; color: #000000; font-weight: 700; margin-top: 24px; padding-top: 24px; border-top: 2px solid #1a1a1a; }
        .summary-total span:last-child { color: #bfa054; }
        .summary-note { font-size: 11px; color: rgba(26,26,26,0.55); line-height: 1.6; margin-top: 14px; }

        .a-btn-submit { display: inline-flex; width: 100%; justify-content: center; background: #000000; border: 1px solid #000000; color: #ffffff; padding: 18px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.25em; font-weight: 700; margin-top: 24px; cursor: pointer; transition: all 0.25s ease; font-family: inherit; }
        .a-btn-submit:hover:not(:disabled) { background: #bfa054; border-color: #bfa054; color: #ffffff; }
        .a-btn-submit:disabled { background: #cccccc; border-color: #cccccc; color: #666666; cursor: not-allowed; }
        .a-btn-submit:focus-visible { outline: 2px solid #bfa054; outline-offset: 3px; }

        .a-empty-cart-msg { font-size: 12px; color: #a32d2d; margin-top: 12px; text-align: center; }
        .a-error { font-size: 12px; color: #a32d2d; background: #fdf0f0; border: 1px solid #f2d5d5; padding: 12px 16px; margin-top: 16px; line-height: 1.5; }
        .a-notice { font-size: 12px; color: #6b5420; background: #fbf6e9; border: 1px solid #efe2b8; padding: 12px 16px; margin-bottom: 24px; line-height: 1.5; }
        .a-secure { font-size: 11px; color: rgba(26,26,26,0.55); text-align: center; margin-top: 14px; line-height: 1.6; }

        /* Fundal discret + insigne de încredere */
        .a-form-section { position: relative; overflow: hidden; }
        .a-form-section > * { position: relative; z-index: 1; }
        .a-form-section > .a-watermark { position: absolute; z-index: 0; right: -40px; bottom: -40px; color: #bfa054; opacity: 0.07; pointer-events: none; }

        .a-trust { margin-top: 22px; padding-top: 18px; border-top: 1px dashed #e5e5e5; }
        .a-trust-badges { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 10px; margin-bottom: 14px; }
        .pay-badge { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 32px; padding: 0 12px; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
        .pay-badge-stripe { font-size: 11px; color: #425466; }
        .pay-badge-stripe strong { color: #635BFF; font-weight: 700; }
        .pay-badge-stripe svg { color: #635BFF; }
        .a-trust-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
        .a-trust-list li { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 11.5px; line-height: 1.5; color: rgba(26,26,26,0.7); }
        .a-trust-list svg { color: #2e7d4f; flex: none; }
        .a-trust-final { font-size: 11px; color: rgba(26,26,26,0.5); text-align: center; margin-top: 12px; line-height: 1.6; }
      `}</style>

      <div className="a-root">
        <div className="a-ambient" />
        <Navbar />

        <div className={`a-wrap${mounted ? ' ready' : ''}`}>
          <h1 className="a-title">
            Finalizare <em>comandă.</em>
          </h1>

          {notice && (
            <div className="a-notice" role="status">
              {notice}
            </div>
          )}

          <div className="checkout-grid">
            {/* Formular */}
            <form onSubmit={handleFinalPlata} className="a-form-section">
              <ShieldCheck className="a-watermark" size={240} strokeWidth={1} aria-hidden="true" />
              <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Date client</h3>

              <div className="a-field">
                <label className="a-label" htmlFor="co-nume">Nume și prenume</label>
                <input
                  id="co-nume"
                  className="a-input"
                  type="text"
                  value={nume}
                  onChange={(e) => setNume(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="a-field">
                <label className="a-label" htmlFor="co-tel">Telefon</label>
                <input
                  id="co-tel"
                  className="a-input"
                  type="tel"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  autoComplete="tel"
                  required
                />
              </div>

              <h3 style={{ fontSize: '18px', marginTop: '32px', marginBottom: '16px' }}>
                {isFree ? 'Descărcare gratuită' : 'Plată'}
              </h3>
              <p className="a-hint" style={{ fontSize: '12px', marginBottom: '24px' }}>
                {hasPaidItems
                  ? 'Veți fi redirecționat către Stripe pentru plata securizată cu cardul (Visa / Mastercard). Nu stocăm datele cardului dvs.'
                  : 'Produsele din coș sunt gratuite, nu este nevoie de card.'}
                {hasPaidItems && freeItems.length > 0
                  ? ' Produsele gratuite din coș se activează imediat în cont.'
                  : ''}
              </p>

              {/* Acorduri legale */}
              <label className="a-check">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  required
                />
                <span>
                  Am citit și accept <Link href="/termeni-conditii" target="_blank">Termenii și condițiile</Link> și{' '}
                  <Link href="/politica-confidentialitate" target="_blank">Politica de confidențialitate</Link>.
                </span>
              </label>

              {hasPaidItems && (
                <label className="a-check">
                  <input
                    type="checkbox"
                    checked={acceptWithdrawal}
                    onChange={(e) => setAcceptWithdrawal(e.target.checked)}
                    required
                  />
                  <span>
                    Sunt de acord ca livrarea conținutului digital să înceapă imediat după plată și recunosc că,
                    odată începută descărcarea, <strong>îmi pierd dreptul de retragere de 14 zile</strong>.
                  </span>
                </label>
              )}

              <button type="submit" className="a-btn-submit" disabled={!canSubmit}>
                {loading
                  ? 'Se procesează...'
                  : hasPaidItems
                  ? `Plătește ${total.toFixed(2)} RON cu cardul`
                  : 'Obține gratuit'}
              </button>

              {cart.length === 0 && (
                <p className="a-empty-cart-msg">Coșul este gol. Adăugați produse înainte de a continua.</p>
              )}

              {error && (
                <div className="a-error" role="alert">
                  {error}
                </div>
              )}

              {hasPaidItems && (
                <div className="a-trust" aria-label="Plată securizată">
                  <div className="a-trust-badges">
                    <VisaBadge />
                    <MastercardBadge />
                    <StripeBadge />
                  </div>
                  <ul className="a-trust-list">
                    <li>
                      <ShieldCheck size={15} aria-hidden="true" /> Plată securizată, conexiune criptată
                    </li>
                    <li>
                      <Lock size={15} aria-hidden="true" /> Nu stocăm datele cardului dvs.
                    </li>
                    <li>
                      <Download size={15} aria-hidden="true" /> Descărcare imediat după confirmarea plății
                    </li>
                  </ul>
                  <p className="a-trust-final">Prețul final este cel confirmat pe pagina de plată.</p>
                </div>
              )}
            </form>

            {/* Sumar */}
            <div className="summary-card">
              <h3 style={{ fontSize: '20px' }}>Comanda dvs.</h3>

              {cart.length === 0 ? (
                <p className="summary-empty">Nu aveți produse în coș.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="item-row">
                    <span>{item.nume}</span>
                    <span style={{ color: '#bfa054' }}>
                      {Number(item.pret) === 0 ? 'Gratuit' : `${Number(item.pret).toFixed(2)} RON`}
                    </span>
                  </div>
                ))
              )}

              <div className="summary-total">
                <span>Total</span>
                <span>{isFree ? 'Gratuit' : `${total.toFixed(2)} RON`}</span>
              </div>

              <p className="summary-note">
                Produsele sunt digitale, livrate prin descărcare din contul dvs. imediat după confirmarea plății.
              </p>
              {hasPaidItems && (
                <div className="a-trust-badges" style={{ justifyContent: 'flex-start', marginTop: 16, marginBottom: 0 }}>
                  <VisaBadge />
                  <MastercardBadge />
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  )
}