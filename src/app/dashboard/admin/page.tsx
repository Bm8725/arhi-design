
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DashHeader from '@/components/DashHeader'

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

const PROJECT_STATUSES = ['nou', 'in_progres', 'in_asteptare', 'finalizat', 'anulat']
const ORDER_STATUSES = ['pending', 'paid', 'processing', 'completed', 'refunded', 'cancelled']
const PHASE_STATUSES = ['neinceputa', 'in_progres', 'finalizata', 'blocata']
const DOC_TIPURI = ['altul', 'contract', 'plan', 'autorizatie', 'deviz', 'raport', 'dxf', 'dwg', 'pdf', 'imagine']
const DOC_ACCEPT = '.pdf,.dxf,.dwg,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip,.rar,.svg,.ifc,.skp'

const STATUS_COLORS: Record<string, string> = {
  nou: '#6ee7b7', in_progres: '#e2b36e', in_asteptare: '#a5b4fc',
  finalizat: '#34d399', anulat: '#f87171', pending: '#e2b36e',
  paid: '#34d399', processing: '#a5b4fc', completed: '#34d399',
  refunded: '#f87171', cancelled: '#f87171', neinceputa: '#555',
  finalizata: '#34d399', blocata: '#f87171',
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const msgEndRef = useRef<HTMLDivElement>(null)

  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [adminName, setAdminName] = useState('')
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [currentAdminId, setCurrentAdminId] = useState('')

  const [activeTab, setActiveTab] = useState('overview')
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [activeProjectTab, setActiveProjectTab] = useState('faze')

  const [projects, setProjects] = useState<Project[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [clients, setClients] = useState<Profile[]>([])
  const [phases, setPhases] = useState<Phase[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  const [editProject, setEditProject] = useState<Partial<Project> | null>(null)
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null)
  const [editPhase, setEditPhase] = useState<Partial<Phase> | null>(null)
  const [showNewProject, setShowNewProject] = useState(false)
  const [showNewProduct, setShowNewProduct] = useState(false)
  const [showNewPhase, setShowNewPhase] = useState(false)
  const [showNotifyModal, setShowNotifyModal] = useState(false)
  const [notifyTarget, setNotifyTarget] = useState<{ id: string; name: string } | null>(null)
  const [notifyForm, setNotifyForm] = useState({ titlu: '', mesaj: '', link: '' })

  const [newProject, setNewProject] = useState({
    nume: '', descriere: '', status: 'nou', client_id: '', responsabil_id: '',
    adresa: '', suprafata: '', buget: '', data_start: '', data_estimata_finalizare: ''
  })
  const [newProduct, setNewProduct] = useState({
    nume: '', descriere: '', descriere_scurta: '', pret: '', pret_vechi: '',
    categorie: '', imagine_url: '', fisier_url: '', activ: true, featured: false
  })
  const [newPhase, setNewPhase] = useState({
    nume: '', descriere: '', status: 'neinceputa', progres: 0, data_start: '', data_sfarsit: ''
  })
  const [newMessage, setNewMessage] = useState('')

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadName, setUploadName] = useState('')
  const [uploadTip, setUploadTip] = useState('altul')
  const [uploadVizibil, setUploadVizibil] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const [projectFilter, setProjectFilter] = useState('')
  const [orderFilter, setOrderFilter] = useState('')
  const [clientFilter, setClientFilter] = useState('')

  useEffect(() => { setTimeout(() => setMounted(true), 50); fetchAll() }, [])
  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Realtime messages
  useEffect(() => {
    if (!activeProjectId) return
    const ch = supabase.channel('admin-msg-' + activeProjectId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `project_id=eq.${activeProjectId}` },
        () => fetchProjectDetails(activeProjectId))
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [activeProjectId])

  async function fetchAll() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      const { data: profile } = await supabase.from('profiles').select('full_name,rol,id').eq('id', user.id).single()
      if (!profile || (profile.rol !== 'superadmin' && profile.rol !== 'angajat')) return router.push('/dashboard/client')
      setAdminName(profile.full_name || 'Admin')
      setIsSuperAdmin(profile.rol === 'superadmin')
      setCurrentAdminId(profile.id)
      await Promise.all([fetchProjects(), fetchOrders(), fetchProducts(), fetchClients()])
    } finally { setLoading(false) }
  }

  async function fetchProjects() {
    const { data } = await supabase.from('projects').select(`*,profiles_client:profiles!projects_client_id_fkey(full_name),profiles_responsabil:profiles!projects_responsabil_id_fkey(full_name)`).order('created_at', { ascending: false })
    setProjects(data || [])
  }
  async function fetchOrders() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setOrders(data || [])
  }
  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
  }
  async function fetchClients() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setClients(data || [])
  }
  async function fetchProjectDetails(projectId: string) {
    const [{ data: ph }, { data: dc }, { data: ms }] = await Promise.all([
      supabase.from('phases').select('*').eq('project_id', projectId).order('ordine'),
      supabase.from('documents').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
      supabase.from('messages').select('*,profiles(full_name)').eq('project_id', projectId).order('created_at'),
    ])
    setPhases(ph || [])
    setDocuments(dc || [])
    setMessages(ms || [])
  }

  // ── Project CRUD ──
  async function createProject() {
    if (!newProject.nume) return
    await supabase.from('projects').insert([{ ...newProject, suprafata: newProject.suprafata ? Number(newProject.suprafata) : null, buget: newProject.buget ? Number(newProject.buget) : null, client_id: newProject.client_id || null, responsabil_id: newProject.responsabil_id || null, data_start: newProject.data_start || null, data_estimata_finalizare: newProject.data_estimata_finalizare || null }])
    setShowNewProject(false)
    setNewProject({ nume: '', descriere: '', status: 'nou', client_id: '', responsabil_id: '', adresa: '', suprafata: '', buget: '', data_start: '', data_estimata_finalizare: '' })
    fetchProjects()
  }
  async function updateProject() {
    if (!editProject?.id) return
    const { id, profiles_client, profiles_responsabil, ...rest } = editProject as any
    await supabase.from('projects').update(rest).eq('id', id)
    setEditProject(null); fetchProjects()
    if (activeProjectId === id) fetchProjectDetails(id)
  }
  async function deleteProject(id: string) {
    if (!confirm('Ștergi proiectul și tot ce conține?')) return
    await supabase.from('projects').delete().eq('id', id)
    if (activeProjectId === id) setActiveProjectId(null)
    fetchProjects()
  }
  async function updateProjectStatus(id: string, status: string) {
    await supabase.from('projects').update({ status }).eq('id', id); fetchProjects()
  }

  // ── Phase CRUD ──
  async function createPhase() {
    if (!newPhase.nume || !activeProjectId) return
    const maxOrdine = phases.length > 0 ? Math.max(...phases.map(p => p.ordine)) + 1 : 0
    await supabase.from('phases').insert([{ ...newPhase, project_id: activeProjectId, ordine: maxOrdine, progres: Number(newPhase.progres), data_start: newPhase.data_start || null, data_sfarsit: newPhase.data_sfarsit || null }])
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

  // ── Product CRUD ──
  async function createProduct() {
    if (!newProduct.nume) return
    await supabase.from('products').insert([{ ...newProduct, pret: Number(newProduct.pret) || 0, pret_vechi: newProduct.pret_vechi ? Number(newProduct.pret_vechi) : null }])
    setShowNewProduct(false)
    setNewProduct({ nume: '', descriere: '', descriere_scurta: '', pret: '', pret_vechi: '', categorie: '', imagine_url: '', fisier_url: '', activ: true, featured: false })
    fetchProducts()
  }
  async function updateProduct() {
    if (!editProduct?.id) return
    const { id, ...rest } = editProduct
    await supabase.from('products').update(rest).eq('id', id)
    setEditProduct(null); fetchProducts()
  }
  async function toggleProduct(id: string, field: string, value: boolean) {
    await supabase.from('products').update({ [field]: value }).eq('id', id); fetchProducts()
  }
  async function deleteProduct(id: string) {
    if (!confirm('Ștergi produsul?')) return
    await supabase.from('products').delete().eq('id', id); fetchProducts()
  }

  // ── Order ──
  async function updateOrderStatus(id: string, status: string) {
    await supabase.from('orders').update({ status }).eq('id', id); fetchOrders()
  }
  async function deleteOrder(id: string) {
    if (!confirm('Ștergi comanda?')) return
    await supabase.from('orders').delete().eq('id', id); fetchOrders()
  }

  // ── Clients ──
  async function toggleClient(id: string, activ: boolean) {
    await supabase.from('profiles').update({ activ }).eq('id', id); fetchClients()
  }
  async function changeClientRole(id: string, rol: string) {
    await supabase.from('profiles').update({ rol }).eq('id', id); fetchClients()
  }

  // ── Messages ──
  async function sendMessage() {
    if (!newMessage.trim() || !activeProjectId) return
    await supabase.from('messages').insert([{ project_id: activeProjectId, sender_id: currentAdminId, mesaj: newMessage.trim() }])
    setNewMessage('')
  }

  // ── Notifications ──
  async function sendNotification() {
    if (!notifyTarget || !notifyForm.titlu) return
    await supabase.from('notifications').insert([{ user_id: notifyTarget.id, titlu: notifyForm.titlu, mesaj: notifyForm.mesaj || null, link: notifyForm.link || null }])
    setShowNotifyModal(false); setNotifyForm({ titlu: '', mesaj: '', link: '' }); setNotifyTarget(null)
  }
  function openNotify(id: string, name: string) {
    setNotifyTarget({ id, name }); setNotifyForm({ titlu: '', mesaj: '', link: '' }); setShowNotifyModal(true)
  }

  // ── Documents upload ──
  function handleFile(f: File) {
    setUploadFile(f)
    if (!uploadName) setUploadName(f.name.replace(/\.[^.]+$/, ''))
    // auto-detect tip
    const ext = f.name.split('.').pop()?.toLowerCase() || ''
    if (['dxf', 'dwg'].includes(ext)) setUploadTip(ext)
    else if (ext === 'pdf') setUploadTip('pdf')
    else if (['png', 'jpg', 'jpeg'].includes(ext)) setUploadTip('imagine')
    else if (['doc', 'docx'].includes(ext)) setUploadTip('raport')
    else setUploadTip('altul')
  }

  async function uploadDocument() {
    if (!uploadFile || !activeProjectId) return
    setUploading(true); setUploadError('')
    try {
      const safeName = uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `${activeProjectId}/${Date.now()}_${safeName}`
      const { error: storageErr } = await supabase.storage.from('documents').upload(path, uploadFile, { upsert: false })
      if (storageErr) throw new Error(storageErr.message)
      const { data: signedData, error: signErr } = await supabase.storage.from('documents').createSignedUrl(path, 60 * 60 * 24 * 365 * 10)
      if (signErr || !signedData?.signedUrl) throw new Error('Nu s-a putut genera URL-ul')
      const { error: dbErr } = await supabase.from('documents').insert([{ project_id: activeProjectId, nume: uploadName || uploadFile.name, tip: uploadTip, url: signedData.signedUrl, marime_bytes: uploadFile.size, vizibil_client: uploadVizibil, incarcat_de: currentAdminId }])
      if (dbErr) throw new Error(dbErr.message)
      setUploadFile(null); setUploadName(''); setUploadTip('altul'); setUploadVizibil(true)
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchProjectDetails(activeProjectId)
    } catch (err: any) {
      setUploadError(err.message || 'Eroare la upload')
    } finally { setUploading(false) }
  }

  async function deleteDocument(id: string, url: string) {
    try {
      const urlObj = new URL(url)
      const pathMatch = urlObj.pathname.match(/\/documents\/(.+)/)
      if (pathMatch) await supabase.storage.from('documents').remove([decodeURIComponent(pathMatch[1])])
    } catch (_) {}
    await supabase.from('documents').delete().eq('id', id)
    if (activeProjectId) fetchProjectDetails(activeProjectId)
  }

  // ── Helpers ──
  function fmt(date: string) {
    return new Date(date).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  function fmtBytes(b: number | null) {
    if (!b) return '—'
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
    return `${(b / 1024 / 1024).toFixed(1)} MB`
  }

  const filteredProjects = projects.filter(p => p.nume.toLowerCase().includes(projectFilter.toLowerCase()) || (p.profiles_client?.full_name || '').toLowerCase().includes(projectFilter.toLowerCase()))
  const filteredOrders = orders.filter(o => o.email.toLowerCase().includes(orderFilter.toLowerCase()) || o.status.toLowerCase().includes(orderFilter.toLowerCase()))
  const filteredClients = clients.filter(c => (c.full_name || '').toLowerCase().includes(clientFilter.toLowerCase()) || c.rol.toLowerCase().includes(clientFilter.toLowerCase()))
  const activeProject = projects.find(p => p.id === activeProjectId)
  const revenue = orders.filter(o => o.status === 'paid' || o.status === 'completed').reduce((s, o) => s + Number(o.total), 0)
  const overallProgress = phases.length > 0 ? Math.round(phases.reduce((s, p) => s + p.progres, 0) / phases.length) : 0

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0c0c0c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#e2b36e', fontFamily: 'DM Mono,monospace', fontSize: 12, letterSpacing: '0.2em' }}>SE ÎNCARCĂ...</div>
    </div>
  )

  return (
    <>
<style>{`
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  .root {
    min-height: 100vh;
    background: #0a0a0a; /* Gri Antracit închis (Premium) */
    color: #ffffff;      /* Text alb pur pentru lizibilitate maximă */
    font-family: 'DM Mono', 'Monaco', monospace;
    display: flex;
    flex-direction: column;
    -webkit-font-smoothing: antialiased;
  }
  
  .wrap {
    max-width: 1200px;
    margin: 0 auto;
    padding: 120px 20px 80px;
    width: 100%;
    opacity: 0;
    transform: translateY(8px);
    transition: .4s ease-out;
  }
  .wrap.ready { opacity: 1; transform: translateY(0); }

  /* Header & Navigation */
  .top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 44px; flex-wrap: wrap; gap: 20px; }
  .title { font-size: clamp(24px, 4vw, 32px); font-weight: 700; letter-spacing: -0.01em; } 
  .title span { color: #e2b36e; font-weight: 700; } /* Accent auriu arhitectural */
  
  .logout { font-size: 14px; padding: 12px 22px; border: 2px solid #ffffff; background: #0a0a0a; color: #ffffff; font-weight: 700; cursor: pointer; font-family: inherit; }
  .logout:hover { border-color: #f87171; color: #f87171; background: #1f0d0d; }

  .tabs { display: flex; gap: 10px; margin-bottom: 40px; flex-wrap: wrap; }
  .tab { font-size: 14px; padding: 14px 24px; border: 2px solid #222222; background: #0f0f0f; color: #cccccc; font-weight: 700; cursor: pointer; font-family: inherit; }
  .tab:hover { border-color: #ffffff; color: #ffffff; }
  .tab.on { border-color: #e2b36e; color: #e2b36e; background: rgba(226,179,110,0.04); }

  /* Responsive Grids & Blocks */
  .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 20px; margin-bottom: 20px; }
  .stat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 44px; }

  .card { border: 2px solid #1f1f1f; padding: 28px; background: #0f0f0f; transition: .2s; }
  .card:hover { border-color: #e2b36e; }
  
  .stat { border: 2px solid #1f1f1f; padding: 28px 24px; background: #0f0f0f; }
  .stat-val { font-size: clamp(32px, 5vw, 42px); color: #e2b36e; font-weight: 700; margin-bottom: 8px; }
  .stat-lbl { font-size: 13px; color: #777777; text-transform: uppercase; font-weight: 700; }

  /* Tables & Layout Scroll (Safe Mobile) */
  .scroll-x { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; border: 2px solid #1f1f1f; margin-bottom: 24px; background: #0f0f0f; }
  .tbl { width: 100%; border-collapse: collapse; font-size: 15px; min-width: 600px; color: #ffffff; }
  .tbl th { text-align: left; font-size: 13px; padding: 16px 18px; border-bottom: 3px solid #ffffff; font-weight: 700; text-transform: uppercase; background: #151515; color: #888888; }
  .tbl td { padding: 18px 18px; border-bottom: 2px solid #151515; font-weight: 700; }
  .tbl tr:hover td { background: #121212; }

  /* Forms & Inputs */
  .inp { width: 100%; padding: 14px 16px; border: 2px solid #333333; background: #0a0a0a; color: #ffffff; font-size: 15px; margin-bottom: 14px; font-weight: 700; font-family: inherit; }
  .inp:focus { outline: none; border-color: #e2b36e; background: #0d0c08; }
  .inp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

  /* Buttons */
  .btn { font-size: 13px; padding: 14px 24px; border: 2px solid #ffffff; background: #0a0a0a; color: #ffffff; font-weight: 700; text-transform: uppercase; cursor: pointer; font-family: inherit; display: inline-flex; align-items: center; justify-content: center; }
  .btn:hover { border-color: #e2b36e; color: #e2b36e; }
  .btn.primary { border-color: #e2b36e; color: #000000; background: #e2b36e; }
  .btn.primary:hover { background: #c59653; border-color: #c59653; }
  .btn.danger { border-color: #f87171; color: #f87171; }
  .btn.danger:hover { background: #f87171; color: #000000; }
  .btn.sm { padding: 8px 14px; font-size: 12px; width: auto; }
  .btn.sm:disabled { opacity: .3; cursor: not-allowed; border-color: #333333; color: #555555; }
  .btn-row { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 20px; }

  /* Components & Modals */
  .badge { font-size: 12px; padding: 6px 14px; border: 2px solid #ffffff; font-weight: 700; display: inline-block; }
  .prog-wrap { background: #222222; height: 6px; flex: 1; min-width: 100px; }
  .prog-bar { height: 6px; background: #e2b36e; transition: .4s; }

  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,.85); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(4px); }
  .modal { background: #0a0a0a; border: 2px solid #222222; padding: 32px 24px; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; }
  .modal-title { font-size: 20px; font-weight: 700; margin-bottom: 28px; }
  .modal-title span { color: #e2b36e; }

  .sub-tabs { display: flex; gap: 8px; margin-bottom: 28px; border-bottom: 3px solid #1f1f1f; overflow-x: auto; }
  .sub-tab { font-size: 13px; padding: 12px 20px 14px; border: none; background: transparent; color: #555555; font-weight: 700; text-transform: uppercase; border-bottom: 4px solid transparent; cursor: pointer; font-family: inherit; white-space: nowrap; }
  .sub-tab:hover { color: #ffffff; }
  .sub-tab.on { color: #e2b36e; border-bottom-color: #e2b36e; }

  /* Chat Logs & Upload */
  .msgs { max-height: 380px; overflow-y: auto; margin-bottom: 20px; }
  .msg { padding: 16px 20px; margin-bottom: 10px; font-size: 14px; line-height: 1.6; border: 2px solid #1f1f1f; background: #0f0f0f; }
  .msg.admin-msg { background: rgba(226,179,110,0.02); border-left: 5px solid #e2b36e; }
  .msg.client-msg { background: #151515; border-left: 5px solid #ffffff; }
  .msg-meta { font-size: 11px; color: #555555; margin-top: 8px; font-weight: 700; }

  .upload-zone { border: 3px dashed #222222; background: #0f0f0f; padding: 44px 20px; text-align: center; font-weight: 700; font-size: 15px; cursor: pointer; color: #666666; }
  .upload-zone:hover { border-color: #e2b36e; color: #ffffff; background: rgba(226,179,110,0.02); }

  /* Utilities */
  .section-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
  .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; color: #555555; }
  .empty { font-size: 14px; color: #444444; padding: 48px 20px; text-align: center; border: 2px dashed #1f1f1f; background: #0f0f0f; font-weight: 700; }
  
  .search { width: 100%; max-width: 340px; padding: 13px 16px; border: 2px solid #333333; background: #0a0a0a; color: #ffffff; font-size: 15px; margin-bottom: 24px; font-weight: 700; font-family: inherit; }
  .search:focus { border-color: #e2b36e; }
  
  .tag { font-size: 11px; padding: 4px 10px; background: rgba(226,179,110,0.1); color: #e2b36e; margin-right: 8px; display: inline-block; font-weight: 700; }
  .detail-back { font-size: 13px; font-weight: 700; text-transform: uppercase; cursor: pointer; background: none; border: none; font-family: inherit; color: #ffffff; }
  .detail-back:hover { color: #e2b36e; }
  .chip { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; padding: 6px 12px; border: 2px solid #1f1f1f; background: #0f0f0f; font-weight: 700; color: #ffffff; }
  .sep { height: 2px; background: #1f1f1f; margin: 28px 0; }

  /* Mobile Responsive Steps */
  @media(max-width: 650px) { .inp-row { grid-template-columns: 1fr; } }
  @media(max-width: 500px) { .tab { flex-grow: 1; text-align: center; padding: 12px 16px; } }
  @media(max-width: 480px) {
    .stat-grid { grid-template-columns: repeat(2, 1fr); }
    .card-grid { grid-template-columns: 1fr; }
    .btn { width: 100%; padding: 16px; }
    .btn-row { flex-direction: column; gap: 10px; }
    .search { max-width: 100%; }
  }
`}</style>


      <div className="root">
       <DashHeader />
        <div className={`wrap ${mounted ? 'ready' : ''}`}>

          {/* ── Header ── */}
          <div className="top">
            <div>
              <div className="title">ADMIN — <span>{adminName}</span></div>
              <div style={{ fontSize: 9, color: '#333', marginTop: 4, letterSpacing: '.2em' }}>{isSuperAdmin ? 'SUPERADMIN' : 'ANGAJAT'}</div>
            </div>
            <button className="logout" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}>LOGOUT</button>
          </div>

          {/* ── Main tabs ── */}
          <div className="tabs">
            {['overview', 'proiecte', 'comenzi', 'magazin', 'clienti'].map(t => (
              <button key={t} className={`tab ${activeTab === t ? 'on' : ''}`}
                onClick={() => { setActiveTab(t); setActiveProjectId(null) }}>
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {/* ════════════ OVERVIEW ════════════ */}
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

              <div className="section-title" style={{ marginBottom: 12 }}>PROIECTE RECENTE</div>
              {projects.slice(0, 5).map(p => (
                <div key={p.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer' }}
                  onClick={() => { setActiveTab('proiecte'); setActiveProjectId(p.id); fetchProjectDetails(p.id) }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#e0e0e0', marginBottom: 3 }}>{p.nume}</div>
                    <div style={{ fontSize: 10, color: '#444' }}>{p.profiles_client?.full_name || '—'} · {fmt(p.created_at)}</div>
                  </div>
                  <span className="badge" style={{ color: STATUS_COLORS[p.status] || '#777' }}>{p.status}</span>
                </div>
              ))}

              <div className="sep" />
              <div className="section-title" style={{ marginBottom: 12 }}>COMENZI RECENTE</div>
              {orders.slice(0, 5).map(o => (
                <div key={o.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#e0e0e0', marginBottom: 3 }}>{o.email}</div>
                    <div style={{ fontSize: 10, color: '#444' }}>{fmt(o.created_at)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#e2b36e', fontSize: 13, marginBottom: 4 }}>{Number(o.total).toLocaleString('ro-RO')} lei</div>
                    <span className="badge" style={{ color: STATUS_COLORS[o.status] || '#777' }}>{o.status}</span>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ════════════ PROIECTE LIST ════════════ */}
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
                        <div style={{ fontSize: 13, color: '#fff', marginBottom: 5 }}>{p.nume}</div>
                        <div style={{ fontSize: 10, color: '#555', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          <span>👤 {p.profiles_client?.full_name || '—'}</span>
                          <span>📋 {p.profiles_responsabil?.full_name || '—'}</span>
                          <span>{fmt(p.created_at)}</span>
                        </div>
                        {p.adresa && <div style={{ fontSize: 10, color: '#444', marginTop: 4 }}>📍 {p.adresa}</div>}
                        <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
                          {p.suprafata && <span className="chip">{p.suprafata} m²</span>}
                          {p.buget && <span className="chip">{Number(p.buget).toLocaleString('ro-RO')} lei</span>}
                          {p.data_estimata_finalizare && <span className="chip">Est. {p.data_estimata_finalizare}</span>}
                        </div>
                      </div>
                      <span className="badge" style={{ color: STATUS_COLORS[p.status] || '#777' }}>{p.status}</span>
                    </div>
                    <div className="btn-row">
                      <button className="btn sm primary" onClick={() => { setActiveProjectId(p.id); fetchProjectDetails(p.id) }}>DETALII →</button>
                      <button className="btn sm" onClick={() => setEditProject({ ...p })}>EDITEAZĂ</button>
                      <select className="btn sm" style={{ background: 'transparent' }} value={p.status} onChange={e => updateProjectStatus(p.id, e.target.value)}>
                        {PROJECT_STATUSES.map(s => <option key={s} value={s} style={{ background: '#111' }}>{s}</option>)}
                      </select>
                      <button className="btn sm" onClick={() => openNotify(p.client_id!, p.profiles_client?.full_name || 'client')} disabled={!p.client_id}>NOTIFY CLIENT</button>
                      {isSuperAdmin && <button className="btn sm danger" onClick={() => deleteProject(p.id)}>ȘTERGE</button>}
                    </div>
                  </div>
                ))
              }
            </>
          )}

          {/* ════════════ PROIECT DETAIL ════════════ */}
          {activeTab === 'proiecte' && activeProjectId && activeProject && (
            <>
              <button className="detail-back" onClick={() => setActiveProjectId(null)}>← ÎNAPOI LA PROIECTE</button>

              {/* Project header card */}
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, color: '#fff', marginBottom: 8, fontWeight: 300 }}>{activeProject.nume}</div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 10, color: '#555', marginBottom: 8 }}>
                      <span>👤 Client: <span style={{ color: '#aaa' }}>{activeProject.profiles_client?.full_name || '—'}</span></span>
                      <span>📋 Resp: <span style={{ color: '#aaa' }}>{activeProject.profiles_responsabil?.full_name || '—'}</span></span>
                      {activeProject.adresa && <span>📍 {activeProject.adresa}</span>}
                      {activeProject.buget && <span>💰 {Number(activeProject.buget).toLocaleString('ro-RO')} lei</span>}
                      {activeProject.suprafata && <span>📐 {activeProject.suprafata} m²</span>}
                    </div>
                    {activeProject.descriere && <div style={{ fontSize: 11, color: '#555', lineHeight: 1.7 }}>{activeProject.descriere}</div>}
                    {phases.length > 0 && (
                      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="prog-wrap"><div className="prog-bar" style={{ width: `${overallProgress}%` }} /></div>
                        <span style={{ fontSize: 10, color: '#e2b36e', minWidth: 40 }}>{overallProgress}% finalizat</span>
                      </div>
                    )}
                  </div>
                  <span className="badge" style={{ color: STATUS_COLORS[activeProject.status] || '#777' }}>{activeProject.status}</span>
                </div>
                <div className="btn-row" style={{ marginTop: 12 }}>
                  <button className="btn sm" onClick={() => setEditProject({ ...activeProject })}>EDITEAZĂ</button>
                  <button className="btn sm" onClick={() => openNotify(activeProject.client_id!, activeProject.profiles_client?.full_name || 'client')} disabled={!activeProject.client_id}>NOTIFY CLIENT</button>
                  {isSuperAdmin && <button className="btn sm danger" onClick={() => deleteProject(activeProjectId)}>ȘTERGE PROIECT</button>}
                </div>
              </div>

              {/* Sub tabs */}
              <div className="sub-tabs">
                {[['faze', `Faze (${phases.length})`], ['documente', `Documente (${documents.length})`], ['mesaje', `Mesaje (${messages.length})`]].map(([t, label]) => (
                  <button key={t} className={`sub-tab ${activeProjectTab === t ? 'on' : ''}`} onClick={() => setActiveProjectTab(t)}>
                    {label}
                  </button>
                ))}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                          <div style={{ fontSize: 12, color: '#e0e0e0', flex: 1 }}>
                            <span style={{ color: '#444', marginRight: 8 }}>{ph.ordine + 1}.</span>{ph.nume}
                          </div>
                          <span className="badge" style={{ color: STATUS_COLORS[ph.status] || '#777' }}>{ph.status}</span>
                        </div>
                        {ph.descriere && <div style={{ fontSize: 10, color: '#444', marginBottom: 10 }}>{ph.descriere}</div>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <div className="prog-wrap"><div className="prog-bar" style={{ width: `${ph.progres}%` }} /></div>
                          <span style={{ fontSize: 11, color: '#e2b36e', minWidth: 36 }}>{ph.progres}%</span>
                        </div>
                        {(ph.data_start || ph.data_sfarsit) && (
                          <div style={{ fontSize: 9, color: '#444', display: 'flex', gap: 12, marginBottom: 8 }}>
                            {ph.data_start && <span>Start: {ph.data_start}</span>}
                            {ph.data_sfarsit && <span>Sfârșit: {ph.data_sfarsit}</span>}
                          </div>
                        )}
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
                  {/* Upload zone */}
                  <div style={{ border: '1px solid #1a1a1a', padding: 16, marginBottom: 16, background: 'rgba(255,255,255,.01)' }}>
                    <div className="section-title" style={{ marginBottom: 12 }}>ÎNCARCĂ DOCUMENT</div>

                    <div
                      className={`upload-zone ${dragOver ? 'drag' : ''} ${uploadFile ? 'has-file' : ''}`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                    >
                      {uploadFile ? (
                        <div>
                          <div style={{ fontSize: 13, color: '#e2b36e', marginBottom: 4 }}>✓ {uploadFile.name}</div>
                          <div style={{ fontSize: 10, color: '#555' }}>{fmtBytes(uploadFile.size)}</div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: 24, marginBottom: 8, color: '#333' }}>↑</div>
                          <div style={{ fontSize: 11, color: '#444' }}>Click sau drag & drop</div>
                          <div style={{ fontSize: 9, color: '#2a2a2a', marginTop: 6, letterSpacing: '.1em' }}>
                            PDF · DXF · DWG · DOC · XLS · PNG · ZIP · IFC · SKP
                          </div>
                        </div>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept={DOC_ACCEPT} style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

                    <div className="inp-row">
                      <input className="inp" style={{ margin: 0 }} placeholder="Nume document" value={uploadName} onChange={e => setUploadName(e.target.value)} />
                      <select className="inp" style={{ margin: 0 }} value={uploadTip} onChange={e => setUploadTip(e.target.value)}>
                        {DOC_TIPURI.map(t => <option key={t} value={t} style={{ background: '#111' }}>{t}</option>)}
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, flexWrap: 'wrap', gap: 8 }}>
                      <label style={{ fontSize: 10, color: '#555', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input type="checkbox" checked={uploadVizibil} onChange={e => setUploadVizibil(e.target.checked)} style={{ accentColor: '#e2b36e' }} />
                        Vizibil pentru client
                      </label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {uploadFile && <button className="btn sm" onClick={() => { setUploadFile(null); setUploadName(''); if (fileInputRef.current) fileInputRef.current.value = '' }}>ANULEAZĂ</button>}
                        <button className="btn sm primary" onClick={uploadDocument} disabled={!uploadFile || uploading}>
                          {uploading ? 'SE ÎNCARCĂ...' : 'ÎNCARCĂ FIȘIER'}
                        </button>
                      </div>
                    </div>
                    {uploadError && <div style={{ fontSize: 10, color: '#f87171', marginTop: 8 }}>⚠ {uploadError}</div>}
                  </div>

                  {/* Documents list */}
                  <div className="section-hd">
                    <div className="section-title">DOCUMENTE ({documents.length})</div>
                  </div>
                  {documents.length === 0
                    ? <div className="empty">Niciun document încărcat.</div>
                    : (
                      <div className="scroll-x">
                        <table className="tbl">
                          <thead>
                            <tr><th>NUME</th><th>TIP</th><th>MĂRIME</th><th>VIZIBIL CLIENT</th><th>DATA</th><th></th></tr>
                          </thead>
                          <tbody>
                            {documents.map(d => (
                              <tr key={d.id}>
                                <td>
                                  <a href={d.url} target="_blank" rel="noreferrer" style={{ color: '#e2b36e', textDecoration: 'none' }}>
                                    {d.nume} ↗
                                  </a>
                                </td>
                                <td><span className="badge" style={{ color: '#555' }}>{d.tip}</span></td>
                                <td style={{ color: '#555' }}>{fmtBytes(d.marime_bytes)}</td>
                                <td>
                                  <span style={{ color: d.vizibil_client ? '#34d399' : '#444', fontSize: 10 }}>
                                    {d.vizibil_client ? '✓ DA' : '✗ NU'}
                                  </span>
                                </td>
                                <td style={{ color: '#444' }}>{fmt(d.created_at)}</td>
                                <td><button className="btn sm danger" onClick={() => deleteDocument(d.id, d.url)}>ȘT</button></td>
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
                  <div className="msgs">
                    {messages.length === 0
                      ? <div className="empty">Niciun mesaj.</div>
                      : messages.map(m => {
                        const isAdmin = m.sender_id === currentAdminId
                        return (
                          <div key={m.id} className={`msg ${isAdmin ? 'admin-msg' : 'client-msg'}`}>
                            <div style={{ color: '#e0e0e0' }}>{m.mesaj}</div>
                            <div className="msg-meta">{m.profiles?.full_name || 'Anonim'} · {fmt(m.created_at)}</div>
                          </div>
                        )
                      })
                    }
                    <div ref={msgEndRef} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="inp" style={{ margin: 0 }} placeholder="Scrie un mesaj..." value={newMessage}
                      onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
                    <button className="btn primary" onClick={sendMessage}>TRIMITE</button>
                  </div>
                </>
              )}
            </>
          )}

          {/* ════════════ COMENZI ════════════ */}
          {activeTab === 'comenzi' && (
            <>
              <input className="search" placeholder="Caută după email sau status..." value={orderFilter} onChange={e => setOrderFilter(e.target.value)} />
              <div className="scroll-x">
                <table className="tbl">
                  <thead>
                    <tr><th>EMAIL</th><th>TOTAL</th><th>STATUS</th><th>DATA</th><th>STRIPE</th><th>ACȚIUNI</th></tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0
                      ? <tr><td colSpan={6} style={{ textAlign: 'center', color: '#2a2a2a', padding: 32 }}>Nicio comandă.</td></tr>
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
                          <td style={{ color: '#444' }}>{fmt(o.created_at)}</td>
                          <td style={{ color: '#333', fontSize: 9 }}>{o.stripe_payment_id ? o.stripe_payment_id.slice(0, 14) + '…' : '—'}</td>
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

          {/* ════════════ MAGAZIN ════════════ */}
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
                      {p.imagine_url && <img src={p.imagine_url} alt={p.nume} style={{ width: '100%', height: 130, objectFit: 'cover', marginBottom: 12, background: '#111' }} />}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                        <div style={{ fontSize: 12, color: '#e0e0e0', flex: 1 }}>{p.nume}</div>
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                          {p.activ && <span style={{ fontSize: 8, color: '#34d399', border: '1px solid #34d399', padding: '2px 5px' }}>ACTIV</span>}
                          {p.featured && <span style={{ fontSize: 8, color: '#e2b36e', border: '1px solid #e2b36e', padding: '2px 5px' }}>TOP</span>}
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: '#444', marginBottom: 6 }}>{p.categorie || '—'}</div>
                      <div style={{ fontSize: 14, color: '#e2b36e', marginBottom: 4 }}>
                        {Number(p.pret).toLocaleString('ro-RO')} lei
                        {p.pret_vechi && <span style={{ fontSize: 10, color: '#333', textDecoration: 'line-through', marginLeft: 8 }}>{Number(p.pret_vechi).toLocaleString('ro-RO')}</span>}
                      </div>
                      {p.tags && <div style={{ marginBottom: 8 }}>{p.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>}
                      <div style={{ fontSize: 9, color: '#333', marginBottom: 12 }}>{p.nr_descarcari} descărcări</div>
                      <div className="btn-row">
                        <button className="btn sm" onClick={() => setEditProduct({ ...p })}>EDIT</button>
                        <button className="btn sm" style={{ color: p.activ ? '#34d399' : '#444', borderColor: p.activ ? '#34d399' : '#252525' }}
                          onClick={() => toggleProduct(p.id, 'activ', !p.activ)}>
                          {p.activ ? 'ACTIV' : 'INACTIV'}
                        </button>
                        <button className="btn sm" style={{ color: p.featured ? '#e2b36e' : '#444', borderColor: p.featured ? '#e2b36e' : '#252525' }}
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

          {/* ════════════ CLIENȚI ════════════ */}
          {activeTab === 'clienti' && (
            <>
              <input className="search" placeholder="Caută după nume sau rol..." value={clientFilter} onChange={e => setClientFilter(e.target.value)} />
              <div className="scroll-x">
                <table className="tbl">
                  <thead>
                    <tr><th>NUME</th><th>COMPANIE</th><th>TELEFON</th><th>ROL</th><th>STATUS</th><th>DIN</th><th>ACȚIUNI</th></tr>
                  </thead>
                  <tbody>
                    {filteredClients.length === 0
                      ? <tr><td colSpan={7} style={{ textAlign: 'center', color: '#2a2a2a', padding: 32 }}>Niciun utilizator.</td></tr>
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
                              : <span className="badge" style={{ color: '#555' }}>{c.rol}</span>
                            }
                          </td>
                          <td><span style={{ color: c.activ ? '#34d399' : '#f87171', fontSize: 10 }}>{c.activ ? '✓ ACTIV' : '✗ BLOCAT'}</span></td>
                          <td style={{ color: '#444' }}>{fmt(c.created_at)}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
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
        
      </div>

      {/* ════════ MODAL Proiect nou ════════ */}
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
              <input className="inp" type="date" value={newProject.data_start} onChange={e => setNewProject({ ...newProject, data_start: e.target.value })} />
              <input className="inp" type="date" value={newProject.data_estimata_finalizare} onChange={e => setNewProject({ ...newProject, data_estimata_finalizare: e.target.value })} />
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
              <button className="btn primary" onClick={createProject}>CREEAZĂ PROIECT</button>
              <button className="btn" onClick={() => setShowNewProject(false)}>ANULEAZĂ</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ MODAL Editare proiect ════════ */}
      {editProject && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setEditProject(null)}>
          <div className="modal">
            <div className="modal-title">EDITEAZĂ PROIECT</div>
            <input className="inp" placeholder="Nume *" value={editProject.nume || ''} onChange={e => setEditProject({ ...editProject, nume: e.target.value })} />
            <input className="inp" placeholder="Descriere" value={editProject.descriere || ''} onChange={e => setEditProject({ ...editProject, descriere: e.target.value })} />
            <input className="inp" placeholder="Adresă" value={editProject.adresa || ''} onChange={e => setEditProject({ ...editProject, adresa: e.target.value })} />
            <div className="inp-row">
              <input className="inp" type="number" placeholder="Suprafață" value={editProject.suprafata || ''} onChange={e => setEditProject({ ...editProject, suprafata: Number(e.target.value) })} />
              <input className="inp" type="number" placeholder="Buget" value={editProject.buget || ''} onChange={e => setEditProject({ ...editProject, buget: Number(e.target.value) })} />
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

      {/* ════════ MODAL Fază nouă ════════ */}
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

      {/* ════════ MODAL Editare fază ════════ */}
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

      {/* ════════ MODAL Produs nou ════════ */}
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

      {/* ════════ MODAL Editare produs ════════ */}
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

      {/* ════════ MODAL Notificare ════════ */}
      {showNotifyModal && notifyTarget && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowNotifyModal(false)}>
          <div className="modal">
            <div className="modal-title">NOTIFY → <span>{notifyTarget.name}</span></div>
            <input className="inp" placeholder="Titlu *" value={notifyForm.titlu} onChange={e => setNotifyForm({ ...notifyForm, titlu: e.target.value })} />
            <input className="inp" placeholder="Mesaj (opțional)" value={notifyForm.mesaj} onChange={e => setNotifyForm({ ...notifyForm, mesaj: e.target.value })} />
            <input className="inp" placeholder="Link (ex: /dashboard/client)" value={notifyForm.link} onChange={e => setNotifyForm({ ...notifyForm, link: e.target.value })} />
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
