'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface Product {
  id: string; nume: string; pret: number;
}

export default function CheckoutPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)
  const [cart, setCart] = useState<Product[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Informații facturare
  const [nume, setNume] = useState('')
  const [telefon, setTelefon] = useState('')

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.push('/login')

      setUserId(session.user.id)

      // Încercăm să preluăm automat datele salvate în profilul utilizatorului
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        setNume(profile.full_name || '')
        setTelefon(profile.phone || '')
      }

      setCheckingAuth(false)
      setTimeout(() => setMounted(true), 50)

      const savedCart = localStorage.getItem('digital_cart')
      if (savedCart) setCart(JSON.parse(savedCart))
    }
    checkUser()
  }, [router, supabase])

  const total = cart.reduce((sum, item) => sum + Number(item.pret), 0)
  const isFree = cart.length > 0 && total === 0

  const handleFinalPlata = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || cart.length === 0) return
    setLoading(true)

    try {
      // Structura exactă pentru tabela public.downloads
      const downloadItems = cart.map(item => ({
        product_id: item.id,
        user_id: userId,
        nr_descarcari: 0,
        max_descarcari: 3
      }))

      const { error } = await supabase
        .from('downloads')
        .insert(downloadItems)

      if (error) throw error

      alert(isFree
        ? 'Descărcare activată! Fișierele sunt disponibile în contul tău.'
        : 'Achiziție finalizată! Fișierele sunt disponibile pentru descărcare.'
      )
      localStorage.removeItem('digital_cart')
      window.dispatchEvent(new Event('storage'))
      router.push('/dashboard/client')
    } catch (err) {
      console.error(err)
      alert('Eroare la procesarea comenzii.')
    } finally {
      setLoading(false)
    }
  }

  // FIX: era text-white pe fundal alb + className cu CSS invalid injectat direct.
  // Acum e un div simplu, stilat corect, cu fundal alb și text vizibil.
  if (checkingAuth) {
    return (
      <div style={{
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
      }}>
        Se verifică accesul...
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Mono:wght@400;500;700&display=swap');

        /* Fundal complet alb, text principal închis la culoare */
        .a-root {
          min-height: 100vh;
          background: #ffffff;
          font-family: 'DM Mono', monospace;
          color: #1a1a1a;
          position: relative;
        }

        /* Ambient discret adaptat pentru fundal deschis */
        .a-ambient {
          position: fixed;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(ellipse 80% 50% at 15% 20%, rgba(226,179,110,0.12) 0%, transparent 60%);
        }

        .a-wrap {
          max-width: 1100px;
          margin: 0 auto;
          padding: 140px 40px 100px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.7s ease;
          position: relative;
          z-index: 1;
        }

        .a-wrap.ready {
          opacity: 1;
          transform: translateY(0);
        }

        /* Titlu mare, elegant și foarte vizibil */
        .a-title {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          color: #000000;
          font-weight: 400;
          margin-bottom: 48px;
          letter-spacing: -0.02em;
        }

        .a-title em {
          font-style: italic;
          color: #bfa054;
          font-weight: 400;
        }

        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
        }

        @media(min-width: 992px) {
          .checkout-grid {
            grid-template-columns: 1.4fr 1fr;
          }
        }

        /* Secțiunea de formular - curată, cu bordură fină */
        .a-form-section {
          background: #ffffff;
          border: 1px solid #e5e5e5;
          padding: 40px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
        }

        .a-form-section h3 {
          font-family: 'Playfair Display', serif;
          color: #000000;
          font-weight: 700;
        }

        /* FIX: subtitlu gri închis în loc de alb pe alb */
        .a-form-section p.a-hint {
          color: rgba(26, 26, 26, 0.5);
        }

        /* Câmpuri de input cu linii mai groase și text boldit */
        .a-field {
          margin-bottom: 32px;
          border-bottom: 2px solid #1a1a1a;
          padding-bottom: 8px;
          transition: border-color 0.2s ease;
        }

        .a-field:focus-within {
          border-bottom-color: #bfa054;
        }

        .a-label {
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #000000;
          font-weight: 700;
          display: block;
          margin-bottom: 8px;
        }

        .a-input {
          width: 100%;
          background: none;
          border: none;
          outline: none;
          font-family: 'DM Mono', monospace;
          font-size: 15px;
          color: #000000;
          font-weight: 700;
        }

        /* Cardul cu sumarul comenzii */
        .summary-card {
          background: #fdfdfd;
          border: 1px solid #e5e5e5;
          padding: 40px;
          height: fit-content;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
        }

        .summary-card h3 {
          font-family: 'Playfair Display', serif;
          color: #000000;
          font-weight: 700;
          /* FIX: era border-b border-white/10, acum bordură vizibilă pe fundal deschis */
          border-bottom: 1px solid #e5e5e5;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }

        .item-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: #1a1a1a;
          font-weight: 500;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px dashed #e5e5e5;
        }

        .item-row span:last-child {
          font-weight: 700;
        }

        .summary-empty {
          font-size: 13px;
          color: rgba(26, 26, 26, 0.5);
          padding: 12px 0;
        }

        /* Totalul general - evidențiat puternic, bordură închisă vizibilă pe alb */
        .summary-total {
          display: flex;
          justify-content: space-between;
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          color: #000000;
          font-weight: 700;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 2px solid #1a1a1a;
        }

        .summary-total span:last-child {
          color: #bfa054;
        }

        /* Butonul de plată - complet negru cu text alb, masiv și premium */
        .a-btn-submit {
          display: inline-flex;
          width: 100%;
          justify-content: center;
          background: #000000;
          border: 1px solid #000000;
          color: #ffffff;
          padding: 18px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          font-weight: 700;
          margin-top: 24px;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .a-btn-submit:hover:not(:disabled) {
          background: #bfa054;
          border-color: #bfa054;
          color: #ffffff;
        }

        .a-btn-submit:disabled {
          background: #cccccc;
          border-color: #cccccc;
          color: #666666;
          cursor: not-allowed;
        }

        .a-empty-cart-msg {
          font-size: 12px;
          color: #a32d2d;
          margin-top: 12px;
          text-align: center;
        }
      `}</style>

      <div className="a-root">
        <div className="a-ambient" />
        <Navbar />

        <div className={`a-wrap${mounted ? ' ready' : ''}`}>
          <h1 className="a-title">Detalii <em>finalizare.</em></h1>

          <div className="checkout-grid">
            {/* Formular Facturare */}
            <form onSubmit={handleFinalPlata} className="a-form-section">
              <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Date client</h3>

              <div className="a-field">
                <label className="a-label">Nume complet</label>
                <input className="a-input" type="text" value={nume} onChange={e => setNume(e.target.value)} required />
              </div>

              <div className="a-field">
                <label className="a-label">Telefon</label>
                <input className="a-input" type="text" value={telefon} onChange={e => setTelefon(e.target.value)} required />
              </div>

              <h3 style={{ fontSize: '18px', marginTop: '32px', marginBottom: '16px' }}>
                {isFree ? 'Descărcare gratuită' : 'Metodă de plată'}
              </h3>
              <p className="a-hint" style={{ fontSize: '12px', marginBottom: '24px' }}>
                {isFree
                  ? 'Produsele din coș sunt gratuite — nu e nevoie de card.'
                  : 'Plată securizată cu cardul (Simulare instantă).'}
              </p>

              <button type="submit" className="a-btn-submit" disabled={loading || cart.length === 0}>
                {loading
                  ? 'Se procesează...'
                  : isFree
                    ? 'Obține gratuit'
                    : `Plătește ${total.toFixed(2)} RON`}
              </button>

              {cart.length === 0 && (
                <p className="a-empty-cart-msg">Coșul tău e gol — adaugă produse înainte de a plăti.</p>
              )}
            </form>

            {/* Sumar Produse */}
            <div className="summary-card">
              <h3 style={{ fontSize: '20px' }}>Comanda ta</h3>

              {cart.length === 0 ? (
                <p className="summary-empty">Nu ai produse în coș.</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="item-row">
                    <span>{item.nume}</span>
                    <span style={{ color: '#bfa054' }}>
                      {Number(item.pret) === 0 ? 'Gratuit' : `${Number(item.pret).toFixed(2)} RON`}
                    </span>
                  </div>
                ))
              )}

              <div className="summary-total">
                <span>Total general</span>
                <span>{isFree ? 'Gratuit' : `${total.toFixed(2)} RON`}</span>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  )
}