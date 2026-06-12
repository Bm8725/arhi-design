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
          <div className="loadingBox">
            Se încarcă produsul...
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="errorBox">
            {error}
          </div>
        )}

        {/* PRODUCT */}
        {product && (
          <div className="grid">

            <div className="img">
              {product.imagine_url && (
                <img src={product.imagine_url} />
              )}
            </div>

            <div className="info">

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
                Plată securizată
              </button>

            </div>

          </div>
        )}

      </div>

      <WhatsAppWidget />
      <Footer />

      <style jsx>{`
        .root{
          background:#f5f2ec;
          min-height:100vh;
          color:#111;
        }

        .container{
          max-width:1000px;
          margin:0 auto;
          padding:120px 20px;
        }

        .grid{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:40px;
        }

        .img{
          height:420px;
          background:#eee;
        }

        .img img{
          width:100%;
          height:100%;
          object-fit:cover;
        }

        h1{
          font-size:30px;
        }

        p{
          color:#666;
          margin:10px 0 20px;
        }

        .price{
          margin-bottom:20px;
        }

        .old{
          color:#aaa;
          text-decoration:line-through;
        }

        .new{
          color:#b08d57;
          font-size:20px;
        }

        .buy{
          width:100%;
          padding:14px;
          background:#111;
          color:#fff;
          border:none;
          margin-bottom:10px;
        }

        .secondary{
          width:100%;
          padding:12px;
          background:#b08d57;
          color:#fff;
          border:none;
        }

        .loadingBox,
        .errorBox{
          text-align:center;
          padding:80px;
          color:#b08d57;
        }

        @media(max-width:900px){
          .grid{grid-template-columns:1fr}
        }
      `}</style>

    </div>
  )
}