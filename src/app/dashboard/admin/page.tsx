'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// ─── Types ────────────────────────────────────────────────────────────────────

type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  company: string | null
  rol: string
  activ: boolean
  created_at: string
}

type Project = {
  id: string
  nume: string
  descriere: string | null
  status: string
  adresa: string | null
  suprafata: number | null
  buget: number | null
  data_start: string | null
  data_estimata_finalizare: string | null
  data_finalizare: string | null
  created_at: string
  client_id: string | null
  responsabil_id: string | null
  profiles_client: { full_name: string | null } | null
  profiles_responsabil: { full_name: string | null } | null
}

type Order = {
  id: string
  email: string
  total: number
  status: string
  stripe_payment_id: string | null
  created_at: string
  user_id: string | null
}

type Product = {
  id: string
  nume: string
  descriere: string | null
  descriere_scurta: string | null
  pret: number
  pret_vechi: number | null
  categorie: string | null
  tags: string[] | null
  imagine_url: string | null
  fisier_url: string | null
  activ: boolean
  featured: boolean
  nr_descarcari: number
  created_at: string
}

type Phase = {
  id: string
  project_id: string
  nume: string
  descriere: string | null
  ordine: number
  status: string
  progres: number
  data_start: string | null
  data_sfarsit: string | null
}

type Document = {
  id: string
  project_id: string
  nume: string
  tip: string
  url: string
  marime_bytes: number | null
  vizibil_client: boolean
  created_at: string
}

