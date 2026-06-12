'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

type Product = {
  id: string
  nume: string
  descriere_scurta: string
  pret: number
  pret_vechi: number | null
  imagine_url: string | null
  featured: boolean
}

export default function ShopPage() {
  const supabase = createClient()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('activ', true)
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setProducts(data || [])
    setLoading(false)
  }

  return (
    <div className="root">

      <Navbar />

      <div className="container">

        <h1 className="title">Shop</h1>
        <p className="sub">Produse digitale disponibile instant</p>

        {/* ERROR */}
        {error && (
          <div className="error">
            Eroare la încărcare: {error}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="loading">
            Se încarcă produsele...
          </div>
        )}

        {/* EMPTY */}
        {!loading && products.length === 0 && (
          <div className="empty">
            Nu există produse disponibile.
          </div>
        )}

        {/* GRID */}
        <div className="grid">
          {products.map((p) => (
            <div key={p.id} className="card">

              <div className="img">
                {p.imagine_url ? (
                  <img src={p.imagine_url} alt={p.nume} />
                ) : (
                  <div className="noimg">Fără imagine</div>
                )}
              </div>

              <div className="content">

                <div className="top">
                  <h3>{p.nume}</h3>
                  {p.featured && <span className="badge">featured</span>}
                </div>

                <p>{p.descriere_scurta}</p>

                <div className="price">
                  {p.pret_vechi && (
                    <span className="old">{p.pret_vechi} lei</span>
                  )}
                  <span className="new">{p.pret} lei</span>
                </div>

                <button className="btn">
                  Vezi produs
                </button>

              </div>

            </div>
          ))}
        </div>

      </div>

      <WhatsAppWidget />
      <Footer />

      <style jsx>{`
        .root{
          background:#0c0c0c;
          min-height:100vh;
          color:#fff;
        }

        .container{
          max-width:1100px;
          margin:0 auto;
          padding:80px 20px;
        }

        .title{
          font-size:32px;
          margin-bottom:6px;
        }

        .sub{
          color:#aaa;
          font-size:13px;
          margin-bottom:30px;
        }

        .error{
          background:#2a0f0f;
          color:#ff6b6b;
          padding:10px;
          margin-bottom:20px;
        }

        .loading,.empty{
          color:#e2b36e;
          margin-bottom:20px;
        }

        .grid{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:20px;
        }

        .card{
          background:#111;
          border:1px solid #222;
          overflow:hidden;
        }

        .img{
          height:180px;
          background:#0a0a0a;
        }

        .img img{
          width:100%;
          height:100%;
          object-fit:cover;
        }

        .noimg{
          height:100%;
          display:flex;
          align-items:center;
          justify-content:center;
          color:#444;
        }

        .content{
          padding:14px;
        }

        .top{
          display:flex;
          justify-content:space-between;
          align-items:center;
        }

        h3{
          font-size:14px;
        }

        .badge{
          font-size:9px;
          background:#e2b36e;
          color:#000;
          padding:3px 6px;
        }

        p{
          font-size:12px;
          color:#aaa;
          margin:10px 0;
        }

        .price{
          display:flex;
          gap:10px;
          margin-bottom:10px;
        }

        .old{
          color:#666;
          text-decoration:line-through;
          font-size:12px;
        }

        .new{
          color:#e2b36e;
        }

        .btn{
          width:100%;
          padding:10px;
          background:#e2b36e;
          border:none;
          cursor:pointer;
        }

        @media(max-width:900px){
          .grid{grid-template-columns:repeat(2,1fr)}
        }

        @media(max-width:600px){
          .grid{grid-template-columns:1fr}
        }
      `}</style>

    </div>
  )
}