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
  
  // Stări pentru date administrative
  const [adminName, setAdminName] = useState('')
  const [allProjects, setAllProjects] = useState<any[]>([])
  const [recentUpdates, setRecentUpdates] = useState<any[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
    fetchAdminData()
  }, [])

  async function fetchAdminData() {
    try {
      // 1. Verifică sesiunea și rolul de admin/angajat
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, rol')
        .eq('id', user.id)
        .single()

      // Redirecționare dacă un client încearcă să spargă URL-ul de admin
      if (profile?.rol !== 'superadmin' && profile?.rol !== 'angajat') {
        router.push('/dashboard/client')
        return
      }
      
      setAdminName(profile?.full_name || 'Administrator')

      // 2. Extrage TOATE proiectele din birou (fără filtru de client_id)
      const { data: p } = await supabase
        .from('projects')
        .select('id, nume, status, profiles!projects_client_id_fkey(full_name)')
        .order('created_at', { ascending: false })

      // 3. Extrage ultimele actualizări adăugate în jurnal
      const { data: u } = await supabase
        .from('project_updates')
        .select('id, mesaj, created_at, projects(nume)')
        .order('created_at', { ascending: false })
        .limit(3)

      // 4. Extrage ultimele comenzi din magazinul digital
      const { data: o } = await supabase
        .from('orders')
        .select('id, email, total, status, created_at')
        .order('created_at', { ascending: false })
        .limit(3)

      setAllProjects(p || [])
      setRecentUpdates(u as any || [])
      setRecentOrders(o || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://googleapis.com');
        .a-root*,.a-root *::before,.a-root *::after{box-sizing:border-box}
        .a-root{min-height:100vh;background:#0c0c0c;font-family:'DM Mono',monospace;color:#e0e0e0;position:relative;overflow-x:hidden;display:flex;flex-direction:column;justify-content:space-between}
        .a-ambient{position:fixed;inset:0;pointer-events:none;z-index:0;background:radial-gradient(ellipse 80% 50% at 50% 15%,rgba(226,179,110,0.04) 0%,transparent 60%)}
        
        .a-dash{position:relative;z-index:1;max-width:600px;width:100%;margin:0 auto;padding:140px 40px 100px;flex-grow:1;opacity:0;transform:translateY(15px);transition:opacity 0.6s ease,transform 0.6s ease}
        .a-dash.ready{opacity:1;transform:translateY(0)}
        
        .a-top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:24px;margin-bottom:40px}
        .a-title{font-family:'Playfair Display',serif;font-size:28px;font-weight:400;color:#ffffff;line-height:1.2}
        .a-title em{font-style:italic;color:#e2b36e;font-weight:400}
        .a-welcome{font-size:11px;color:#e2b36e;margin-top:6px;letter-spacing:0.05em;text-transform:uppercase}
        
        .a-logout{background:none;border:none;color:rgba(255,255,255,0.4);font-family:'DM Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;cursor:pointer;padding-top:6px;transition:color 0.2s}
        .a-logout:hover{color:#ff6b6b}

        .a-section{margin-bottom:40px}
        .a-sec-title{font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px}
        
        .a-row{display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.05)}
        .a-row-link{color:#ffffff;text-decoration:none;font-size:14px;transition:color 0.2s}
        .a-row-link:hover{color:#e2b36e}
        
        .a-status{font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.4)}
        .a-client-name{font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px}
        .a-msg{font-size:13px;line-height:1.5;color:rgba(255,255,255,0.75)}
        .a-meta{font-size:9px;color:rgba(255,255,255,0.35);margin-top:4px}
        
        .a-price{font-size:13px;color:#e2b36e}
        .a-empty{font-size:12px;color:rgba(255,255,255,0.35);font-style:italic}
      `}</style>

      <div className="a-root">
        <div className="a-ambient" />
        
        <Navbar />

        <div className={`a-dash${mounted ? ' ready' : ''}`}>
          
          <div className="a-top">
            <div>
              <h1 className="a-title">Panou <em>Birou.</em></h1>
              {!loading && <div className="a-welcome">Arhitect: {adminName}</div>}
            </div>
            <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="a-logout">
              Ieșire
            </button>
          </div>

          {/* 1. TOATE PROIECTELE COLECTIVULUI */}
          <div className="a-section">
            <h2 className="a-sec-title">Toate Proiectele</h2>
            {loading ? (
              <div className="a-empty">Se încarcă baza de date...</div>
            ) : allProjects.length === 0 ? (
              <div className="a-empty">Nu există proiecte înregistrate în sistem.</div>
            ) : (
              allProjects.map(p => (
                <div key={p.id} className="a-row">
                  <div>
                    <Link href={`/dashboard/admin/proiecte/${p.id}`} className="a-row-link">
                      {p.nume} →
                    </Link>
                    <div className="a-client-name">Client: {p.profiles?.full_name || 'Neasignat'}</div>
                  </div>
                  <span className="a-status">{p.status}</span>
                </div>
              ))
            )}
          </div>

          {/* 2. ULTIMELE ACTUALIZĂRI SCRISE DE ECHIPĂ */}
          <div className="a-section">
            <h2 className="a-sec-title">Activitate Recentă Șantiere</h2>
            {loading ? (
              <div className="a-empty">Se încarcă noutățile...</div>
            ) : recentUpdates.length === 0 ? (
              <div className="a-empty">Niciun raport trimis recent.</div>
            ) : (
              recentUpdates.map(u => (
                <div key={u.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="a-msg">{u.mesaj}</div>
                  <div className="a-meta">Proiect: {u.projects?.nume} • {new Date(u.created_at).toLocaleDateString('ro-RO')}</div>
                </div>
              ))
            )}
          </div>

          {/* 3. VÂNZĂRI COMPREHENSIVE MAGAZIN DIGITAL */}
          <div className="a-section">
            <h2 className="a-sec-title">Comenzi Recente Magazin</h2>
            {loading ? (
              <div className="a-empty">Se încarcă vânzările...</div>
            ) : recentOrders.length === 0 ? (
              <div className="a-empty">Nicio comandă înregistrată.</div>
            ) : (
              recentOrders.map(o => (
                <div key={o.id} className="a-row">
                  <div>
                    <span style={{ fontSize: '13px', color: '#ffffff' }}>{o.email}</span>
                    <div className="a-meta">{new Date(o.created_at).toLocaleDateString('ro-RO')} • Statut: {o.status}</div>
                  </div>
                  <span className="a-price">{o.total} lei</span>
                </div>
              ))
            )}
          </div>

        </div>

        <WhatsAppWidget />
        <Footer />
      </div>
    </>
  )
}
