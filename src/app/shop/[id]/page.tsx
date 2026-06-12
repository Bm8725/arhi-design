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
  
  // Datele tale de contact reale pentru Proarh.4d
  const TELEFON_WHATSAPP = "40722123456" // Înlocuiește cu numărul tău real
  const EMAIL_STUDIO = "contact@proarh4d.ro" // Înlocuiește cu email-ul tău real

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

  // Mesaje personalizate dinamice cu numele proiectului selectat
  const textWhatsApp = product 
    ? encodeURIComponent(`Salut! Doresc mai multe detalii despre proiectul: "${product.nume}".`)
    : ""

  const subiectEmail = product 
    ? encodeURIComponent(`Solicitare informații: ${product.nume}`)
    : ""

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white">
      <Navbar/>

      <div className="max-w-[1100px] mx-auto px-5 pt-[140px] pb-20">
        
        {loading && (
          <div className="text-center py-28 text-[#e2b36e]">
            <div className="w-10 h-10 border-2 border-zinc-800 border-t-[#e2b36e] rounded-full mx-auto mb-4 animate-spin" />
            <p className="text-sm">Se încarcă detaliile proiectului...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-24 text-red-500">
            <p className="text-lg font-medium">{error}</p>
          </div>
        )}

        {product && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* IMAGINE PROIECT */}
            <div className="h-[380px] md:h-[480px] bg-zinc-900 border border-zinc-800 overflow-hidden rounded-sm relative">
              {product.imagine_url ? (
                <img src={product.imagine_url} alt={product.nume} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-600 text-sm">Nicio imagine disponibilă</div>
              )}
            </div>

            {/* INFORMAȚII & CONTACT ACHIZIȚIE */}
            <div className="flex flex-col">
              <span className="inline-block text-[10px] tracking-[2px] uppercase text-[#e2b36e] mb-2 font-medium">
                {product.categorie || 'Studio Design'}
              </span>

              <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight text-white">{product.nume}</h1>

              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                {product.descriere || "Contactați-ne direct pentru a discuta detaliile tehnice, adaptarea proiectului sau opțiunile de livrare."}
              </p>

              {/* Caseta de preț (Opțională - o poți păstra sau șterge dacă vrei ofertă personalizată) */}
              <div className="flex gap-4 items-center mb-6">
                {product.pret_vechi && (
                  <span className="text-zinc-600 line-through text-base">{Number(product.pret_vechi).toFixed(2)} lei</span>
                )}
                <span className="text-[#e2b36e] text-2xl font-semibold">{Number(product.pret).toFixed(2)} lei</span>
              </div>

              {/* SECȚIUNE DE CONTACT INSTANT */}
              <div className="border-t border-zinc-800 pt-6 space-y-3">
                <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                  Contactați-ne pentru achiziție & detalii
                </p>

                {/* Buton principal WhatsApp */}
                <a 
                  href={`https://wa.me{TELEFON_WHATSAPP}?text=${textWhatsApp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-[#e2b36e] text-black font-bold text-xs uppercase tracking-widest hover:bg-[#d4a45f] transition text-center rounded-sm block"
                >
                  Discută pe WhatsApp
                </a>

                {/* Buton secundar Email */}
                <a 
                  href={`mailto:${EMAIL_STUDIO}?subject=${subiectEmail}`}
                  className="w-full py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 text-xs text-center transition rounded-sm block font-medium tracking-wide"
                >
                  Trimite Email către Studio
                </a>
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
