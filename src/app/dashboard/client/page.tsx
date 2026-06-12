'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

export default function ClientDashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<any[]>([])
  const [updates, setUpdates] = useState<any[]>([])
  const [downloads, setDownloads] = useState<any[]>([])

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Proiecte active
      const { data: p } = await supabase
        .from('projects')
        .select('id, nume, status')
        .eq('client_id', user.id)

      // Jurnal activitate recent
      const { data: u } = await supabase
        .from('project_updates')
        .select('id, mesaj, created_at, projects(nume)')
        .eq('vizibil_client', true)
        .order('created_at', { ascending: false })
        .limit(2)

      // Produse digitale cumpărate
      const { data: d } = await supabase
        .from('downloads')
        .select('id, token, products(nume)')
        .eq('user_id', user.id)

      setProjects(p || [])
      setUpdates(u as any || [])
      setDownloads(d as any || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="a-loader">
        <style>{`.a-loader{min-height:100vh;background:#0c0c0c;display:flex;align-items:center;justify-content:center;color:#e2b36e;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0.2em}`}</style>
        Se încarcă...
      </div>
    )
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
        
        .a-top{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:24px;margin-bottom:40px}
        .a-title{font-family:'Playfair Display',serif;font-size:28px;font-weight:400;color:#ffffff}
        .a-title em{font-style:italic;color:#e2b36e;font-weight:400}
        .a-logout{background:none;border:none;color:rgba(255,255,255,0.4);font-family:'DM Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;cursor:pointer;transition:color 0.2s}
        .a-logout:hover{color:#ff6b6b}

        .a-section{margin-bottom:40px}
        .a-sec-title{font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#e2b36e;margin-bottom:16px}
        
        .a-row{display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.05)}
        .a-row-link{color:#ffffff;text-decoration:none;font-size:14px;transition:color 0.2s}
        .a-row-link:hover{color:#e2b36e}
        
        .a-status{font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.4)}
        .a-msg{font-size:13px;line-height:1.5;color:rgba(255,255,255,0.75)}
        .a-meta{font-size:9px;color:rgba(255,255,255,0.35);margin-top:4px}
        
        .a-dl-btn{font-size:10px;color:#e2b36e;text-decoration:none;border-bottom:1px solid rgba(226,179,110,0.3);transition:all 0.2s}
        .a-dl-btn:hover{color:#ffffff;border-bottom-color:#ffffff}
        .a-empty{font-size:12px;color:rgba(255,255,255,0.35);font-style:italic}
      `}</style>

      <div className="a-root">
        <div className="a-ambient" />
        
        <Navbar />

        <div className={`a-dash${mounted ? ' ready' : ''}`}>
          
          <div className="a-top">
            <h1 className="a-title">Contul <em>tău.</em></h1>
            <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="a-logout">
              Ieșire
            </button>
          </div>

          {/* 1. PROIECTE */}
          <div className="a-section">
            <h2 className="a-sec-title">Proiecte active</h2>
            {projects.length === 0 ? (
              <div className="a-empty">Niciun proiect asignat.</div>
            ) : (
              projects.map(p => (
                <div key={p.id} className="a-row">
                  <Link href={`/dashboard/client/proiecte/${p.id}`} className="a-row-link">
                    {p.nume} →
                  </Link>
                  <span className="a-status">{p.status}</span>
                </div>
              ))
            )}
          </div>

          {/* 2. ACTUALIZĂRI */}
          <div className="a-section">
            <h2 className="a-sec-title">Noutăți</h2>
            {updates.length === 0 ? (
              <div className="a-empty">Nicio notificare nouă.</div>
            ) : (
              updates.map(u => (
                <div key={u.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="a-msg">{u.mesaj}</div>
                  <div className="a-meta">{u.projects?.nume} • {new Date(u.created_at).toLocaleDateString('ro-RO')}</div>
                </div>
              ))
            )}
          </div>

          {/* 3. PRODUSE DIGITALE */}
          <div className="a-section">
            <h2 className="a-sec-title">Fișiere digitale</h2>
            {downloads.length === 0 ? (
              <div className="a-empty">Niciun produs achiziționat.</div>
            ) : (
              downloads.map(d => (
                <div key={d.id} className="a-row">
                  <span style={{ fontSize: '13px' }}>{d.products?.nume}</span>
                  <Link href={`/api/download?token=${d.token}`} className="a-dl-btn" target="_blank">
                    Descarcă
                  </Link>
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
