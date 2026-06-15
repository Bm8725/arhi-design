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

      alert('Achiziție finalizată! Fișierele sunt disponibile pentru descărcare.')
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

  if (checkingAuth) return <div className="a-root flex items-center justify-center text-[12px] text-[#e2b36e] background:#0c0c0c;min-height:100vh;">SE VERIFICĂ ACCESUL...</div>

  return (
    <>
<style>{`
  @import url('https://googleapis.com');
  
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
    color: #bfa054; /* Un auriu mai intens pentru contrast pe fundal alb */
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
  
  /* Câmpuri de input cu linii mai groase și text boldit */
  .a-field {
    margin-bottom: 32px;
    border-bottom: 2px solid #1a1a1a; /* Linie neagră, mai groasă */
    padding-bottom: 8px;
    transition: border-color 0.2s ease;
  }
  
  .a-field:focus-within {
    border-bottom-color: #bfa054;
  }
  
  /* Etichete mult mai vizibile și îngroșate */
  .a-label {
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #000000;
    font-weight: 700; /* Îngroșat puternic */
    display: block;
    margin-bottom: 8px;
  }
  
  /* Textul introdus în input este boldit și clar */
  .a-input {
    width: 100%;
    background: none;
    border: none;
    outline: none;
    font-family: 'DM Mono', monospace;
    font-size: 15px;
    color: #000000;
    font-weight: 700; /* Text boldat la scriere */
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
  }
  
  /* Rândurile cu produsele cumpărate */
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
  
  /* Totalul general - evidențiat puternic */
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
  
  .a-btn-submit:hover {
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
`}</style>


      <div className="a-root">
        <div className="a-ambient" />
        <Navbar />

        <div className={`a-wrap${mounted ? ' ready' : ''}`}>
          <h1 className="a-title">Detalii <em>finalizare.</em></h1>

          <div className="checkout-grid">
            {/* Formular Facturare */}
            <form onSubmit={handleFinalPlata} className="a-form-section">
              <h3 className="font-serif text-lg mb-6 text-white">Date client</h3>
              
              <div className="a-field">
                <label className="a-label">Nume Complet</label>
                <input className="a-input" type="text" value={nume} onChange={e => setNume(e.target.value)} required />
              </div>
              
              <div className="a-field">
                <label className="a-label">Telefon</label>
                <input className="a-input" type="text" value={telefon} onChange={e => setTelefon(e.target.value)} required />
              </div>

              <h3 className="font-serif text-lg mb-4 mt-8 text-white">Metodă de plată</h3>
              <p className="text-xs text-white/50 mb-6">Plată securizată cu cardul (Simulare instantă).</p>

              <button type="submit" className="a-btn-submit hover:border-[#e2b36e] hover:text-white" disabled={loading || cart.length === 0}>
                {loading ? 'Se procesează...' : `Plătește ${total.toFixed(2)} RON`}
              </button>
            </form>

            {/* Sumar Produse */}
            <div className="summary-card">
              <h3 className="font-serif text-xl border-b border-white/10 pb-3 mb-4">Comanda ta</h3>
              {cart.map(item => (
                <div key={item.id} className="item-row">
                  <span>{item.nume}</span>
                  <span className="text-[#e2b36e]">{Number(item.pret).toFixed(2)} RON</span>
                </div>
              ))}
              <div className="flex justify-between font-serif text-lg pt-4 mt-4 border-t border-white/10 text-white">
                <span>Total general</span>
                <span className="text-[#e2b36e]">{total.toFixed(2)} RON</span>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  )
}
