'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Share2, Check } from 'lucide-react'

// Importurile care lipseau și provocau eroarea Runtime
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

export default function ProductDetailPage() {
  const supabase = createClient()
  const params = useParams()
  const router = useRouter()
  
  const id = params?.id ? (Array.isArray(params.id) ? params.id : params.id) : null

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isInCart, setIsInCart] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function getSession() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    getSession()
  }, [supabase])

  useEffect(() => {
    if (id && id !== 'null' && id !== 'undefined' && id.length > 10) {
      loadProduct()
      checkIfInCart()
    } else {
      setLoading(false)
      setError("ID-ulDoc produsului lipsește sau adresa URL este incorectă.")
    }
  }, [id])

  async function loadProduct() {
    setLoading(true)
    setError(null)
    try {
      const { data, error: supabaseError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (supabaseError || !data) {
        setError('Produsul nu a fost găsit în baza de date.')
        return
      }
      setProduct(data)
    } catch (err) {
      setError('A apărut o eroare tehnică la încărcare.')
    } finally {
      setLoading(false)
    }
  }

  const checkIfInCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('digital_cart') || '[]')
    const exists = savedCart.some((item: any) => item.id === id)
    setIsInCart(exists)
  }

  const handleAddToCart = () => {
    if (!product) return

    const savedCart = JSON.parse(localStorage.getItem('digital_cart') || '[]')
    const exists = savedCart.some((item: any) => item.id === product.id)

    if (!exists) {
      const updatedCart = [...savedCart, {
        id: product.id,
        nume: product.nume,
        pret: product.pret,
        imagine_url: product.imagine_url,
        descriere_scurta: product.descriere_scurta
      }]
      localStorage.setItem('digital_cart', JSON.stringify(updatedCart))
      
      window.dispatchEvent(new Event('storage'))
      setIsInCart(true)
    } else {
      router.push('/shopping-cart')
    }
  }

  const handleShare = async () => {
    if (!product) return

    const shareData = {
      title: product.nume,
      text: product.descriere_scurta || product.descriere || 'Vezi acest proiect digital pe Proarh.4d',
      url: window.location.href,
    }

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Distribuire anulată:', err)
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Nu s-a putut copia link-ul', err)
      }
    }
  }

  return (
    <div className="bg-[#ffffff] min-h-screen text-[#1a1a1a] font-mono relative">
      <style>{`
        @import url('https://googleapis.com');
        
        .product-root { font-family: 'DM Mono', monospace; }
        .font-serif-premium { font-family: 'Playfair Display', serif; }
        .a-ambient {
          position: fixed; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse 80% 50% at 15% 20%, rgba(226,179,110,0.12) 0%, transparent 60%);
          z-index: 0;
        }
        .product-container { position: relative; z-index: 1; }
        .btn-black-solid {
          display: inline-flex; width: 100%; justify-content: center; align-items: center;
          background: #000000; border: 1px solid #000000; color: #ffffff; padding: 18px;
          font-size: 11px; text-transform: uppercase; letter-spacing: 0.25em; font-weight: 700;
          cursor: pointer; transition: all 0.25s ease; text-decoration: none;
        }
        .btn-black-solid:hover { background: #bfa054; border-color: #bfa054; }
        .btn-outline-share {
          display: inline-flex; width: 100%; justify-content: center; align-items: center; gap: 10px;
          background: transparent; border: 2px solid #1a1a1a; color: #1a1a1a; padding: 14px;
          font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 700;
          cursor: pointer; transition: all 0.25s ease; margin-top: 12px;
        }
        .btn-outline-share:hover { background: #1a1a1a; color: #ffffff; }
      `}</style>

      <div className="a-ambient" />
      <Navbar/>

      <div className="product-container max-w-[1100px] mx-auto px-5 pt-[140px] pb-20 product-root">
        
        {loading && (
          <div className="text-center py-28 text-[#bfa054]">
            <div className="w-8 h-8 border-2 border-zinc-200 border-t-[#bfa054] rounded-full mx-auto mb-4 animate-spin" />
            <p className="text-xs uppercase tracking-widest font-bold">Loading project details...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-24 text-red-500 font-bold">
            <p className="text-lg">{error}</p>
          </div>
        )}

        {product && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            <div className="h-[380px] md:h-[480px] bg-zinc-50 border-2 border-[#1a1a1a] overflow-hidden relative shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              {product.imagine_url ? (
                <img src={product.imagine_url} alt={product.nume} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-400 text-xs font-bold uppercase tracking-wider">No image available</div>
              )}
            </div>

            <div className="flex flex-col">
              <span className="inline-block text-[10px] tracking-[0.25em] uppercase text-[#bfa054] mb-2 font-bold">
                {product.categorie || 'Proiect Digital'}
              </span>

              <h1 className="font-serif-premium text-3xl md:text-4xl font-bold mb-4 tracking-tight text-black">
                {product.nume}
              </h1>

              <p className="text-zinc-700 text-xs font-medium leading-relaxed mb-6">
                {product.descriere || product.descriere_scurta || "Produs digital de înaltă calitate cu livrare securizată și descărcare instantă în contul de utilizator."}
              </p>

              <div className="flex gap-4 items-center mb-8">
                {product.pret_vechi && (
                  <span className="text-zinc-400 line-through text-base font-medium">{Number(product.pret_vechi).toFixed(2)} lei</span>
                )}
                <span className="text-black text-2xl font-bold tracking-tight">{Number(product.pret).toFixed(2)} lei</span>
              </div>

              <div className="border-t-2 border-[#1a1a1a] pt-6">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-4">
                  Acces și descărcare fișiere proiect
                </p>

                {isInCart ? (
                  <Link href="/shopping-cart" className="btn-black-solid" style={{ background: '#bfa054', borderColor: '#bfa054' }}>
                    Vezi coșul de cumpărături →
                  </Link>
                ) : (
                  <button onClick={handleAddToCart} className="btn-black-solid">
                    Adaugă în coș
                  </button>
                )}

                <button onClick={handleShare} className="btn-outline-share">
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" /> Link copiat!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" /> Distribuie proiectul
                    </>
                  )}
                </button>

                <p className="text-[10px] text-zinc-400 text-center pt-4 font-medium leading-relaxed">
                  * Tranzacție securizată. Link-ul unic generat va fi disponibil instant în panoul de control după procesarea plății.
                </p>
              </div>

            </div>

          </div>
        )}
      </div>

      <WhatsAppWidget />
      <Footer />
    </div>
  )
}
