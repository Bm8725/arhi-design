'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

type Project = {
  id: string
  nume: string
  status: string
  adresa: string | null
  suprafata: number | null
  buget: number | null
  data_start: string | null
  data_estimata_finalizare: string | null
  data_finalizare: string | null
  descriere: string | null
}

type Phase = {
  id: string
  nume: string
  status: string
  progres: number
  ordine: number
  data_start: string | null
  data_sfarsit: string | null
}

type Document = {
  id: string
  nume: string
  tip: string
  url: string
  marime_bytes: number | null
  created_at: string
}

type Message = {
  id: string
  mesaj: string
  citit: boolean
  created_at: string
  sender_id: string | null
  profiles: { full_name: string | null } | null
}

type Download = {
  id: string
  token: string
  nr_descarcari: number
  max_descarcari: number
  expirat_la: string
  products: { nume: string; imagine_url: string | null } | null
}

type Update = {
  id: string
  mesaj: string
  created_at: string
  projects: { nume: string } | null
}

type OrderItem = {
  id: string
  nume_produs: string
  pret_la_cumparare: number
}

type Order = {
  id: string
  total: number
  status: string
  created_at: string
  stripe_payment_id: string | null
  order_items: OrderItem[]
}

const STATUS_LABEL: Record<string, string> = {
  nou: 'Nou',
  in_progres: 'În progres',
  in_asteptare: 'În așteptare',
  finalizat: 'Finalizat',
  anulat: 'Anulat',
  neinceputa: 'Neîncepută',
  blocata: 'Blocată',
  pending: 'În așteptare',
  paid: 'Plătit',
  processing: 'Se procesează',
  completed: 'Finalizat',
  refunded: 'Rambursat',
  cancelled: 'Anulat',
}

const STATUS_COLOR: Record<string, string> = {
  nou: '#a5b4fc',
  in_progres: '#e2b36e',
  in_asteptare: '#94a3b8',
  finalizat: '#34d399',
  anulat: '#f87171',
  neinceputa: '#555',
  blocata: '#f87171',
  pending: '#e2b36e',
  paid: '#34d399',
  processing: '#a5b4fc',
  completed: '#34d399',
  refunded: '#f87171',
  cancelled: '#f87171',
}

type Section = 'proiecte' | 'comenzi' | 'fisiere' | 'noutati'

