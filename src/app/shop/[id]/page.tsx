'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

export default function ProductDetailPage() {
  const supabase = createClient()
  const params = useParams()
  
  // Date de contact pentru metodă secundară
  const TELEFON_WHATSAPP = "40722123456" 

  const id = params?.id ? (Array.isArray(params.id) ? params.id : params.id) : null

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

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
    } else {
      setLoading(false)
      setError("ID-ul produsului lipsește sau adresa URL este incorectă.")
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

  // Text rezervă WhatsApp
  const textWhatsApp = product 
    ? encodeURIComponent(`Salut! Doresc asistență sau plată prin transfer pentru proiectul: "${product.nume}".`)
    : ""

  // Stabilim unde trimite butonul principal (Stripe Link din DB sau în lipsă, WhatsApp)
  const linkPlataPlatit = product?.stripe_link || `https://wa.me{TELEFON_WHATSAPP}?text=${textWhatsApp}`

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white">
      <Navbar currentUserId={userId} />

      <div className="max-w-[1100px] mx-auto px-5 pt-[140px] pb-20">
        
        {loading && (
          <div className="text-center py-28 text-[#e2b36e]">
            <div className="w-10 h-10 border-2 border-zinc-800 border-t-[#e2b36e] rounded-full mx-auto mb-4 animate-spin" />
            <p className="text-sm">Se încarcă produsul...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-24 text-red-500">
            <p className="text-lg font-medium">{error}</p>
          </div>
        )}

        {product && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* IMAGINE */}
            <div className="h-[380px] md:h-[480px] bg-zinc-900 border border-zinc-800 overflow-hidden rounded-sm relative">
              {product.imagine_url ? (
                <img src={product.imagine_url} alt={product.nume} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-600 text-sm">Nicio imagine disponibilă</div>
              )}
            </div>

            {/* INFORMAȚII */}
            <div className="flex flex-col">
              <span className="inline-block text-[10px] tracking-[2px] uppercase text-[#e2b36e] mb-2 font-medium">
                {product.categorie || 'Digital Product'}
              </span>

              <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight text-white">{product.nume}</h1>

              <p className="text-zinc-400 text-sm leading-relaxed mb-6">{product.descriere || "Fără descriere."}</p>

              <div className="flex gap-4 items-center mb-6">
                {product.pret_vechi && (
                  <span className="text-zinc-600 line-through text-base">{Number(product.pret_vechi).toFixed(2)} lei</span>
                )}
                <span className="text-[#e2b36e] text-2xl font-semibold">{Number(product.pret).toFixed(2)} lei</span>
              </div>

              {/* BUTON PRINCIPAL CARD (STRIPE) */}
              <a 
                href={linkPlataPlatit}
                className="w-full py-4 bg-[#e2b36e] text-black font-bold text-xs uppercase tracking-widest hover:bg-[#d4a45f] transition text-center mb-3 rounded-sm block"
              >
                {product?.stripe_link ? "Plătește în siguranță cu Cardul" : "Comandă pe WhatsApp"}
              </a>

              {/* BUTON SECUNDAR (OPȚIONAL WHATSAPP DACĂ STRIPE E ACTIV) */}
              {product?.stripe_link && (
                <a 
                  href={`https://wa.me{TELEFON_WHATSAPP}?text=${encodeURIComponent(`Salut! Vreau să cumpăr prin Transfer Bancar proiectul: "${product.nume}"`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs text-center transition rounded-sm block"
                >
                  Vreau plată prin Transfer Bancar / IBAN
                </a>
              )}

            </div>

          </div>
        )}
      </div>

      <WhatsAppWidget />
      <Footer />
    </div>
  )
}
