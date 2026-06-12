'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

export default function ShopPage() {
  const supabase = createClient()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function getSession() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    getSession()
    fetchProducts()
  }, [supabase])

  async function fetchProducts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('activ', true) // Afișează doar produsele active
      .order('created_at', { ascending: false })

    if (data) setProducts(data)
    setLoading(false)
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white">
      <Navbar/>


      <div className="max-w-[1100px] mx-auto px-5 pt-[140px] pb-20">
        <div className="mb-10 text-center">
          <span className="text-[#e2b36e] text-xs font-bold uppercase tracking-widest">Proarh.4d Shop</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 tracking-tight">Proiecte Digitale & Resurse</h1>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#e2b36e]">
            <div className="w-10 h-10 border-2 border-zinc-800 border-t-[#e2b36e] rounded-full mx-auto mb-4 animate-spin" />
            <p className="text-sm">Se încarcă catalogul...</p>
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-zinc-500 py-20">Nu există produse disponibile momentan.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden flex flex-col group">
                <div className="h-56 bg-zinc-950 relative overflow-hidden">
                  {product.imagine_url ? (
                    <img 
                      src={product.imagine_url} 
                      alt={product.nume} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-700 text-xs">Nicio imagine</div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <span className="text-[10px] uppercase tracking-wider text-[#e2b36e] mb-1 font-medium">{product.categorie || 'Digital'}</span>
                  <h2 className="text-lg font-bold mb-2 text-white line-clamp-1">{product.nume}</h2>
                  <p className="text-zinc-400 text-xs line-clamp-2 mb-4 flex-grow">{product.descriere_scurta || product.descriere}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800">
                    <span className="text-[#e2b36e] font-semibold text-lg">{Number(product.pret).toFixed(2)} lei</span>
                    {/* AICI SE REZOLVĂ LEGĂTURA: Trimitem ID-ul corect în URL */}
                    <Link href={`/shop/${product.id}`} className="px-4 py-2 bg-[#e2b36e] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#d4a45f] transition">
                      Detalii
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <WhatsAppWidget />
      <Footer />
    </div>
  )
}