type Message = {
  id: string
  project_id: string
  sender_id: string | null
  mesaj: string
  citit: boolean
  created_at: string
  profiles: { full_name: string | null } | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PROJECT_STATUSES = ['nou', 'in_progres', 'in_asteptare', 'finalizat', 'anulat']
const ORDER_STATUSES = ['pending', 'paid', 'processing', 'completed', 'refunded', 'cancelled']
const PHASE_STATUSES = ['neinceputa', 'in_progres', 'finalizata', 'blocata']

const STATUS_COLORS: Record<string, string> = {
  nou: '#6ee7b7',
  in_progres: '#e2b36e',
  in_asteptare: '#a5b4fc',
  finalizat: '#34d399',
  anulat: '#f87171',
  pending: '#e2b36e',
  paid: '#34d399',
  processing: '#a5b4fc',
  completed: '#34d399',
  refunded: '#f87171',
  cancelled: '#f87171',
  neinceputa: '#777',
  blocata: '#f87171',
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [adminName, setAdminName] = useState('')
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [currentAdminId, setCurrentAdminId] = useState('')

  const [activeTab, setActiveTab] = useState('overview')
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [activeProjectTab, setActiveProjectTab] = useState('faze')

  // Data
  const [projects, setProjects] = useState<Project[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [clients, setClients] = useState<Profile[]>([])
  const [phases, setPhases] = useState<Phase[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  // Modals / edit state
  const [editProject, setEditProject] = useState<Partial<Project> | null>(null)
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null)
  const [editPhase, setEditPhase] = useState<Partial<Phase> | null>(null)
  const [showNewProject, setShowNewProject] = useState(false)
  const [showNewProduct, setShowNewProduct] = useState(false)
  const [showNewPhase, setShowNewPhase] = useState(false)
  const [showNotifyModal, setShowNotifyModal] = useState(false)
  const [notifyTarget, setNotifyTarget] = useState<{ id: string; name: string } | null>(null)
  const [notifyForm, setNotifyForm] = useState({ titlu: '', mesaj: '', link: '' })

  // New forms
  const [newProject, setNewProject] = useState({
    nume: '', descriere: '', status: 'nou', client_id: '', responsabil_id: '',
    adresa: '', suprafata: '', buget: '', data_start: '', data_estimata_finalizare: ''
  })
  const [newProduct, setNewProduct] = useState({
    nume: '', descriere: '', descriere_scurta: '', pret: '', pret_vechi: '',
    categorie: '', imagine_url: '', fisier_url: '', activ: true, featured: false
  })
  const [newPhase, setNewPhase] = useState({
    nume: '', descriere: '', status: 'neinceputa', progres: 0,
    data_start: '', data_sfarsit: ''
  })
  const [newMessage, setNewMessage] = useState('')

  // Filters
  const [projectFilter, setProjectFilter] = useState('')
  const [orderFilter, setOrderFilter] = useState('')
  const [clientFilter, setClientFilter] = useState('')

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
    fetchAll()
  }, [])

  async function fetchAll() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, rol, id')
        .eq('id', user.id)
        .single()

      if (!profile || (profile.rol !== 'superadmin' && profile.rol !== 'angajat')) {
        return router.push('/dashboard/client')
      }

      setAdminName(profile.full_name || 'Admin')
      setIsSuperAdmin(profile.rol === 'superadmin')
      setCurrentAdminId(profile.id)

      await Promise.all([
        fetchProjects(),
        fetchOrders(),
        fetchProducts(),
        fetchClients(),
      ])
    } finally {
      setLoading(false)
    }
  }

  async function fetchProjects() {
    const { data } = await supabase
      .from('projects')
      .select(`
        *,
        profiles_client:profiles!projects_client_id_fkey(full_name),
        profiles_responsabil:profiles!projects_responsabil_id_fkey(full_name)
      `)
      .order('created_at', { ascending: false })
    setProjects(data || [])
  }

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    setOrders(data || [])
  }

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    setProducts(data || [])
  }

  async function fetchClients() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setClients(data || [])
  }

  async function fetchProjectDetails(projectId: string) {
    const [{ data: ph }, { data: dc }, { data: ms }] = await Promise.all([
      supabase.from('phases').select('*').eq('project_id', projectId).order('ordine'),
      supabase.from('documents').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
      supabase.from('messages').select('*, profiles(full_name)').eq('project_id', projectId).order('created_at'),
    ])
    setPhases(ph || [])
    setDocuments(dc || [])
    setMessages(ms || [])
  }

  // ── Project CRUD ────────────────────────────────────────────────────────────

  async function createProject() {
    if (!newProject.nume) return
    await supabase.from('projects').insert([{
      ...newProject,
      suprafata: newProject.suprafata ? Number(newProject.suprafata) : null,
      buget: newProject.buget ? Number(newProject.buget) : null,
      client_id: newProject.client_id || null,
      responsabil_id: newProject.responsabil_id || null,
      data_start: newProject.data_start || null,
      data_estimata_finalizare: newProject.data_estimata_finalizare || null,
    }])
    setShowNewProject(false)
    setNewProject({ nume: '', descriere: '', status: 'nou', client_id: '', responsabil_id: '', adresa: '', suprafata: '', buget: '', data_start: '', data_estimata_finalizare: '' })
    fetchProjects()
  }

  async function updateProject() {
    if (!editProject?.id) return
    const { id, ...rest } = editProject
    await supabase.from('projects').update(rest).eq('id', id)
    setEditProject(null)
    fetchProjects()
    if (activeProjectId === id) fetchProjectDetails(id)
  }

  async function deleteProject(id: string) {
    if (!confirm('Ștergi proiectul? Aceasta va șterge și toate fazele, documentele și mesajele aferente.')) return
    await supabase.from('projects').delete().eq('id', id)
    if (activeProjectId === id) { setActiveProjectId(null) }
    fetchProjects()
  }

  async function updateProjectStatus(id: string, status: string) {
    await supabase.from('projects').update({ status }).eq('id', id)
    fetchProjects()
  }

  // ── Phase CRUD ──────────────────────────────────────────────────────────────

  async function createPhase() {
    if (!newPhase.nume || !activeProjectId) return
    const maxOrdine = phases.length > 0 ? Math.max(...phases.map(p => p.ordine)) + 1 : 0
    await supabase.from('phases').insert([{
      ...newPhase,
      project_id: activeProjectId,
      ordine: maxOrdine,
      progres: Number(newPhase.progres),
      data_start: newPhase.data_start || null,
      data_sfarsit: newPhase.data_sfarsit || null,
    }])
    setShowNewPhase(false)
    setNewPhase({ nume: '', descriere: '', status: 'neinceputa', progres: 0, data_start: '', data_sfarsit: '' })
    fetchProjectDetails(activeProjectId)
  }

  async function updatePhase() {
    if (!editPhase?.id) return
    const { id, ...rest } = editPhase
    await supabase.from('phases').update(rest).eq('id', id)
    setEditPhase(null)
    if (activeProjectId) fetchProjectDetails(activeProjectId)
  }

  async function deletePhase(id: string) {
    await supabase.from('phases').delete().eq('id', id)
    if (activeProjectId) fetchProjectDetails(activeProjectId)
  }

  // ── Product CRUD ────────────────────────────────────────────────────────────

  async function createProduct() {
    if (!newProduct.nume) return
    await supabase.from('products').insert([{
      ...newProduct,
      pret: Number(newProduct.pret) || 0,
      pret_vechi: newProduct.pret_vechi ? Number(newProduct.pret_vechi) : null,
    }])
    setShowNewProduct(false)
    setNewProduct({ nume: '', descriere: '', descriere_scurta: '', pret: '', pret_vechi: '', categorie: '', imagine_url: '', fisier_url: '', activ: true, featured: false })
    fetchProducts()
  }

  async function updateProduct() {
    if (!editProduct?.id) return
    const { id, ...rest } = editProduct
    await supabase.from('products').update(rest).eq('id', id)
    setEditProduct(null)
    fetchProducts()
  }

  async function toggleProduct(id: string, field: string, value: boolean) {
    await supabase.from('products').update({ [field]: value }).eq('id', id)
    fetchProducts()
  }

  async function deleteProduct(id: string) {
    if (!confirm('Ștergi produsul?')) return
    await supabase.from('products').delete().eq('id', id)
    fetchProducts()
  }

  // ── Order CRUD ──────────────────────────────────────────────────────────────

  async function updateOrderStatus(id: string, status: string) {
    await supabase.from('orders').update({ status }).eq('id', id)
    fetchOrders()
  }

  async function deleteOrder(id: string) {
    if (!confirm('Ștergi comanda?')) return
    await supabase.from('orders').delete().eq('id', id)
    fetchOrders()
  }

  // ── Clients ─────────────────────────────────────────────────────────────────

  async function toggleClient(id: string, activ: boolean) {
    await supabase.from('profiles').update({ activ }).eq('id', id)
    fetchClients()
  }

  async function changeClientRole(id: string, rol: string) {
    await supabase.from('profiles').update({ rol }).eq('id', id)
    fetchClients()
  }

  // ── Messages ────────────────────────────────────────────────────────────────

  async function sendMessage() {
    if (!newMessage.trim() || !activeProjectId) return
    await supabase.from('messages').insert([{
      project_id: activeProjectId,
      sender_id: currentAdminId,
      mesaj: newMessage.trim(),
    }])
    setNewMessage('')
    fetchProjectDetails(activeProjectId)
  }

  // ── Notifications ────────────────────────────────────────────────────────────

  async function sendNotification() {
    if (!notifyTarget || !notifyForm.titlu) return
    await supabase.from('notifications').insert([{
      user_id: notifyTarget.id,
      titlu: notifyForm.titlu,
      mesaj: notifyForm.mesaj || null,
      link: notifyForm.link || null,
    }])
    setShowNotifyModal(false)
    setNotifyForm({ titlu: '', mesaj: '', link: '' })
    setNotifyTarget(null)
  }

  function openNotify(id: string, name: string) {
    setNotifyTarget({ id, name })
    setNotifyForm({ titlu: '', mesaj: '', link: '' })
    setShowNotifyModal(true)
  }

  // ── Documents ────────────────────────────────────────────────────────────────

  async function deleteDocument(id: string) {
    await supabase.from('documents').delete().eq('id', id)
    if (activeProjectId) fetchProjectDetails(activeProjectId)
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function fmt(date: string) {
    return new Date(date).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  function fmtBytes(b: number | null) {
    if (!b) return '—'
    if (b < 1024) return `${b} B`
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
    return `${(b / 1024 / 1024).toFixed(1)} MB`
  }

  const filteredProjects = projects.filter(p =>
    p.nume.toLowerCase().includes(projectFilter.toLowerCase()) ||
    (p.profiles_client?.full_name || '').toLowerCase().includes(projectFilter.toLowerCase())
  )

  const filteredOrders = orders.filter(o =>
    o.email.toLowerCase().includes(orderFilter.toLowerCase()) ||
    o.status.toLowerCase().includes(orderFilter.toLowerCase())
  )

  const filteredClients = clients.filter(c =>
    (c.full_name || '').toLowerCase().includes(clientFilter.toLowerCase()) ||
    c.rol.toLowerCase().includes(clientFilter.toLowerCase())
  )

  const activeProject = projects.find(p => p.id === activeProjectId)

  // ── Revenue calc ─────────────────────────────────────────────────────────────
  const revenue = orders.filter(o => o.status === 'paid' || o.status === 'completed').reduce((s, o) => s + Number(o.total), 0)

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0c0c0c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#e2b36e', fontFamily: 'DM Mono, monospace', fontSize: 12, letterSpacing: '0.2em' }}>SE ÎNCARCĂ...</div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        .root{min-height:100vh;background:#0c0c0c;color:#e0e0e0;font-family:'DM Mono',monospace;display:flex;flex-direction:column}
        .wrap{max-width:1100px;margin:auto;padding:100px 20px 60px;width:100%;opacity:0;transform:translateY(8px);transition:.4s}
        .wrap.ready{opacity:1;transform:translateY(0)}

        /* header */
        .top{display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;flex-wrap:wrap;gap:12px}
        .title{font-size:22px;font-weight:400;color:#fff;letter-spacing:.05em}
        .title span{color:#e2b36e}
        .logout{font-size:10px;padding:8px 14px;border:1px solid #333;background:transparent;color:#777;cursor:pointer;letter-spacing:.15em;transition:.2s}
        .logout:hover{border-color:#f87171;color:#f87171}

        /* tabs */
        .tabs{display:flex;gap:6px;margin-bottom:28px;flex-wrap:wrap}
        .tab{font-size:10px;padding:9px 14px;border:1px solid #1f1f1f;background:transparent;color:#555;cursor:pointer;letter-spacing:.12em;transition:.2s}
        .tab:hover{color:#aaa;border-color:#333}
        .tab.on{border-color:#e2b36e;color:#e2b36e;background:rgba(226,179,110,.05)}

        /* cards / panels */
        .card{border:1px solid #1a1a1a;background:rgba(255,255,255,.02);padding:16px;margin-bottom:10px}
        .card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;margin-bottom:12px}
        .stat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-bottom:24px}
        .stat{border:1px solid #1a1a1a;background:rgba(255,255,255,.02);padding:20px 16px}
        .stat-val{font-size:28px;color:#e2b36e;font-weight:300}
        .stat-lbl{font-size:10px;color:#555;letter-spacing:.15em;margin-top:4px}

        /* table */
        .tbl{width:100%;border-collapse:collapse;font-size:11px}
        .tbl th{text-align:left;font-size:9px;color:#444;letter-spacing:.15em;padding:8px 10px;border-bottom:1px solid #1a1a1a;font-weight:400}
        .tbl td{padding:10px 10px;border-bottom:1px solid #111;vertical-align:middle}
        .tbl tr:hover td{background:rgba(255,255,255,.015)}

        /* inputs */
        .inp{width:100%;padding:9px 10px;background:transparent;border:1px solid #2a2a2a;color:#e0e0e0;font-family:inherit;font-size:11px;margin-bottom:8px}
        .inp:focus{outline:none;border-color:#e2b36e}
        select.inp{cursor:pointer}
        .inp-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        @media(max-width:600px){.inp-row{grid-template-columns:1fr}}

        /* buttons */
        .btn{font-size:10px;padding:8px 14px;border:1px solid #2a2a2a;background:transparent;color:#aaa;cursor:pointer;font-family:inherit;letter-spacing:.1em;transition:.2s;white-space:nowrap}
        .btn:hover{border-color:#e2b36e;color:#e2b36e}
        .btn.primary{border-color:#e2b36e;color:#e2b36e;background:rgba(226,179,110,.07)}
        .btn.primary:hover{background:rgba(226,179,110,.15)}
        .btn.danger{border-color:#333}
        .btn.danger:hover{border-color:#f87171;color:#f87171}
        .btn.sm{padding:5px 10px;font-size:9px}
        .btn-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}

        /* badge */
        .badge{font-size:9px;padding:3px 7px;border:1px solid currentColor;letter-spacing:.1em;display:inline-block}

        /* progress bar */
        .prog-wrap{background:#1a1a1a;height:4px;flex:1}
        .prog-bar{height:4px;background:#e2b36e;transition:.3s}

        /* modal overlay */
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px}
        .modal{background:#0f0f0f;border:1px solid #2a2a2a;padding:24px;width:100%;max-width:500px;max-height:90vh;overflow-y:auto}
        .modal-title{font-size:13px;color:#fff;margin-bottom:20px;letter-spacing:.05em}

        /* project detail */
        .detail-back{font-size:10px;color:#555;cursor:pointer;letter-spacing:.15em;margin-bottom:20px;display:inline-flex;align-items:center;gap:6px}
        .detail-back:hover{color:#e2b36e}
        .sub-tabs{display:flex;gap:6px;margin-bottom:20px;flex-wrap:wrap}
        .sub-tab{font-size:9px;padding:7px 12px;border:1px solid #1a1a1a;background:transparent;color:#444;cursor:pointer;letter-spacing:.12em;transition:.2s}
        .sub-tab:hover{color:#aaa}
        .sub-tab.on{border-color:#e2b36e;color:#e2b36e}

        /* messages */
        .msg{padding:10px 12px;margin-bottom:6px;font-size:11px}
        .msg.admin{background:rgba(226,179,110,.06);border-left:2px solid #e2b36e;text-align:right}
        .msg.client{background:rgba(255,255,255,.03);border-left:2px solid #333}
        .msg-meta{font-size:9px;color:#555;margin-top:4px}

        /* misc */
        .section-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px}
        .section-title{font-size:11px;color:#777;letter-spacing:.15em}
        .empty{font-size:11px;color:#333;padding:30px;text-align:center;border:1px dashed #1a1a1a}
        .img-thumb{width:48px;height:36px;object-fit:cover;background:#111}
        .search{width:100%;max-width:280px;padding:8px 10px;background:transparent;border:1px solid #1f1f1f;color:#e0e0e0;font-family:inherit;font-size:11px;margin-bottom:16px}
        .search:focus{outline:none;border-color:#e2b36e}
        .tag{font-size:9px;padding:2px 6px;background:rgba(226,179,110,.1);color:#e2b36e;margin-right:4px;display:inline-block}
        .scroll-x{overflow-x:auto}
      `}</style>

      <div className="root">
        <Navbar />

        <div className={`wrap ${mounted ? 'ready' : ''}`}>

          {/* ── Header ── */}
          <div className="top">
            <div>
              <div className="title">ADMIN — <span>{adminName}</span></div>
              <div style={{ fontSize: 10, color: '#444', marginTop: 4, letterSpacing: '.15em' }}>
                {isSuperAdmin ? 'SUPERADMIN' : 'ANGAJAT'}
              </div>
            </div>
            <button className="logout" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}>
              LOGOUT
            </button>
          </div>

          {/* ── Tabs ── */}
          <div className="tabs">
            {['overview', 'proiecte', 'comenzi', 'magazin', 'clienti'].map(t => (
              <button key={t} className={`tab ${activeTab === t ? 'on' : ''}`} onClick={() => { setActiveTab(t); setActiveProjectId(null) }}>
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* OVERVIEW                                                         */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <>
              <div className="stat-grid">
                <div className="stat"><div className="stat-val">{projects.length}</div><div className="stat-lbl">PROIECTE</div></div>
                <div className="stat"><div className="stat-val">{projects.filter(p => p.status === 'in_progres').length}</div><div className="stat-lbl">ÎN PROGRES</div></div>
                <div className="stat"><div className="stat-val">{orders.length}</div><div className="stat-lbl">COMENZI</div></div>
                <div className="stat"><div className="stat-val">{revenue.toLocaleString('ro-RO')} lei</div><div className="stat-lbl">VENITURI</div></div>
                <div className="stat"><div className="stat-val">{products.filter(p => p.activ).length}</div><div className="stat-lbl">PRODUSE ACTIVE</div></div>
                <div className="stat"><div className="stat-val">{clients.filter(c => c.rol === 'client').length}</div><div className="stat-lbl">CLIENȚI</div></div>
              </div>

              <div style={{ fontSize: 11, color: '#555', letterSpacing: '.15em', marginBottom: 12 }}>PROIECTE RECENTE</div>
              {projects.slice(0, 5).map(p => (
                <div key={p.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer' }}
                  onClick={() => { setActiveTab('proiecte'); setActiveProjectId(p.id); fetchProjectDetails(p.id) }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#e0e0e0' }}>{p.nume}</div>
                    <div style={{ fontSize: 10, color: '#555', marginTop: 3 }}>{p.profiles_client?.full_name || '—'} · {fmt(p.created_at)}</div>
                  </div>
                  <span className="badge" style={{ color: STATUS_COLORS[p.status] || '#777' }}>{p.status}</span>
                </div>
              ))}

              <div style={{ fontSize: 11, color: '#555', letterSpacing: '.15em', margin: '20px 0 12px' }}>COMENZI RECENTE</div>
              {orders.slice(0, 5).map(o => (
                <div key={o.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#e0e0e0' }}>{o.email}</div>
                    <div style={{ fontSize: 10, color: '#555', marginTop: 3 }}>{fmt(o.created_at)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#e2b36e', fontSize: 12 }}>{Number(o.total).toLocaleString('ro-RO')} lei</div>
                    <span className="badge" style={{ color: STATUS_COLORS[o.status] || '#777', marginTop: 4 }}>{o.status}</span>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* PROIECTE                                                          */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'proiecte' && !activeProjectId && (
            <>
              <div className="section-hd">
                <input className="search" placeholder="Caută proiect sau client..." value={projectFilter} onChange={e => setProjectFilter(e.target.value)} />
                <button className="btn primary" onClick={() => setShowNewProject(true)}>+ PROIECT NOU</button>
              </div>

              {filteredProjects.length === 0
                ? <div className="empty">Nu există proiecte.</div>
                : filteredProjects.map(p => (
                  <div key={p.id} className="card">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <div style={{ fontSize: 13, color: '#fff', marginBottom: 4 }}>{p.nume}</div>
                        <div style={{ fontSize: 10, color: '#555' }}>
                          Client: {p.profiles_client?.full_name || '—'} &nbsp;·&nbsp;
                          Resp: {p.profiles_responsabil?.full_name || '—'} &nbsp;·&nbsp;
                          {fmt(p.created_at)}
                        </div>
                        {p.adresa && <div style={{ fontSize: 10, color: '#444', marginTop: 2 }}>{p.adresa}</div>}
                        <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 10, color: '#555' }}>
                          {p.suprafata && <span>{p.suprafata} m²</span>}
                          {p.buget && <span>{Number(p.buget).toLocaleString('ro-RO')} lei</span>}
                        </div>
                      </div>
                      <span className="badge" style={{ color: STATUS_COLORS[p.status] || '#777' }}>{p.status}</span>
                    </div>

                    <div className="btn-row">
                      <button className="btn sm primary" onClick={() => { setActiveProjectId(p.id); fetchProjectDetails(p.id) }}>DETALII</button>
                      <button className="btn sm" onClick={() => setEditProject({ ...p })}>EDITEAZĂ</button>
                      <select className="btn sm" style={{ background: 'transparent' }} value={p.status}
                        onChange={e => updateProjectStatus(p.id, e.target.value)}>
                        {PROJECT_STATUSES.map(s => <option key={s} value={s} style={{ background: '#111' }}>{s}</option>)}
                      </select>
                      <button className="btn sm" onClick={() => openNotify(p.client_id!, p.profiles_client?.full_name || 'client')} disabled={!p.client_id}>
                        NOTIFY CLIENT
                      </button>
                      {isSuperAdmin && <button className="btn sm danger" onClick={() => deleteProject(p.id)}>ȘTERGE</button>}
                    </div>
                  </div>
                ))
              }
            </>
          )}

          {/* ── Project Detail ── */}
          {activeTab === 'proiecte' && activeProjectId && activeProject && (
            <>
              <div className="detail-back" onClick={() => setActiveProjectId(null)}>← ÎNAPOI LA PROIECTE</div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 18, color: '#fff', marginBottom: 6 }}>{activeProject.nume}</div>
                <div style={{ fontSize: 10, color: '#555', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span>Client: {activeProject.profiles_client?.full_name || '—'}</span>
                  <span>Status: <span style={{ color: STATUS_COLORS[activeProject.status] }}>{activeProject.status}</span></span>
                  {activeProject.adresa && <span>{activeProject.adresa}</span>}
                  {activeProject.buget && <span>{Number(activeProject.buget).toLocaleString('ro-RO')} lei</span>}
                </div>
              </div>

              <div className="sub-tabs">
                {['faze', 'documente', 'mesaje'].map(t => (
                  <button key={t} className={`sub-tab ${activeProjectTab === t ? 'on' : ''}`} onClick={() => setActiveProjectTab(t)}>
                    {t.toUpperCase()}
                  </button>
                ))}
                <button className="btn sm" style={{ marginLeft: 'auto' }} onClick={() => setEditProject({ ...activeProject })}>EDITEAZĂ PROIECT</button>
                {isSuperAdmin && <button className="btn sm danger" onClick={() => deleteProject(activeProjectId)}>ȘTERGE</button>}
              </div>

              {/* FAZE */}
              {activeProjectTab === 'faze' && (
                <>
                  <div className="section-hd">
                    <div className="section-title">FAZE PROIECT</div>
                    <button className="btn sm primary" onClick={() => setShowNewPhase(true)}>+ FAZĂ NOUĂ</button>
                  </div>
                  {phases.length === 0
                    ? <div className="empty">Nicio fază adăugată.</div>
                    : phases.map(ph => (
                      <div key={ph.id} className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                          <div style={{ fontSize: 12, color: '#e0e0e0', flex: 1 }}>{ph.ordine + 1}. {ph.nume}</div>
                          <span className="badge" style={{ color: STATUS_COLORS[ph.status] || '#777' }}>{ph.status}</span>
                        </div>
                        {ph.descriere && <div style={{ fontSize: 10, color: '#555', marginBottom: 8 }}>{ph.descriere}</div>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <div className="prog-wrap"><div className="prog-bar" style={{ width: `${ph.progres}%` }} /></div>
                          <span style={{ fontSize: 10, color: '#e2b36e', minWidth: 30 }}>{ph.progres}%</span>
                        </div>
                        <div style={{ fontSize: 10, color: '#444', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          {ph.data_start && <span>Start: {ph.data_start}</span>}
                          {ph.data_sfarsit && <span>Sfârșit: {ph.data_sfarsit}</span>}
                        </div>
                        <div className="btn-row">
                          <button className="btn sm" onClick={() => setEditPhase({ ...ph })}>EDITEAZĂ</button>
                          <button className="btn sm danger" onClick={() => deletePhase(ph.id)}>ȘTERGE</button>
                        </div>
                      </div>
                    ))
                  }
                </>
              )}

              {/* DOCUMENTE */}
              {activeProjectTab === 'documente' && (
                <>
                  <div className="section-hd">
                    <div className="section-title">DOCUMENTE ({documents.length})</div>
                  </div>
                  {documents.length === 0
                    ? <div className="empty">Niciun document.</div>
                    : (
                      <div className="scroll-x">
                        <table className="tbl">
                          <thead>
                            <tr>
                              <th>NUME</th><th>TIP</th><th>MĂRIME</th><th>VIZIBIL</th><th>DATA</th><th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {documents.map(d => (
                              <tr key={d.id}>
                                <td><a href={d.url} target="_blank" rel="noreferrer" style={{ color: '#e2b36e', textDecoration: 'none' }}>{d.nume}</a></td>
                                <td><span className="badge" style={{ color: '#777' }}>{d.tip}</span></td>
                                <td style={{ color: '#555' }}>{fmtBytes(d.marime_bytes)}</td>
                                <td><span style={{ color: d.vizibil_client ? '#34d399' : '#555' }}>{d.vizibil_client ? 'DA' : 'NU'}</span></td>
                                <td style={{ color: '#555' }}>{fmt(d.created_at)}</td>
                                <td><button className="btn sm danger" onClick={() => deleteDocument(d.id)}>ȘT</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  }
                </>
              )}

              {/* MESAJE */}
              {activeProjectTab === 'mesaje' && (
                <>
                  <div style={{ marginBottom: 12 }}>
                    {messages.length === 0
                      ? <div className="empty">Niciun mesaj.</div>
                      : messages.map(m => {
                        const isAdmin = m.sender_id === currentAdminId || m.profiles?.full_name === adminName
                        return (
                          <div key={m.id} className={`msg ${isAdmin ? 'admin' : 'client'}`}>
                            <div>{m.mesaj}</div>
                            <div className="msg-meta">{m.profiles?.full_name || 'Anonim'} · {fmt(m.created_at)}</div>
                          </div>
                        )
                      })
                    }
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="inp" style={{ margin: 0 }} placeholder="Scrie un mesaj..." value={newMessage} onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendMessage()} />
                    <button className="btn primary" onClick={sendMessage}>TRIMITE</button>
                  </div>
                </>
              )}
            </>
          )}

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* COMENZI                                                           */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'comenzi' && (
            <>
              <input className="search" placeholder="Caută după email sau status..." value={orderFilter} onChange={e => setOrderFilter(e.target.value)} />
              <div className="scroll-x">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>EMAIL</th><th>TOTAL</th><th>STATUS</th><th>DATA</th><th>STRIPE</th><th>ACȚIUNI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0
                      ? <tr><td colSpan={6} style={{ textAlign: 'center', color: '#333', padding: 30 }}>Nicio comandă.</td></tr>
                      : filteredOrders.map(o => (
                        <tr key={o.id}>
                          <td style={{ color: '#e0e0e0' }}>{o.email}</td>
                          <td style={{ color: '#e2b36e' }}>{Number(o.total).toLocaleString('ro-RO')} lei</td>
                          <td>
                            <select className="btn sm" style={{ background: 'transparent', border: 'none', color: STATUS_COLORS[o.status] || '#777' }}
                              value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}>
                              {ORDER_STATUSES.map(s => <option key={s} value={s} style={{ background: '#111', color: '#e0e0e0' }}>{s}</option>)}
                            </select>
                          </td>
                          <td style={{ color: '#555' }}>{fmt(o.created_at)}</td>
                          <td style={{ color: '#444', fontSize: 9 }}>{o.stripe_payment_id ? o.stripe_payment_id.slice(0, 16) + '…' : '—'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {o.user_id && <button className="btn sm" onClick={() => openNotify(o.user_id!, o.email)}>NOTIFY</button>}
                              {isSuperAdmin && <button className="btn sm danger" onClick={() => deleteOrder(o.id)}>ȘT</button>}
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* MAGAZIN                                                           */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'magazin' && (
            <>
              <div className="section-hd">
                <div className="section-title">{products.length} PRODUSE</div>
                <button className="btn primary" onClick={() => setShowNewProduct(true)}>+ PRODUS NOU</button>
              </div>

              <div className="card-grid">
                {products.length === 0
                  ? <div className="empty" style={{ gridColumn: '1/-1' }}>Niciun produs.</div>
                  : products.map(p => (
                    <div key={p.id} className="card">
                      {p.imagine_url && <img src={p.imagine_url} alt={p.nume} style={{ width: '100%', height: 120, objectFit: 'cover', marginBottom: 10, background: '#111' }} />}
                      <div style={{ fontSize: 12, color: '#e0e0e0', marginBottom: 4 }}>{p.nume}</div>
                      <div style={{ fontSize: 10, color: '#555', marginBottom: 4 }}>{p.categorie || '—'}</div>
                      <div style={{ fontSize: 13, color: '#e2b36e', marginBottom: 4 }}>
                        {Number(p.pret).toLocaleString('ro-RO')} lei
                        {p.pret_vechi && <span style={{ fontSize: 10, color: '#444', textDecoration: 'line-through', marginLeft: 6 }}>{Number(p.pret_vechi).toLocaleString('ro-RO')}</span>}
                      </div>
                      {p.tags && <div style={{ marginBottom: 8 }}>{p.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>}
                      <div style={{ fontSize: 10, color: '#444', marginBottom: 10 }}>{p.nr_descarcari} descărcări</div>
                      <div className="btn-row">
                        <button className="btn sm" onClick={() => setEditProduct({ ...p })}>EDIT</button>
                        <button className={`btn sm`} style={{ color: p.activ ? '#34d399' : '#555', borderColor: p.activ ? '#34d399' : '#333' }}
                          onClick={() => toggleProduct(p.id, 'activ', !p.activ)}>
                          {p.activ ? 'ACTIV' : 'INACTIV'}
                        </button>
                        <button className={`btn sm`} style={{ color: p.featured ? '#e2b36e' : '#555', borderColor: p.featured ? '#e2b36e' : '#333' }}
                          onClick={() => toggleProduct(p.id, 'featured', !p.featured)}>
                          {p.featured ? '★ TOP' : '☆ TOP'}
                        </button>
                        {isSuperAdmin && <button className="btn sm danger" onClick={() => deleteProduct(p.id)}>ȘT</button>}
                      </div>
                    </div>
                  ))
                }
              </div>
            </>
          )}

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* CLIENȚI                                                           */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'clienti' && (
            <>
              <input className="search" placeholder="Caută după nume sau rol..." value={clientFilter} onChange={e => setClientFilter(e.target.value)} />
              <div className="scroll-x">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>NUME</th><th>COMPANIE</th><th>TELEFON</th><th>ROL</th><th>STATUS</th><th>DATA</th><th>ACȚIUNI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.length === 0
                      ? <tr><td colSpan={7} style={{ textAlign: 'center', color: '#333', padding: 30 }}>Niciun utilizator.</td></tr>
                      : filteredClients.map(c => (
                        <tr key={c.id}>
                          <td style={{ color: '#e0e0e0' }}>{c.full_name || '—'}</td>
                          <td style={{ color: '#555' }}>{c.company || '—'}</td>
                          <td style={{ color: '#555' }}>{c.phone || '—'}</td>
                          <td>
                            {isSuperAdmin
                              ? <select className="btn sm" style={{ background: 'transparent', border: 'none' }} value={c.rol}
                                  onChange={e => changeClientRole(c.id, e.target.value)}>
                                  {['client', 'angajat', 'superadmin'].map(r => <option key={r} value={r} style={{ background: '#111' }}>{r}</option>)}
                                </select>
                              : <span className="badge" style={{ color: '#777' }}>{c.rol}</span>
                            }
                          </td>
                          <td><span style={{ color: c.activ ? '#34d399' : '#f87171', fontSize: 10 }}>{c.activ ? 'ACTIV' : 'BLOCAT'}</span></td>
                          <td style={{ color: '#555' }}>{fmt(c.created_at)}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn sm" onClick={() => openNotify(c.id, c.full_name || c.id)}>NOTIFY</button>
                              {isSuperAdmin && (
                                <button className="btn sm" style={{ color: c.activ ? '#f87171' : '#34d399', borderColor: c.activ ? '#f87171' : '#34d399' }}
                                  onClick={() => toggleClient(c.id, !c.activ)}>
                                  {c.activ ? 'BLOCHEAZĂ' : 'ACTIVEAZĂ'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </>
          )}

        </div>

        <Footer />
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MODAL — Proiect nou                                                  */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {showNewProject && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowNewProject(false)}>
          <div className="modal">
            <div className="modal-title">PROIECT NOU</div>
            <input className="inp" placeholder="Nume proiect *" value={newProject.nume} onChange={e => setNewProject({ ...newProject, nume: e.target.value })} />
            <input className="inp" placeholder="Descriere" value={newProject.descriere} onChange={e => setNewProject({ ...newProject, descriere: e.target.value })} />
            <input className="inp" placeholder="Adresă" value={newProject.adresa} onChange={e => setNewProject({ ...newProject, adresa: e.target.value })} />
            <div className="inp-row">
              <input className="inp" placeholder="Suprafață (m²)" type="number" value={newProject.suprafata} onChange={e => setNewProject({ ...newProject, suprafata: e.target.value })} />
              <input className="inp" placeholder="Buget (lei)" type="number" value={newProject.buget} onChange={e => setNewProject({ ...newProject, buget: e.target.value })} />
            </div>
            <div className="inp-row">
              <input className="inp" type="date" placeholder="Data start" value={newProject.data_start} onChange={e => setNewProject({ ...newProject, data_start: e.target.value })} />
              <input className="inp" type="date" placeholder="Finalizare estimată" value={newProject.data_estimata_finalizare} onChange={e => setNewProject({ ...newProject, data_estimata_finalizare: e.target.value })} />
            </div>
            <select className="inp" value={newProject.client_id} onChange={e => setNewProject({ ...newProject, client_id: e.target.value })}>
              <option value="">— Selectează client —</option>
              {clients.filter(c => c.rol === 'client').map(c => <option key={c.id} value={c.id} style={{ background: '#111' }}>{c.full_name || c.id}</option>)}
            </select>
            <select className="inp" value={newProject.responsabil_id} onChange={e => setNewProject({ ...newProject, responsabil_id: e.target.value })}>
              <option value="">— Responsabil —</option>
              {clients.filter(c => c.rol === 'angajat' || c.rol === 'superadmin').map(c => <option key={c.id} value={c.id} style={{ background: '#111' }}>{c.full_name || c.id}</option>)}
            </select>
            <select className="inp" value={newProject.status} onChange={e => setNewProject({ ...newProject, status: e.target.value })}>
              {PROJECT_STATUSES.map(s => <option key={s} value={s} style={{ background: '#111' }}>{s}</option>)}
            </select>
            <div className="btn-row">
              <button className="btn primary" onClick={createProject}>CREEAZĂ</button>
              <button className="btn" onClick={() => setShowNewProject(false)}>ANULEAZĂ</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL — Editare proiect */}
      {editProject && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setEditProject(null)}>
          <div className="modal">
            <div className="modal-title">EDITEAZĂ PROIECT</div>
            <input className="inp" placeholder="Nume *" value={editProject.nume || ''} onChange={e => setEditProject({ ...editProject, nume: e.target.value })} />
            <input className="inp" placeholder="Descriere" value={editProject.descriere || ''} onChange={e => setEditProject({ ...editProject, descriere: e.target.value })} />
            <input className="inp" placeholder="Adresă" value={editProject.adresa || ''} onChange={e => setEditProject({ ...editProject, adresa: e.target.value })} />
            <div className="inp-row">
              <input className="inp" placeholder="Suprafață (m²)" type="number" value={editProject.suprafata || ''} onChange={e => setEditProject({ ...editProject, suprafata: Number(e.target.value) })} />
              <input className="inp" placeholder="Buget (lei)" type="number" value={editProject.buget || ''} onChange={e => setEditProject({ ...editProject, buget: Number(e.target.value) })} />
            </div>
            <div className="inp-row">
              <input className="inp" type="date" value={editProject.data_start || ''} onChange={e => setEditProject({ ...editProject, data_start: e.target.value })} />
              <input className="inp" type="date" value={editProject.data_estimata_finalizare || ''} onChange={e => setEditProject({ ...editProject, data_estimata_finalizare: e.target.value })} />
            </div>
            <input className="inp" type="date" placeholder="Data finalizare" value={editProject.data_finalizare || ''} onChange={e => setEditProject({ ...editProject, data_finalizare: e.target.value })} />
            <select className="inp" value={editProject.status || 'nou'} onChange={e => setEditProject({ ...editProject, status: e.target.value })}>
              {PROJECT_STATUSES.map(s => <option key={s} value={s} style={{ background: '#111' }}>{s}</option>)}
            </select>
            <select className="inp" value={editProject.client_id || ''} onChange={e => setEditProject({ ...editProject, client_id: e.target.value })}>
              <option value="">— Client —</option>
              {clients.filter(c => c.rol === 'client').map(c => <option key={c.id} value={c.id} style={{ background: '#111' }}>{c.full_name}</option>)}
            </select>
            <select className="inp" value={editProject.responsabil_id || ''} onChange={e => setEditProject({ ...editProject, responsabil_id: e.target.value })}>
              <option value="">— Responsabil —</option>
              {clients.filter(c => c.rol === 'angajat' || c.rol === 'superadmin').map(c => <option key={c.id} value={c.id} style={{ background: '#111' }}>{c.full_name}</option>)}
            </select>
            <div className="btn-row">
              <button className="btn primary" onClick={updateProject}>SALVEAZĂ</button>
              <button className="btn" onClick={() => setEditProject(null)}>ANULEAZĂ</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL — Fază nouă */}
      {showNewPhase && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowNewPhase(false)}>
          <div className="modal">
            <div className="modal-title">FAZĂ NOUĂ</div>
            <input className="inp" placeholder="Nume fază *" value={newPhase.nume} onChange={e => setNewPhase({ ...newPhase, nume: e.target.value })} />
            <input className="inp" placeholder="Descriere" value={newPhase.descriere} onChange={e => setNewPhase({ ...newPhase, descriere: e.target.value })} />
            <select className="inp" value={newPhase.status} onChange={e => setNewPhase({ ...newPhase, status: e.target.value })}>
              {PHASE_STATUSES.map(s => <option key={s} value={s} style={{ background: '#111' }}>{s}</option>)}
            </select>
            <input className="inp" placeholder="Progres (0-100)" type="number" min={0} max={100} value={newPhase.progres} onChange={e => setNewPhase({ ...newPhase, progres: Number(e.target.value) })} />
            <div className="inp-row">
              <input className="inp" type="date" value={newPhase.data_start} onChange={e => setNewPhase({ ...newPhase, data_start: e.target.value })} />
              <input className="inp" type="date" value={newPhase.data_sfarsit} onChange={e => setNewPhase({ ...newPhase, data_sfarsit: e.target.value })} />
            </div>
            <div className="btn-row">
              <button className="btn primary" onClick={createPhase}>ADAUGĂ</button>
              <button className="btn" onClick={() => setShowNewPhase(false)}>ANULEAZĂ</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL — Editare fază */}
      {editPhase && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setEditPhase(null)}>
          <div className="modal">
            <div className="modal-title">EDITEAZĂ FAZĂ</div>
            <input className="inp" placeholder="Nume *" value={editPhase.nume || ''} onChange={e => setEditPhase({ ...editPhase, nume: e.target.value })} />
            <input className="inp" placeholder="Descriere" value={editPhase.descriere || ''} onChange={e => setEditPhase({ ...editPhase, descriere: e.target.value })} />
            <select className="inp" value={editPhase.status || 'neinceputa'} onChange={e => setEditPhase({ ...editPhase, status: e.target.value })}>
              {PHASE_STATUSES.map(s => <option key={s} value={s} style={{ background: '#111' }}>{s}</option>)}
            </select>
            <input className="inp" type="number" min={0} max={100} placeholder="Progres %" value={editPhase.progres ?? 0} onChange={e => setEditPhase({ ...editPhase, progres: Number(e.target.value) })} />
            <div className="inp-row">
              <input className="inp" type="date" value={editPhase.data_start || ''} onChange={e => setEditPhase({ ...editPhase, data_start: e.target.value })} />
              <input className="inp" type="date" value={editPhase.data_sfarsit || ''} onChange={e => setEditPhase({ ...editPhase, data_sfarsit: e.target.value })} />
            </div>
            <div className="btn-row">
              <button className="btn primary" onClick={updatePhase}>SALVEAZĂ</button>
              <button className="btn" onClick={() => setEditPhase(null)}>ANULEAZĂ</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL — Produs nou */}
      {showNewProduct && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowNewProduct(false)}>
          <div className="modal">
            <div className="modal-title">PRODUS NOU</div>
            <input className="inp" placeholder="Nume produs *" value={newProduct.nume} onChange={e => setNewProduct({ ...newProduct, nume: e.target.value })} />
            <input className="inp" placeholder="Descriere scurtă" value={newProduct.descriere_scurta} onChange={e => setNewProduct({ ...newProduct, descriere_scurta: e.target.value })} />
            <input className="inp" placeholder="Descriere completă" value={newProduct.descriere} onChange={e => setNewProduct({ ...newProduct, descriere: e.target.value })} />
            <div className="inp-row">
              <input className="inp" placeholder="Preț (lei) *" type="number" value={newProduct.pret} onChange={e => setNewProduct({ ...newProduct, pret: e.target.value })} />
              <input className="inp" placeholder="Preț vechi (lei)" type="number" value={newProduct.pret_vechi} onChange={e => setNewProduct({ ...newProduct, pret_vechi: e.target.value })} />
            </div>
            <input className="inp" placeholder="Categorie" value={newProduct.categorie} onChange={e => setNewProduct({ ...newProduct, categorie: e.target.value })} />
            <input className="inp" placeholder="URL imagine" value={newProduct.imagine_url} onChange={e => setNewProduct({ ...newProduct, imagine_url: e.target.value })} />
            <input className="inp" placeholder="URL fișier descărcare" value={newProduct.fisier_url} onChange={e => setNewProduct({ ...newProduct, fisier_url: e.target.value })} />
            <div className="btn-row">
              <button className="btn primary" onClick={createProduct}>ADAUGĂ</button>
              <button className="btn" onClick={() => setShowNewProduct(false)}>ANULEAZĂ</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL — Editare produs */}
      {editProduct && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setEditProduct(null)}>
          <div className="modal">
            <div className="modal-title">EDITEAZĂ PRODUS</div>
            <input className="inp" placeholder="Nume *" value={editProduct.nume || ''} onChange={e => setEditProduct({ ...editProduct, nume: e.target.value })} />
            <input className="inp" placeholder="Descriere scurtă" value={editProduct.descriere_scurta || ''} onChange={e => setEditProduct({ ...editProduct, descriere_scurta: e.target.value })} />
            <input className="inp" placeholder="Descriere" value={editProduct.descriere || ''} onChange={e => setEditProduct({ ...editProduct, descriere: e.target.value })} />
            <div className="inp-row">
              <input className="inp" type="number" placeholder="Preț" value={editProduct.pret ?? ''} onChange={e => setEditProduct({ ...editProduct, pret: Number(e.target.value) })} />
              <input className="inp" type="number" placeholder="Preț vechi" value={editProduct.pret_vechi ?? ''} onChange={e => setEditProduct({ ...editProduct, pret_vechi: Number(e.target.value) })} />
            </div>
            <input className="inp" placeholder="Categorie" value={editProduct.categorie || ''} onChange={e => setEditProduct({ ...editProduct, categorie: e.target.value })} />
            <input className="inp" placeholder="URL imagine" value={editProduct.imagine_url || ''} onChange={e => setEditProduct({ ...editProduct, imagine_url: e.target.value })} />
            <input className="inp" placeholder="URL fișier" value={editProduct.fisier_url || ''} onChange={e => setEditProduct({ ...editProduct, fisier_url: e.target.value })} />
            <div className="btn-row">
              <button className="btn primary" onClick={updateProduct}>SALVEAZĂ</button>
              <button className="btn" onClick={() => setEditProduct(null)}>ANULEAZĂ</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL — Notificare */}
      {showNotifyModal && notifyTarget && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowNotifyModal(false)}>
          <div className="modal">
            <div className="modal-title">TRIMITE NOTIFICARE → <span style={{ color: '#e2b36e' }}>{notifyTarget.name}</span></div>
            <input className="inp" placeholder="Titlu *" value={notifyForm.titlu} onChange={e => setNotifyForm({ ...notifyForm, titlu: e.target.value })} />
            <input className="inp" placeholder="Mesaj (opțional)" value={notifyForm.mesaj} onChange={e => setNotifyForm({ ...notifyForm, mesaj: e.target.value })} />
            <input className="inp" placeholder="Link (ex: /dashboard/client/proiecte)" value={notifyForm.link} onChange={e => setNotifyForm({ ...notifyForm, link: e.target.value })} />
            <div className="btn-row">
              <button className="btn primary" onClick={sendNotification}>TRIMITE</button>
              <button className="btn" onClick={() => setShowNotifyModal(false)}>ANULEAZĂ</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}