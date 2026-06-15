'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

interface Product {
  id: string; nume: string; descriere_scurta: string | null; pret: number; imagine_url: string | null;
}

export default function ShoppingCartPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)
  const [cart, setCart] = useState<Product[]>([])
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.push('/login') // Redirecționare dacă nu e logat

      setCheckingAuth(false)
      setTimeout(() => setMounted(true), 50)
      const savedCart = localStorage.getItem('digital_cart')
      if (savedCart) setCart(JSON.parse(savedCart))
    }
    checkUser()
  }, [router, supabase])

  const removeFromCart = (id: string) => {
    const updated = cart.filter(item => item.id !== id)
    setCart(updated)
    localStorage.setItem('digital_cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('storage'))
  }

  const total = cart.reduce((sum, item) => sum + Number(item.pret), 0)

  if (checkingAuth) return <div className="a-root flex items-center justify-center text-[12px] text-[#e2b36e]">SE VERIFICĂ ACCESUL...</div>

  return (
    <>
<style>{`
  @import url('https://googleapis.com');
  
  /* Fundal alb și text închis la culoare */
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
  
  /* Sprânceană / Eyebrow îngroșat */
  .a-eyebrow {
    font-size: 11px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #bfa054; /* Auriu-bronz intens pentru contrast */
    font-weight: 700;
    margin-bottom: 18px;
  }
  
  /* Titlu mare, elegant */
  .a-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(28px, 4vw, 42px);
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
  
  .cart-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  @media(min-width: 992px) {
    .cart-grid {
      grid-template-columns: 1.6fr 1fr;
    }
  }
  
  /* Produse din coș - linii mai vizibile și text puternic */
  .cart-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 28px 0;
    border-bottom: 2px solid #1a1a1a; /* Linie solidă groasă neagră */
  }
  
  .item-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    color: #000000;
    font-weight: 700; /* Titlu produs boldat */
    margin-bottom: 6px;
  }
  
  /* Butonul de ștergere textat vizibil */
  .btn-remove {
    background: none;
    border: none;
    color: #666666;
    cursor: pointer;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    padding: 4px 0;
    transition: color 0.2s ease;
  }
  
  .btn-remove:hover {
    color: #ff4d4d;
  }
  
  /* Prețul din dreptul produsului - boldat */
  .cart-item .text-\\[\\#e2b36e\\] {
    color: #000000 !important;
    font-size: 16px;
    font-weight: 700;
  }
  
  /* Cardul cu sumarul din dreapta */
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
  }
  
  /* Rânduri text sumar */
  .summary-card .flex {
    font-weight: 500;
    color: #1a1a1a;
  }
  
  /* Total general în coș */
  .summary-card .font-serif.text-lg {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    color: #000000;
    font-weight: 700;
    border-top: 2px solid #1a1a1a;
    padding-top: 24px;
    margin-top: 24px;
  }
  
  .summary-card .text-\\[\\#e2b36e\\] {
    color: #bfa054 !important;
  }
  
  /* Butonul principal spre Checkout - bloc solid negru cu text alb, masiv */
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
    margin-top: 32px;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.25s ease;
  }
  
  .a-btn-submit:hover {
    background: #bfa054;
    border-color: #bfa054;
    color: #ffffff;
  }
`}</style>


      <div className="a-root">
        <div className="a-ambient" />
        <Navbar />

        <div className={`a-wrap${mounted ? ' ready' : ''}`}>
          <div className="a-eyebrow">Comandă sigură</div>
          <h1 className="a-title">Coșul tău de <em>achiziții.</em></h1>

          {cart.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-white/40 text-sm">Coșul este gol.</p>
              <Link href="/shop" className="text-[#e2b36e] text-xs uppercase mt-4 block">← Înapoi la magazin</Link>
            </div>
          ) : (
            <div className="cart-grid">
              <div>
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div>
                      <h3 className="item-title">{item.nume}</h3>
                      <button onClick={() => removeFromCart(item.id)} className="btn-remove hover:text-red-400">[ Șterge ]</button>
                    </div>
                    <div className="text-[#e2b36e]">{Number(item.pret).toFixed(2)} RON</div>
                  </div>
                ))}
              </div>

              <div className="summary-card">
                <h3 className="font-serif text-xl border-b border-white/10 pb-3">Sumar</h3>
                <div className="flex justify-between text-xs my-4 text-white/60"><span>Produse ({cart.length})</span><span>{total.toFixed(2)} RON</span></div>
                <div className="flex justify-between font-serif text-lg pt-4 border-t border-white/10"><span>Total</span><span className="text-[#e2b36e]">{total.toFixed(2)} RON</span></div>
                
                {/* Schimbat în Link pentru trimitere securizată către pagina separată de checkout */}
                <Link href="/checkout" className="a-btn-submit hover:border-[#e2b36e] hover:text-white">
                  Continuă spre checkout
                </Link>
              </div>
            </div>
          )}
        </div>
    
        <Footer />
      </div>
    </>
  )
}