export default function ClientDashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('')

  const [projects, setProjects] = useState<Project[]>([])
  const [updates, setUpdates] = useState<Update[]>([])
  const [downloads, setDownloads] = useState<Download[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  // Project detail
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'faze' | 'documente' | 'mesaje'>('faze')
  const [phases, setPhases] = useState<Phase[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)
  const msgEndRef = useRef<HTMLDivElement>(null)

  const [section, setSection] = useState<Section>('proiecte')

  // Expanded order
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
    fetchData()
  }, [])

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!activeProjectId) return
    const channel = supabase
      .channel('client-messages-' + activeProjectId)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `project_id=eq.${activeProjectId}`,
      }, () => fetchProjectDetails(activeProjectId))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [activeProjectId])

  async function fetchData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, rol')
        .eq('id', user.id)
        .single()

      if (profile?.rol === 'superadmin' || profile?.rol === 'angajat') {
        return router.push('/dashboard/admin')
      }

      setUserName(profile?.full_name || user.email?.split('@')[0] || 'Client')

      const [{ data: p }, { data: u }, { data: d }, { data: o }] = await Promise.all([
        supabase
          .from('projects')
          .select('id,nume,status,adresa,suprafata,buget,data_start,data_estimata_finalizare,data_finalizare,descriere')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('project_updates')
          .select('id,mesaj,created_at,projects(nume)')
          .eq('vizibil_client', true)
          .order('created_at', { ascending: false })
          .limit(30),
        supabase
          .from('downloads')
          .select('id,token,nr_descarcari,max_descarcari,expirat_la,products(nume,imagine_url)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('orders')
          .select('id,total,status,created_at,stripe_payment_id,order_items(id,nume_produs,pret_la_cumparare)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ])

      setProjects(p || [])
      setUpdates(u as any || [])
      setDownloads(d as any || [])
      setOrders(o as any || [])
    } finally {
      setLoading(false)
    }
  }

  async function fetchProjectDetails(projectId: string) {
    const [{ data: ph }, { data: dc }, { data: ms }] = await Promise.all([
      supabase.from('phases').select('*').eq('project_id', projectId).order('ordine'),
      supabase.from('documents').select('*').eq('project_id', projectId).eq('vizibil_client', true).order('created_at', { ascending: false }),
      supabase.from('messages').select('*, profiles(full_name)').eq('project_id', projectId).order('created_at'),
    ])
    setPhases(ph || [])
    setDocuments(dc || [])
    setMessages(ms as any || [])

    const unreadIds = (ms || []).filter((m: any) => !m.citit && m.sender_id !== userId).map((m: any) => m.id)
    if (unreadIds.length > 0) {
      await supabase.from('messages').update({ citit: true }).in('id', unreadIds)
    }
  }

  async function openProject(id: string) {
    setActiveProjectId(id)
    setActiveTab('faze')
    await fetchProjectDetails(id)
  }

  async function sendMessage() {
    if (!newMessage.trim() || !activeProjectId || !userId) return
    setSendingMsg(true)
    await supabase.from('messages').insert([{
      project_id: activeProjectId,
      sender_id: userId,
      mesaj: newMessage.trim(),
    }])
    setNewMessage('')
    setSendingMsg(false)
    fetchProjectDetails(activeProjectId)
  }

  function fmt(date: string) {
    return new Date(date).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  function fmtBytes(b: number | null) {
    if (!b) return ''
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
    return `${(b / 1024 / 1024).toFixed(1)} MB`
  }

  const activeProject = projects.find(p => p.id === activeProjectId)
  const overallProgress = phases.length > 0
    ? Math.round(phases.reduce((s, p) => s + p.progres, 0) / phases.length)
    : 0

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0c0c0c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Mono, monospace', color: '#e2b36e', fontSize: 11, letterSpacing: '0.2em' }}>
      Loading...
    </div>
  )

  return (
    <>
<style>{`
        .c-root{min-height:100vh;background:#ffffff;font-family:'Inter',sans-serif;color:#111111;display:flex;flex-direction:column;position:relative;overflow-x:hidden}
        .c-ambient{position:fixed;inset:0;pointer-events:none;z-index:0;background:radial-gradient(ellipse 60% 30% at 50% 0%,rgba(226,179,110,0.06) 0%,transparent 60%)}
        .c-wrap{position:relative;z-index:1;max-width:680px;width:100%;margin:0 auto;padding:110px 20px 120px;flex:1;opacity:0;transform:translateY(12px);transition:.5s ease}
        .c-wrap.ready{opacity:1;transform:translateY(0)}

        .c-header{display:flex;justify-content:space-between;align-items:center;padding-bottom:24px;border-bottom:2px solid #111;margin-bottom:32px}
        .c-greeting{font-size:10px;color:#aaa;letter-spacing:.25em;margin-bottom:6px;text-transform:uppercase}
        .c-name{font-size:28px;color:#000000;font-weight:700;letter-spacing:-.02em}
        .c-name span{color:#e2b36e}
        .c-logout{background:#111;border:none;color:#fff;font-family:inherit;font-size:9px;letter-spacing:.18em;cursor:pointer;transition:.2s;text-transform:uppercase;padding:10px 20px;font-weight:700}
        .c-logout:hover{background:#c0392b;color:#fff}

        .c-nav{display:flex;gap:6px;margin-bottom:32px;flex-wrap:wrap}
        .c-pill{font-size:9px;padding:11px 18px;border:2px solid #e0e0e0;background:#ffffff;color:#888;cursor:pointer;letter-spacing:.12em;transition:.2s;text-transform:uppercase;font-family:inherit;font-weight:600}
        .c-pill:hover{color:#111;border-color:#111;background:#f5f5f5}
        .c-pill.on{border-color:#111;color:#fff;background:#111;font-weight:700}

        /* Proiecte */
        .c-proj-card{border:2px solid #ececec;padding:22px;margin-bottom:8px;cursor:pointer;transition:all .2s;background:#ffffff;position:relative}
        .c-proj-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:#e2b36e;transform:scaleY(0);transition:.2s;transform-origin:bottom}
        .c-proj-card:hover{border-color:#111;background:#fafafa}
        .c-proj-card:hover::before{transform:scaleY(1)}
        .c-proj-name{font-size:15px;color:#000000;margin-bottom:6px;font-weight:700;letter-spacing:-.01em}
        .c-proj-meta{font-size:11px;color:#888;display:flex;gap:14px;flex-wrap:wrap;margin-bottom:14px;font-weight:400}
        .c-proj-footer{display:flex;align-items:center;justify-content:space-between;gap:10px}
        .c-badge{font-size:8px;padding:4px 10px;border:2px solid currentColor;letter-spacing:.15em;display:inline-block;text-transform:uppercase;font-weight:700}
        .c-prog-track{flex:1;height:2px;background:#f0f0f0}
        .c-prog-fill{height:2px;background:#e2b36e;transition:.4s}

        /* Detail */
        .c-back{font-size:9px;color:#fff;cursor:pointer;letter-spacing:.18em;margin-bottom:24px;display:inline-flex;align-items:center;gap:8px;text-transform:uppercase;transition:.2s;background:#111;border:2px solid #111;font-family:inherit;padding:9px 16px;font-weight:700}
        .c-back:hover{background:#333;border-color:#333}
        .c-detail-name{font-size:24px;color:#000000;margin-bottom:10px;font-weight:700;letter-spacing:-.02em}
        .c-detail-meta{font-size:11px;color:#888;display:flex;gap:14px;flex-wrap:wrap;align-items:center;margin-bottom:8px}

        .c-subtabs{display:flex;gap:4px;margin-bottom:28px;border-bottom:2px solid #111}
        .c-subtab{font-size:9px;padding:10px 20px 12px;border:2px solid transparent;border-bottom:none;background:transparent;color:#aaa;cursor:pointer;letter-spacing:.15em;transition:.2s;text-transform:uppercase;margin-bottom:-2px;font-family:inherit;font-weight:600}
        .c-subtab:hover{color:#111;background:#f8f8f8}
        .c-subtab.on{color:#fff;background:#111;border-color:#111;font-weight:700}

        /* ── FAZE ── */
        .c-phase{padding:18px 0;border-bottom:1px solid #f0f0f0;position:relative}
        .c-phase-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;flex-wrap:wrap}
        .c-phase-name{font-size:13px;color:#000000;font-weight:700;letter-spacing:.01em}
        .c-phase-prog{display:flex;align-items:center;gap:10px}
        .c-phase-track{width:100px;height:2px;background:#f0f0f0;flex-shrink:0;position:relative}
        .c-phase-fill{height:2px;background:linear-gradient(90deg,#e2b36e,#c49a40);transition:width .6s ease}
        .c-phase-pct{font-size:11px;color:#e2b36e;min-width:32px;font-weight:700}
        .c-phase-dates{font-size:9px;color:#ccc;margin-top:6px;letter-spacing:.08em;text-transform:uppercase}

        /* ── DOCUMENTE ── */
        .c-doc{display:flex;align-items:center;justify-content:space-between;padding:16px;margin-bottom:6px;gap:16px;background:#fafafa;border:1px solid #ececec;transition:all .2s;position:relative;overflow:hidden}
        .c-doc::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#e2b36e,#c49a40);transform:scaleX(0);transition:.3s;transform-origin:left}
        .c-doc:hover{background:#fff;border-color:#ccc;box-shadow:0 2px 12px rgba(0,0,0,.06)}
        .c-doc:hover::after{transform:scaleX(1)}
        .c-doc-info{flex:1;min-width:0}
        .c-doc-name{font-size:12px;color:#000000;font-weight:700;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .c-doc-meta{font-size:9px;color:#bbb;letter-spacing:.08em;text-transform:uppercase;display:flex;gap:10px}
        .c-doc-tip{background:#111;color:#fff;font-size:8px;padding:2px 7px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;flex-shrink:0;align-self:flex-start;margin-top:1px}
        .c-doc-link{font-size:9px;color:#fff;text-decoration:none;white-space:nowrap;flex-shrink:0;font-weight:700;letter-spacing:.12em;background:#111;border:2px solid #111;padding:8px 16px;transition:all .2s;text-transform:uppercase}
        .c-doc-link:hover{background:#e2b36e;border-color:#e2b36e}

        /* ── MESAJE ── */
        .c-msgs{max-height:360px;overflow-y:auto;margin-bottom:16px;padding-right:4px;scroll-behavior:smooth}
        .c-msgs::-webkit-scrollbar{width:3px}
        .c-msgs::-webkit-scrollbar-track{background:#f5f5f5}
        .c-msgs::-webkit-scrollbar-thumb{background:#e2b36e}

        .c-msg{padding:14px 16px;margin-bottom:8px;font-size:12px;line-height:1.65;position:relative;animation:msgIn .25s ease}
        @keyframes msgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}

        .c-msg.mine{background:#f8f8f8;border-left:3px solid #111;margin-left:20px}
        .c-msg.mine::before{content:'TU';position:absolute;top:14px;left:-46px;font-size:7px;color:#bbb;letter-spacing:.15em;font-weight:700}
        .c-msg.theirs{background:#fffcf5;border-left:3px solid #e2b36e;margin-right:20px}
        .c-msg.theirs::before{content:'ECHIPA';position:absolute;top:14px;right:-52px;font-size:7px;color:#e2b36e;letter-spacing:.1em;font-weight:700}

        .c-msg-text{color:#111;font-weight:400}
        .c-msg-meta{font-size:9px;color:#ccc;margin-top:6px;letter-spacing:.05em}

        .c-msg-input{display:flex;gap:0;border:2px solid #111;background:#fff;transition:.2s}
        .c-msg-input:focus-within{border-color:#e2b36e}
        .c-inp{flex:1;padding:14px 16px;background:transparent;border:none;color:#111;font-family:inherit;font-size:12px;outline:none}
        .c-inp::placeholder{color:#ccc;letter-spacing:.05em}
        .c-send{font-size:9px;padding:14px 22px;border:none;border-left:2px solid #111;background:#111;color:#fff;cursor:pointer;font-family:inherit;letter-spacing:.18em;transition:.2s;white-space:nowrap;font-weight:700;text-transform:uppercase}
        .c-send:hover:not(:disabled){background:#e2b36e;border-left-color:#e2b36e}
        .c-send:disabled{opacity:.3;cursor:not-allowed}

        /* Comenzi */
        .c-order{border:2px solid #ececec;margin-bottom:8px;background:#fff;overflow:hidden;transition:.2s}
        .c-order:hover{border-color:#ccc}
        .c-order-head{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;cursor:pointer;gap:12px;flex-wrap:wrap;transition:.2s}
        .c-order-head:hover{background:#fafafa}
        .c-order-id{font-size:9px;color:#bbb;letter-spacing:.15em;text-transform:uppercase}
        .c-order-total{font-size:16px;color:#000;font-weight:700}
        .c-order-date{font-size:9px;color:#bbb}
        .c-order-body{padding:0 18px 16px;border-top:2px solid #f0f0f0}
        .c-order-item{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f5f5f5;font-size:12px}
        .c-order-item:last-child{border-bottom:none}
        .c-order-item-name{color:#555}
        .c-order-item-price{color:#000;font-weight:700}
        .c-stripe{font-size:9px;color:#ddd;margin-top:8px;letter-spacing:.05em}

        /* Downloads */
        .c-dl-card{border:2px solid #ececec;padding:16px;margin-bottom:8px;display:flex;align-items:center;gap:14px;background:#fff;transition:.2s}
        .c-dl-card:hover{border-color:#ccc;box-shadow:0 2px 12px rgba(0,0,0,.05)}
        .c-dl-img{width:52px;height:40px;object-fit:cover;background:#f5f5f5;flex-shrink:0}
        .c-dl-name{font-size:13px;color:#000;margin-bottom:4px;font-weight:700}
        .c-dl-meta{font-size:9px;color:#bbb;letter-spacing:.05em}
        .c-dl-meta span{color:#e2b36e;font-weight:700}
        .c-dl-btn{margin-left:auto;font-size:9px;padding:9px 16px;border:2px solid #111;color:#111;text-decoration:none;letter-spacing:.12em;transition:.2s;white-space:nowrap;flex-shrink:0;font-weight:700;text-transform:uppercase}
        .c-dl-btn:hover{background:#111;color:#fff}
        .c-dl-btn.expired{border-color:#e8e8e8;color:#ccc;pointer-events:none}

        /* Updates */
        .c-update{padding:18px 0;border-bottom:1px solid #f0f0f0}
        .c-update-msg{font-size:13px;color:#111;line-height:1.75;margin-bottom:8px;font-weight:400}
        .c-update-meta{font-size:9px;color:#bbb;letter-spacing:.08em;text-transform:uppercase}
        .c-update-proj{color:#e2b36e;font-weight:700}

        .c-empty{font-size:9px;color:#ddd;text-align:center;padding:48px 0;letter-spacing:.2em;text-transform:uppercase}

        @media(max-width:480px){
          .c-wrap{padding:100px 16px 110px}
          .c-phase-track{width:60px}
          .c-order-head{gap:8px}
          .c-nav{gap:4px}
          .c-pill{padding:9px 12px;font-size:9px}
          .c-msg.mine{margin-left:0}
          .c-msg.mine::before{display:none}
          .c-msg.theirs{margin-right:0}
          .c-msg.theirs::before{display:none}
        }
      `}</style>
      <div className="c-root">
        <div className="c-ambient" />
        <Navbar />

        <div className={`c-wrap${mounted ? ' ready' : ''}`}>

          {/* ── Header ── */}
          <div className="c-header">
            <div>
              <div className="c-greeting">BINE AI VENIT</div>
              <div className="c-name">{userName.split(' ')[0]} <span>.</span></div>
            </div>
            <button className="c-logout" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}>
              Logout
            </button>
          </div>

          {/* ── Nav ── */}
          {!activeProjectId && (
            <div className="c-nav">
              {([
                ['proiecte', `Proiecte (${projects.length})`],
                ['comenzi', `Comenzi (${orders.length})`],
                ['fisiere', `Fișiere (${downloads.length})`],
                ['noutati', 'Noutăți'],
              ] as [Section, string][]).map(([s, label]) => (
                <button key={s} className={`c-pill${section === s ? ' on' : ''}`} onClick={() => setSection(s)}>
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* PROIECTE                                                      */}
          {/* ════════════════════════════════════════════════════════════ */}
          {!activeProjectId && section === 'proiecte' && (
            <>
              {projects.length === 0
                ? <div className="c-empty">Niciun proiect atribuit momentan!</div>
                : projects.map(p => (
                  <div key={p.id} className="c-proj-card" onClick={() => openProject(p.id)}>
                    <div className="c-proj-name">{p.nume}</div>
                    <div className="c-proj-meta">
                      {p.adresa && <span>{p.adresa}</span>}
                      {p.suprafata && <span>{p.suprafata} m²</span>}
                      {p.buget && <span>{Number(p.buget).toLocaleString('ro-RO')} lei</span>}
                      {p.data_estimata_finalizare && <span>Estimat: {p.data_estimata_finalizare}</span>}
                    </div>
                    <div className="c-proj-footer">
                      <div className="c-prog-track">
                        <div className="c-prog-fill" style={{ width: '0%' }} />
                      </div>
                      <span className="c-badge" style={{ color: STATUS_COLOR[p.status] || '#777' }}>
                        {STATUS_LABEL[p.status] || p.status}
                      </span>
                    </div>
                  </div>
                ))
              }
            </>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* DETALIU PROIECT                                               */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeProjectId && activeProject && (
            <>
              <button className="c-back" onClick={() => setActiveProjectId(null)}>← Înapoi</button>

              <div style={{ marginBottom: 20 }}>
                <div className="c-detail-name">{activeProject.nume}</div>
                <div className="c-detail-meta">
                  <span className="c-badge" style={{ color: STATUS_COLOR[activeProject.status] || '#777' }}>
                    {STATUS_LABEL[activeProject.status] || activeProject.status}
                  </span>
                  {activeProject.adresa && <span>{activeProject.adresa}</span>}
                  {activeProject.suprafata && <span>{activeProject.suprafata} m²</span>}
                  {activeProject.data_estimata_finalizare && <span>Estimat: {activeProject.data_estimata_finalizare}</span>}
                </div>
                {activeProject.descriere && (
                  <div style={{ fontSize: 11, color: '#555', lineHeight: 1.7 }}>{activeProject.descriere}</div>
                )}
                {phases.length > 0 && (
                  <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="c-prog-track" style={{ flex: 1 }}>
                      <div className="c-prog-fill" style={{ width: `${overallProgress}%` }} />
                    </div>
                    <span style={{ fontSize: 10, color: '#e2b36e', minWidth: 32 }}>{overallProgress}% finalizat</span>
                  </div>
                )}
              </div>

              <div className="c-subtabs">
                {(['faze', 'documente', 'mesaje'] as const).map(t => (
                  <button key={t} className={`c-subtab${activeTab === t ? ' on' : ''}`} onClick={() => setActiveTab(t)}>
                    {t === 'faze' ? `Faze (${phases.length})` : t === 'documente' ? `Documente (${documents.length})` : `Mesaje (${messages.length})`}
                  </button>
                ))}
              </div>

              {activeTab === 'faze' && (
                phases.length === 0
                  ? <div className="c-empty">Nicio fază definită încă.</div>
                  : phases.map(ph => (
                    <div key={ph.id} className="c-phase">
                      <div className="c-phase-top">
                        <div className="c-phase-name">{ph.ordine + 1}. {ph.nume}</div>
                        <div className="c-phase-prog">
                          <div className="c-phase-track">
                            <div className="c-phase-fill" style={{ width: `${ph.progres}%` }} />
                          </div>
                          <span className="c-phase-pct">{ph.progres}%</span>
                          <span className="c-badge" style={{ color: STATUS_COLOR[ph.status] || '#777', fontSize: 8 }}>
                            {STATUS_LABEL[ph.status] || ph.status}
                          </span>
                        </div>
                      </div>
                      {(ph.data_start || ph.data_sfarsit) && (
                        <div className="c-phase-dates">
                          {ph.data_start && <span>Start: {ph.data_start}</span>}
                          {ph.data_start && ph.data_sfarsit && ' · '}
                          {ph.data_sfarsit && <span>Sfârșit: {ph.data_sfarsit}</span>}
                        </div>
                      )}
                    </div>
                  ))
              )}

              {activeTab === 'documente' && (
                documents.length === 0
                  ? <div className="c-empty">Niciun document disponibil.</div>
                  : documents.map(d => (
                    <div key={d.id} className="c-doc">
                      <div>
                        <div className="c-doc-name">{d.nume}</div>
                        <div className="c-doc-meta">{d.tip}{d.marime_bytes ? ` · ${fmtBytes(d.marime_bytes)}` : ''} · {fmt(d.created_at)}</div>
                      </div>
                      <a href={d.url} target="_blank" rel="noreferrer" className="c-doc-link">Deschide →</a>
                    </div>
                  ))
              )}

              {activeTab === 'mesaje' && (
                <>
                  <div className="c-msgs">
                    {messages.length === 0
                      ? <div className="c-empty">Niciun mesaj. Trimite primul!</div>
                      : messages.map(m => (
                        <div key={m.id} className={`c-msg ${m.sender_id === userId ? 'mine' : 'theirs'}`}>
                          <div className="c-msg-text">{m.mesaj}</div>
                          <div className="c-msg-meta">
                            {m.sender_id === userId ? 'Tu' : m.profiles?.full_name || 'Echipa'} · {fmt(m.created_at)}
                          </div>
                        </div>
                      ))
                    }
                    <div ref={msgEndRef} />
                  </div>
                  <div className="c-msg-input">
                    <input className="c-inp" placeholder="Scrie un mesaj echipei..."
                      value={newMessage} onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} />
                    <button className="c-send" onClick={sendMessage} disabled={sendingMsg || !newMessage.trim()}>
                      TRIMITE
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* COMENZI                                                       */}
          {/* ════════════════════════════════════════════════════════════ */}
          {!activeProjectId && section === 'comenzi' && (
            <>
              {orders.length === 0
                ? <div className="c-empty">Nicio comandă plasată.</div>
                : orders.map(o => {
                  const isOpen = expandedOrder === o.id
                  return (
                    <div key={o.id} className="c-order">
                      <div className="c-order-head" onClick={() => setExpandedOrder(isOpen ? null : o.id)}>
                        <div>
                          <div className="c-order-id">#{o.id.slice(0, 8).toUpperCase()}</div>
                          <div className="c-order-date">{fmt(o.created_at)}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span className="c-badge" style={{ color: STATUS_COLOR[o.status] || '#777' }}>
                            {STATUS_LABEL[o.status] || o.status}
                          </span>
                          <div className="c-order-total">{Number(o.total).toLocaleString('ro-RO')} lei</div>
                          <span style={{ fontSize: 10, color: '#444' }}>{isOpen ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="c-order-body">
                          {o.order_items?.map(item => (
                            <div key={item.id} className="c-order-item">
                              <span className="c-order-item-name">{item.nume_produs}</span>
                              <span className="c-order-item-price">{Number(item.pret_la_cumparare).toLocaleString('ro-RO')} lei</span>
                            </div>
                          ))}
                          {o.stripe_payment_id && (
                            <div className="c-stripe">Plată: {o.stripe_payment_id}</div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              }
            </>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* FIȘIERE DIGITALE                                             */}
          {/* ════════════════════════════════════════════════════════════ */}
          {!activeProjectId && section === 'fisiere' && (
            downloads.length === 0
              ? <div className="c-empty">Niciun fișier achiziționat.</div>
              : downloads.map(d => {
                const expired = new Date(d.expirat_la) < new Date() || d.nr_descarcari >= d.max_descarcari
                return (
                  <div key={d.id} className="c-dl-card">
                    {d.products?.imagine_url
                      ? <img src={d.products.imagine_url} alt="" className="c-dl-img" />
                      : <div className="c-dl-img" />
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="c-dl-name">{d.products?.nume || 'Produs'}</div>
                      <div className="c-dl-meta">
                        <span>{d.nr_descarcari}/{d.max_descarcari}</span> descărcări · Expiră {fmt(d.expirat_la)}
                        {expired && <span style={{ color: '#f87171', marginLeft: 8 }}>· EXPIRAT</span>}
                      </div>
                    </div>
                    <a href={expired ? '#' : `/api/download?token=${d.token}`} target="_blank" rel="noreferrer"
                      className={`c-dl-btn${expired ? ' expired' : ''}`}>
                      {expired ? 'EXPIRAT' : 'DESCARCĂ'}
                    </a>
                  </div>
                )
              })
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* NOUTĂȚI                                                       */}
          {/* ════════════════════════════════════════════════════════════ */}
          {!activeProjectId && section === 'noutati' && (
            updates.length === 0
              ? <div className="c-empty">Nicio noutate momentan.</div>
              : updates.map(u => (
                <div key={u.id} className="c-update">
                  <div className="c-update-msg">{u.mesaj}</div>
                  <div className="c-update-meta">
                    {u.projects?.nume && <span className="c-update-proj">{u.projects.nume} · </span>}
                    {fmt(u.created_at)}
                  </div>
                </div>
              ))
          )}

        </div>

        
        <Footer />
      </div>
    </>
  )
}