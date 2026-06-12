'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

export default function AdminDashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  const [adminName, setAdminName] = useState('')
  const [allProjects, setAllProjects] = useState<any[]>([])
  const [allUpdates, setAllUpdates] = useState<any[]>([])
  const [allOrders, setAllOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])

  const [activeTab, setActiveTab] = useState('overview')
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  const [newProduct, setNewProduct] = useState({
    nume: '',
    descriere: '',
    pret: 0,
    categorie: '',
    imagine_url: ''
  })

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
    fetchAdminData()
  }, [])

  async function fetchAdminData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, rol')
        .eq('id', user.id)
        .single()

      if (!profile || (profile.rol !== 'superadmin' && profile.rol !== 'angajat')) {
        return router.push('/dashboard/client')
      }

      setAdminName(profile.full_name || 'Admin')
      setIsSuperAdmin(profile.rol === 'superadmin')

      const { data: p } = await supabase
        .from('projects')
        .select('id, nume, status, created_at')
        .order('created_at', { ascending: false })

      const { data: u } = await supabase
        .from('project_updates')
        .select('id, mesaj, created_at, projects(nume)')
        .order('created_at', { ascending: false })

      const { data: o } = await supabase
        .from('orders')
        .select('id, email, total, status, created_at')
        .order('created_at', { ascending: false })

      const { data: prod } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      setAllProjects(p || [])
      setAllUpdates(u || [])
      setAllOrders(o || [])
      setProducts(prod || [])

    } finally {
      setLoading(false)
    }
  }

  async function createProduct() {
    if (!newProduct.nume) return

    await supabase.from('products').insert([newProduct])

    setNewProduct({
      nume: '',
      descriere: '',
      pret: 0,
      categorie: '',
      imagine_url: ''
    })

    fetchAdminData()
  }

  async function toggleProduct(id: string, field: string, value: any) {
    await supabase.from('products')
      .update({ [field]: value })
      .eq('id', id)

    fetchAdminData()
  }

  async function deleteProduct(id: string) {
    await supabase.from('products')
      .delete()
      .eq('id', id)

    fetchAdminData()
  }

  return (
    <>
      <style>{`
        .a-root{min-height:100vh;background:#0c0c0c;color:#e0e0e0;font-family:DM Mono;display:flex;flex-direction:column}
        .a-dash{max-width:900px;margin:auto;padding:120px 20px;opacity:0;transform:translateY(10px);transition:.4s}
        .a-dash.ready{opacity:1;transform:translateY(0)}

        .a-title{font-size:28px;color:#fff}

        .tabs{display:flex;gap:10px;margin:20px 0 30px;flex-wrap:wrap}
        .tab{
          font-size:10px;
          padding:10px 12px;
          border:1px solid #222;
          background:#111;
          color:#aaa;
          cursor:pointer;
        }
        .tab.active{border-color:#e2b36e;color:#e2b36e}

        .card{
          border:1px solid #1f1f1f;
          background:rgba(255,255,255,0.02);
          padding:12px;
          margin-bottom:10px;
        }

        .grid{
          display:grid;
          grid-template-columns:repeat(2,1fr);
          gap:12px;
        }

        @media(max-width:700px){
          .grid{grid-template-columns:1fr}
        }

        .btn{
          font-size:10px;
          padding:8px 10px;
          border:1px solid #222;
          background:#111;
          color:#aaa;
          cursor:pointer;
        }

        .btn:hover{border-color:#e2b36e;color:#e2b36e}

        .img{
          width:100%;
          height:140px;
          object-fit:cover;
          margin-bottom:10px;
          background:#111;
        }

        input{
          width:100%;
          margin-bottom:8px;
          padding:8px;
          background:transparent;
          border:1px solid #333;
          color:#fff;
        }

        .meta{font-size:10px;color:#777}
        .price{color:#e2b36e}
      `}</style>

      <div className="a-root">
        <Navbar />

        <div className={`a-dash ${mounted ? 'ready' : ''}`}>
          <h1 className="a-title">Admin — {adminName}</h1>

          <button className="btn" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}>
            Logout
          </button>

          {/* TABS */}
          <div className="tabs">
            <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              Overview
            </button>

            <button className={`tab ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
              Proiecte
            </button>

            <button className={`tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
              Comenzi
            </button>

            <button className={`tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
              Magazin
            </button>
          </div>

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              <div className="card">Proiecte: {allProjects.length}</div>
              <div className="card">Comenzi: {allOrders.length}</div>
              <div className="card">Produse: {products.length}</div>
            </>
          )}

          {/* PROJECTS */}
          {activeTab === 'projects' && (
            allProjects.map(p => (
              <div key={p.id} className="card">
                {p.nume}
              </div>
            ))
          )}

          {/* ORDERS */}
          {activeTab === 'orders' && (
            allOrders.map(o => (
              <div key={o.id} className="card">
                {o.email} — {o.total} lei
              </div>
            ))
          )}

          {/* PRODUCTS (SHOPIFY STYLE) */}
          {activeTab === 'products' && (
            <>
              <div className="card">
                <input placeholder="Nume" value={newProduct.nume}
                  onChange={(e) => setNewProduct({ ...newProduct, nume: e.target.value })} />

                <input placeholder="Descriere" value={newProduct.descriere}
                  onChange={(e) => setNewProduct({ ...newProduct, descriere: e.target.value })} />

                <input placeholder="Preț" type="number" value={newProduct.pret}
                  onChange={(e) => setNewProduct({ ...newProduct, pret: Number(e.target.value) })} />

                <input placeholder="Categorie" value={newProduct.categorie}
                  onChange={(e) => setNewProduct({ ...newProduct, categorie: e.target.value })} />

                <input placeholder="Imagine URL" value={newProduct.imagine_url}
                  onChange={(e) => setNewProduct({ ...newProduct, imagine_url: e.target.value })} />

                <button className="btn" onClick={createProduct}>
                  + Adaugă produs
                </button>
              </div>

              <div className="grid">
                {products.map(p => (
                  <div key={p.id} className="card">
                    {p.imagine_url && <img src={p.imagine_url} className="img" />}

                    <div>{p.nume}</div>
                    <div className="meta">{p.categorie}</div>
                    <div className="price">{p.pret} lei</div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button className="btn" onClick={() => toggleProduct(p.id, 'activ', !p.activ)}>
                        activ
                      </button>

                      <button className="btn" onClick={() => toggleProduct(p.id, 'featured', !p.featured)}>
                        featured
                      </button>

                      <button className="btn" onClick={() => deleteProduct(p.id)}>
                        șterge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      
        <Footer />
      </div>
    </>
  )
}