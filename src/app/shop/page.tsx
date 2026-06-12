'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

export default function ShopPage() {
  const supabase = createClient()

  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('activ', true)
      .order('created_at', { ascending: false })

    setProducts(data || [])
    setLoading(false)
  }

  return (
    <div className="root">

      <Navbar />

      {/* spacing mai jos + look premium */}
      <div className="hero">
        <h1>Shop</h1>
        <p>Produse digitale premium selectate</p>
      </div>

      {loading && (
        <div className="loading">Se încarcă...</div>
      )}

      <div className="grid">
        {!loading && products.map(p => (
          <div key={p.id} className="card">

            <div className="img">
              {p.imagine_url ? (
                <img src={p.imagine_url} />
              ) : (
                <div className="noimg">No image</div>
              )}
            </div>

            <div className="content">

              <h3>
                {p.nume}
                {p.featured && <span>★</span>}
              </h3>

              <p>{p.descriere_scurta}</p>

              <div className="price">
                {p.pret_vechi && (
                  <span className="old">{p.pret_vechi} lei</span>
                )}
                <span className="new">{p.pret} lei</span>
              </div>

              <Link href={`/shop/${p.id}`} className="btn">
                Vezi produs
              </Link>

            </div>

          </div>
        ))}
      </div>

      <WhatsAppWidget />
      <Footer />

      <style jsx>{`
        .root{
          background:#f7f3ee; /* crem real */
          min-height:100vh;
          color:#111;
        }

        /* 🔥 SPAȚIU MAI JOS (exact ce ai cerut) */
        .hero{
          text-align:center;
          padding:140px 20px 60px;
        }

        .hero h1{
          font-size:42px;
          font-weight:500;
          letter-spacing:-1px;
        }

        .hero p{
          color:#666;
          font-size:14px;
          margin-top:10px;
        }

        .loading{
          text-align:center;
          color:#b08d57;
        }

        .grid{
          max-width:1100px;
          margin:0 auto;
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:20px;
          padding:20px;
        }

        .card{
          background:#fff;
          border:1px solid #e7dfd4;
          transition:.2s;
        }

        .card:hover{
          transform:translateY(-4px);
          border-color:#b08d57;
        }

        .img{
          height:180px;
          background:#eee;
        }

        .img img{
          width:100%;
          height:100%;
          object-fit:cover;
        }

        .noimg{
          display:flex;
          align-items:center;
          justify-content:center;
          height:100%;
          color:#999;
        }

        .content{
          padding:14px;
        }

        h3{
          font-size:15px;
          display:flex;
          justify-content:space-between;
        }

        p{
          font-size:12px;
          color:#666;
          margin:10px 0;
        }

        .price{
          display:flex;
          gap:10px;
          margin-bottom:10px;
        }

        .old{
          color:#aaa;
          text-decoration:line-through;
        }

        .new{
          color:#b08d57;
          font-weight:600;
        }

        .btn{
          display:block;
          text-align:center;
          padding:10px;
          background:#b08d57;
          color:#fff;
          text-decoration:none;
          font-size:12px;
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