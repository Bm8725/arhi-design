'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

export default function ProductPage() {
  const supabase = createClient()
  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) load()
  }, [id])

  async function load() {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      setError('Produsul nu a fost găsit')
      setLoading(false)
      return
    }

    setProduct(data)
    setLoading(false)
  }

  return (
    <div className="root">

      <Navbar />

      <div className="container">

        {/* LOADING */}
        {loading && (
          <div className="loading">
            <div className="spinner" />
            <p>Se încarcă produsul...</p>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {/* PRODUCT */}
        {product && (
          <div className="grid">

            {/* IMAGE */}
            <div className="img">
              {product.imagine_url ? (
                <img src={product.imagine_url} />
              ) : (
                <div className="noimg">No image</div>
              )}
            </div>

            {/* INFO */}
            <div className="info">

              <div className="badge">Digital Product</div>

              <h1>{product.nume}</h1>

              <p>{product.descriere}</p>

              <div className="price">
                {product.pret_vechi && (
                  <span className="old">{product.pret_vechi} lei</span>
                )}
                <span className="new">{product.pret} lei</span>
              </div>

              <button className="buy">
                Cumpără acum
              </button>

              <button className="secondary">
                Plată securizată & instant download
              </button>

            </div>

          </div>
        )}

      </div>

      <WhatsAppWidget />
      <Footer />

      <style jsx>{`
        .root{
          background:#0a0a0a;
          min-height:100vh;
          color:#fff;
        }

        .container{
          max-width:1100px;
          margin:0 auto;
          padding:140px 20px 80px;
        }

        .grid{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:50px;
          align-items:center;
        }

        .img{
          height:480px;
          background:#111;
          border:1px solid #1f1f1f;
          overflow:hidden;
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
          color:#444;
        }

        .badge{
          display:inline-block;
          font-size:10px;
          letter-spacing:1px;
          text-transform:uppercase;
          color:#e2b36e;
          margin-bottom:10px;
        }

        h1{
          font-size:34px;
          margin-bottom:10px;
        }

        p{
          color:#aaa;
          font-size:14px;
          line-height:1.6;
          margin-bottom:20px;
        }

        .price{
          display:flex;
          gap:12px;
          align-items:center;
          margin-bottom:25px;
        }

        .old{
          color:#666;
          text-decoration:line-through;
        }

        .new{
          color:#e2b36e;
          font-size:22px;
        }

        .buy{
          width:100%;
          padding:14px;
          background:#e2b36e;
          color:#000;
          border:none;
          cursor:pointer;
          font-weight:600;
          margin-bottom:10px;
          transition:.2s;
        }

        .buy:hover{
          opacity:0.9;
        }

        .secondary{
          width:100%;
          padding:12px;
          background:#111;
          border:1px solid #222;
          color:#aaa;
        }

        .loading{
          text-align:center;
          padding:120px 20px;
          color:#e2b36e;
        }

        .spinner{
          width:40px;
          height:40px;
          border:3px solid #222;
          border-top:3px solid #e2b36e;
          border-radius:50%;
          margin:0 auto 15px;
          animation:spin 1s linear infinite;
        }

        @keyframes spin{
          0%{transform:rotate(0)}
          100%{transform:rotate(360deg)}
        }

        .error{
          text-align:center;
          padding:100px;
          color:#ff4d4d;
        }

        @media(max-width:900px){
          .grid{grid-template-columns:1fr}
          .img{height:380px}
          .container{padding-top:120px}
        }
      `}</style>

    </div>
  )
}