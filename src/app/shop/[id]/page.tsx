'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

export default function ProductPage() {
  const supabase = createClient()
  const { id } = useParams()

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) load()
  }, [id])

  async function load() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    setProduct(data || null)
    setLoading(false)
  }

  return (
    <div className="root">

      <Navbar />

      <div className="container">

        {loading && <div className="loading">Se încarcă...</div>}

        {!loading && !product && (
          <div className="empty">Produs inexistent</div>
        )}

        {product && (
          <div className="grid">

            <div className="img">
              {product.imagine_url ? (
                <img src={product.imagine_url} />
              ) : (
                <div className="noimg">No image</div>
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

              <button className="buy">Cumpără</button>

              <button className="wa">WhatsApp</button>

            </div>

          </div>
        )}

      </div>

      <WhatsAppWidget />
      <Footer />

      <style jsx>{`
        .root{
          background:#f7f3ee;
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

        .info h1{
          font-size:30px;
        }

        p{
          color:#666;
          margin:10px 0;
        }

        .price{
          margin:20px 0;
        }

        .old{
          color:#aaa;
          text-decoration:line-through;
        }

        .new{
          color:#b08d57;
          font-size:18px;
        }

        .buy{
          width:100%;
          padding:12px;
          background:#b08d57;
          color:#fff;
          border:none;
          margin-bottom:10px;
        }

        .wa{
          width:100%;
          padding:12px;
          background:#25D366;
          border:none;
        }

        @media(max-width:900px){
          .grid{grid-template-columns:1fr}
        }
      `}</style>

    </div>
  )
}