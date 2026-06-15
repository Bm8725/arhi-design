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
  const [cartIds, setCartIds] = useState<string[]>([]) 

  useEffect(() => {
    async function getSession() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    getSession()
    fetchProducts()
    updateCartStatus()

    window.addEventListener('storage', updateCartStatus)
    return () => window.removeEventListener('storage', updateCartStatus)
  }, [supabase])

  async function fetchProducts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('activ', true)
      .order('created_at', { ascending: false })

    if (data) setProducts(data)
    setLoading(false)
  }

  const updateCartStatus = () => {
    const savedCart = JSON.parse(localStorage.getItem('digital_cart') || '[]')
    const ids = savedCart.map((item: any) => item.id)
    setCartIds(ids)
  }

  return (
    <div className="bg-[#ffffff] min-h-screen text-[#1a1a1a] font-mono relative">
      {/* Stiluri injectate pentru consistență premium pe alb */}
      <style>{`
        @import url('https://googleapis.com');
        
        .shop-root {
          font-family: 'DM Mono', monospace;
        }
        .font-serif-premium {
          font-family: 'Playfair Display', serif;
        }
        .a-ambient {
          position: fixed;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(ellipse 80% 50% at 15% 20%, rgba(226,179,110,0.12) 0%, transparent 60%);
          z-index: 0;
        }
        .shop-container {
          position: relative;
          z-index: 1;
        }
      `}</style>

      <div className="a-ambient" />
      <Navbar />

      <div className="shop-container max-w-[1100px] mx-auto px-5 pt-[140px] pb-20 shop-root">
        <div className="mb-14 text-center">
          <span className="text-[#bfa054] text-xs font-bold uppercase tracking-[0.3em] block mb-2">CATALOG</span>
          <h1 className="font-serif-premium text-4xl md:text-5xl font-normal tracking-tight text-black">
            Digital <em>products.</em>
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-24 text-[#bfa054]">
            <div className="w-8 h-8 border-2 border-zinc-200 border-t-[#bfa054] rounded-full mx-auto mb-4 animate-spin" />
            <p className="text-xs uppercase tracking-widest font-bold">Loading catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-zinc-500 py-20 font-bold text-sm uppercase tracking-wider">No products available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {products.map((product) => {
              const isAlreadyInCart = cartIds.includes(product.id)

              return (
                <div key={product.id} className="bg-[#ffffff] border-2 border-[#1a1a1a] overflow-hidden flex flex-col group relative shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                  
                  {/* Badge discret "În Coș" peste imagine */}
                  {isAlreadyInCart && (
                    <span className="absolute top-3 right-3 z-10 bg-black text-[#ffffff] text-[9px] font-mono tracking-widest uppercase px-2 py-1 font-bold">
                      În coș
                    </span>
                  )}

                  <div className="h-56 bg-zinc-50 relative overflow-hidden border-b-2 border-[#1a1a1a]">
                    {product.imagine_url ? (
                      <img 
                        src={product.imagine_url} 
                        alt={product.nume} 
                        className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-zinc-400 text-xs font-bold uppercase tracking-wider">Nicio imagine</div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-grow bg-[#ffffff]">
                    <span className="text-[10px] uppercase tracking-wider text-[#bfa054] mb-2 font-bold">
                      {product.categorie || 'Digital'}
                    </span>
                    <h2 className="font-serif-premium text-xl font-bold mb-3 text-black line-clamp-1">
                      {product.nume}
                    </h2>
                    <p className="text-zinc-600 text-xs font-medium line-clamp-2 mb-6 flex-grow leading-relaxed">
                      {product.descriere_scurta || product.descriere}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-5 border-t-2 border-[#1a1a1a]">
                      <span className="text-black font-bold text-lg tracking-tight">
                        {Number(product.pret).toFixed(2)} lei
                      </span>
                      
                      <Link 
                        href={`/shop/${product.id}`} 
                        className={`px-5 py-3 font-bold text-xs uppercase tracking-widest transition duration-200 text-center ${
                          isAlreadyInCart 
                            ? 'bg-zinc-100 text-zinc-500 border border-zinc-300 hover:bg-zinc-200 hover:text-black' 
                            : 'bg-black text-white hover:bg-[#bfa054]'
                        }`}
                      >
                        {isAlreadyInCart ? 'Vizualizează' : 'Detalii'}
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <WhatsAppWidget />
      <Footer />
    </div>
  )
}
