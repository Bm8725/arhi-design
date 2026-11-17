'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import DashHeader from '@/components/DashHeader'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard, Folder, ShoppingCart, Package, Users, PlusSquare, LogOut, Menu, X,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown, ArrowUpDown,
  Search, Download, Plus, Bell, Trash2, Pencil, Copy, Star, Upload, FileText, Send,
  Check, AlertTriangle, Info, Paperclip, ArrowRight, ExternalLink,
} from 'lucide-react'

/* ============================================================
   SETĂRI
============================================================ */
// true  = afișează și bara DashHeader existentă deasupra (dacă are funcții de care ai nevoie)
// false = folosește bara de sus proprie din acest dashboard
const USE_DASH_HEADER = false

/* ============================================================
   TIPURI
============================================================ */
type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  company: string | null
  rol: string
  activ: boolean
  created_at: string
  provider?: string | null
  email?: string | null
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
  stripe_payment_intent?: string | null
  billing_name?: string | null
  created_at: string
  user_id: string | null
}

type OrderItem = {
  id: string
  product_id: string | null
  nume_produs: string
  pret_la_cumparare: number
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
  imagini: string[] | null
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

type DocumentRow = {
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

type ProjectDraft = {
  id?: string
  nume: string
  descriere: string
  status: string
  client_id: string
  responsabil_id: string
  adresa: string
  suprafata: string
  buget: string
  data_start: string
  data_estimata_finalizare: string
  data_finalizare: string
}

type ProductDraft = {
  id?: string
  nume: string
  descriere: string
  descriere_scurta: string
  pret: string
  pret_vechi: string
  categorie: string
  imagine_url: string
  imagini: string[]
  fisier_url: string
  activ: boolean
  featured: boolean
  tags: string[]
}

type PhaseDraft = {
  id?: string
  nume: string
  descriere: string
  status: string
  progres: number
  data_start: string
  data_sfarsit: string
}

type TabKey = 'overview' | 'proiecte' | 'comenzi' | 'magazin' | 'clienti'
type SortDir = 'asc' | 'desc'
type SortState = { key: string; dir: SortDir }
type ToastKind = 'success' | 'error' | 'info'

/* ============================================================
   CONSTANTE
============================================================ */
const PROJECT_STATUSES = ['nou', 'in_progres', 'in_asteptare', 'finalizat', 'anulat']
// Trebuie să corespundă enum-ului order_status din baza de date
const ORDER_STATUSES = ['pending', 'paid', 'processing', 'refunded', 'cancelled']
const PHASE_STATUSES = ['neinceputa', 'in_progres', 'finalizata', 'blocata']
const DOC_TIPURI = ['altul', 'contract', 'plan', 'autorizatie', 'deviz', 'raport', 'dxf', 'dwg', 'pdf', 'imagine']
const DOC_ACCEPT = '.pdf,.dxf,.dwg,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip,.rar,.svg,.ifc,.skp'
const PRODUCT_FILE_ACCEPT = '.pdf,.dxf,.dwg,.doc,.docx,.xls,.xlsx,.zip,.rar,.ifc,.skp,.dwf'

const STATUS_COLORS: Record<string, string> = {
  nou: '#6ee7b7', in_progres: '#e2b36e', in_asteptare: '#a5b4fc', finalizat: '#34d399', anulat: '#f87171',
  pending: '#e2b36e', paid: '#34d399', processing: '#a5b4fc', completed: '#34d399', refunded: '#f87171', cancelled: '#f87171',
  neinceputa: '#8b8b93', finalizata: '#34d399', blocata: '#f87171',
}

const STATUS_LABELS: Record<string, string> = {
  nou: 'Nou', in_progres: 'În progres', in_asteptare: 'În așteptare', finalizat: 'Finalizat', anulat: 'Anulat',
  pending: 'În așteptare', paid: 'Plătită', processing: 'În procesare', completed: 'Finalizată', refunded: 'Rambursată', cancelled: 'Anulată',
  neinceputa: 'Neînceput', finalizata: 'Finalizată', blocata: 'Blocată',
}

const PROVIDER_LABELS: Record<string, string> = { google: 'Google', email: 'Email', facebook: 'Facebook', github: 'GitHub', apple: 'Apple' }
const PROVIDER_COLORS: Record<string, string> = { google: '#e2b36e', email: '#a5b4fc', facebook: '#7dd3fc', github: '#d4d4d8', apple: '#d4d4d8' }

const NAV: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: 'overview', label: 'Prezentare', icon: LayoutDashboard },
  { key: 'proiecte', label: 'Proiecte', icon: Folder },
  { key: 'comenzi', label: 'Comenzi', icon: ShoppingCart },
  { key: 'magazin', label: 'Magazin', icon: Package },
  { key: 'clienti', label: 'Utilizatori', icon: Users },
]

const TAB_TITLES: Record<TabKey, string> = {
  overview: 'Prezentare generală',
  proiecte: 'Proiecte',
  comenzi: 'Comenzi',
  magazin: 'Magazin',
  clienti: 'Utilizatori',
}

const emptyProject: ProjectDraft = {
  nume: '', descriere: '', status: 'nou', client_id: '', responsabil_id: '', adresa: '',
  suprafata: '', buget: '', data_start: '', data_estimata_finalizare: '', data_finalizare: '',
}
const emptyProduct: ProductDraft = {
  nume: '', descriere: '', descriere_scurta: '', pret: '', pret_vechi: '', categorie: '',
  imagine_url: '', imagini: [], fisier_url: '', activ: true, featured: false, tags: [],
}
const emptyPhase: PhaseDraft = { nume: '', descriere: '', status: 'neinceputa', progres: 0, data_start: '', data_sfarsit: '' }

/* ============================================================
   FUNCȚII AJUTĂTOARE
============================================================ */
const providerLabel = (p?: string | null) => (!p ? 'Email' : PROVIDER_LABELS[p] || p.charAt(0).toUpperCase() + p.slice(1))
const providerColor = (p?: string | null) => (!p ? PROVIDER_COLORS.email : PROVIDER_COLORS[p] || '#8b8b93')
const errMsg = (e: unknown) => (e instanceof Error ? e.message : typeof e === 'string' ? e : 'Eroare necunoscută')

function fmt(date: string | null | undefined) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' })
}
function fmtBytes(b: number | null) {
  if (!b) return '—'
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}
function fmtMoney(n: number) {
  return `${Number(n).toLocaleString('ro-RO')} lei`
}
function fileNameFromUrl(url?: string | null) {
  if (!url) return ''
  try {
    const last = url.split('?')[0].split('/').pop() || ''
    return decodeURIComponent(last.replace(/^\d+_/, ''))
  } catch {
    return url
  }
}
function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || 'A'
}

type SortVal = string | number | null | undefined

function sortItems<T>(items: T[], get: (x: T) => SortVal, dir: SortDir): T[] {
  return items.slice().sort((x, y) => {
    const a = get(x)
    const b = get(y)
    const an = a === null || a === undefined || a === ''
    const bn = b === null || b === undefined || b === ''
    if (an && bn) return 0
    if (an) return 1 // valorile lipsă mereu la final
    if (bn) return -1
    let c: number
    if (typeof a === 'number' && typeof b === 'number') c = a - b
    else c = String(a).localeCompare(String(b), 'ro', { numeric: true, sensitivity: 'base' })
    return dir === 'asc' ? c : -c
  })
}

function useSorted<T>(items: T[], getters: Record<string, (x: T) => SortVal>, initial: SortState) {
  const [sort, setSort] = useState<SortState>(initial)
  const sorted = useMemo(
    () => sortItems(items, getters[sort.key] ?? (() => null), sort.dir),
    [items, getters, sort]
  )
  const toggle = useCallback((key: string, first: SortDir = 'asc') => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: first }))
  }, [])
  return { sort, setSort, sorted, toggle }
}

function usePagination<T>(items: T[], initialSize: number, resetKey: string) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSizeState] = useState(initialSize)
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(page, totalPages)

  useEffect(() => { setPage(1) }, [resetKey])

  const slice = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize]
  )
  const total = items.length
  return {
    page: safePage,
    setPage,
    pageSize,
    setPageSize: (n: number) => { setPageSizeState(n); setPage(1) },
    totalPages,
    slice,
    total,
    from: total === 0 ? 0 : (safePage - 1) * pageSize + 1,
    to: Math.min(safePage * pageSize, total),
  }
}

/* getters de sortare (module-level = referințe stabile) */
const PROJECT_SORTS: { key: string; label: string; get: (p: Project) => SortVal }[] = [
  { key: 'created_at', label: 'Data creării', get: (p) => Date.parse(p.created_at) },
  { key: 'nume', label: 'Nume', get: (p) => p.nume },
  { key: 'status', label: 'Status', get: (p) => PROJECT_STATUSES.indexOf(p.status) },
  { key: 'client', label: 'Client', get: (p) => p.profiles_client?.full_name },
  { key: 'buget', label: 'Buget', get: (p) => p.buget },
  { key: 'suprafata', label: 'Suprafață', get: (p) => p.suprafata },
  { key: 'termen', label: 'Termen estimat', get: (p) => (p.data_estimata_finalizare ? Date.parse(p.data_estimata_finalizare) : null) },
]
const PROJECT_GETTERS = Object.fromEntries(PROJECT_SORTS.map((s) => [s.key, s.get])) as Record<string, (p: Project) => SortVal>

const ORDER_GETTERS: Record<string, (o: Order) => SortVal> = {
  client: (o) => o.billing_name || o.email,
  total: (o) => Number(o.total),
  status: (o) => ORDER_STATUSES.indexOf(o.status),
  date: (o) => Date.parse(o.created_at),
}

const PRODUCT_SORTS: { key: string; label: string; get: (p: Product) => SortVal }[] = [
  { key: 'created_at', label: 'Data adăugării', get: (p) => Date.parse(p.created_at) },
  { key: 'nume', label: 'Nume', get: (p) => p.nume },
  { key: 'pret', label: 'Preț', get: (p) => Number(p.pret) },
  { key: 'descarcari', label: 'Descărcări', get: (p) => p.nr_descarcari },
  { key: 'categorie', label: 'Categorie', get: (p) => p.categorie },
]
const PRODUCT_GETTERS = Object.fromEntries(PRODUCT_SORTS.map((s) => [s.key, s.get])) as Record<string, (p: Product) => SortVal>

const CLIENT_GETTERS: Record<string, (c: Profile) => SortVal> = {
  nume: (c) => c.full_name,
  companie: (c) => c.company,
  logare: (c) => c.provider || 'email',
  rol: (c) => c.rol,
  status: (c) => (c.activ ? 0 : 1),
  din: (c) => Date.parse(c.created_at),
}

const DOC_GETTERS: Record<string, (d: DocumentRow) => SortVal> = {
  nume: (d) => d.nume,
  tip: (d) => d.tip,
  marime: (d) => d.marime_bytes,
  data: (d) => Date.parse(d.created_at),
}

/* ============================================================
   COMPONENTE UI
============================================================ */
function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] || '#8b8b93'
  return (
    <span className="bdg" style={{ color: c, borderColor: `${c}55`, background: `${c}14` }}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

function Modal({ title, onClose, children, wide }: { title: React.ReactNode; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="ov" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`mdl${wide ? ' wide' : ''}`} role="dialog" aria-modal="true">
        <div className="mdl-hd">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Închide"><X size={18} /></button>
        </div>
        <div className="mdl-bd">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="fld">
      <span className="fld-l">{label}</span>
      {children}
      {hint && <span className="fld-h">{hint}</span>}
    </label>
  )
}

function Th({ label, k, sort, onSort, firstDir }: { label: string; k: string; sort: SortState; onSort: (k: string, first?: SortDir) => void; firstDir?: SortDir }) {
  const active = sort.key === k
  return (
    <th aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button className={`th-btn${active ? ' on' : ''}`} onClick={() => onSort(k, firstDir)}>
        {label}
        {active ? (sort.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="dim" />}
      </button>
    </th>
  )
}

function pageList(page: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const out: (number | '…')[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(total - 1, page + 1)
  if (start > 2) out.push('…')
  for (let i = start; i <= end; i++) out.push(i)
  if (end < total - 1) out.push('…')
  out.push(total)
  return out
}

function Pagination({
  page, totalPages, total, from, to, pageSize, onPage, onSize, sizes = [10, 25, 50],
}: {
  page: number; totalPages: number; total: number; from: number; to: number; pageSize?: number
  onPage: (p: number) => void; onSize?: (n: number) => void; sizes?: number[]
}) {
  if (total === 0) return null
  return (
    <nav className="pg" aria-label="Paginare">
      <div className="pg-info">{from}–{to} din {total}</div>
      {totalPages > 1 && (
        <div className="pg-ctrl">
          <button className="pg-btn" disabled={page <= 1} onClick={() => onPage(1)} aria-label="Prima pagină"><ChevronsLeft size={14} /></button>
          <button className="pg-btn" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Pagina anterioară"><ChevronLeft size={14} /></button>
          {pageList(page, totalPages).map((p, i) =>
            p === '…' ? (
              <span key={`e${i}`} className="pg-ell">…</span>
            ) : (
              <button key={p} className={`pg-btn${p === page ? ' on' : ''}`} aria-current={p === page ? 'page' : undefined} onClick={() => onPage(p)}>{p}</button>
            )
          )}
          <button className="pg-btn" disabled={page >= totalPages} onClick={() => onPage(page + 1)} aria-label="Pagina următoare"><ChevronRight size={14} /></button>
          <button className="pg-btn" disabled={page >= totalPages} onClick={() => onPage(totalPages)} aria-label="Ultima pagină"><ChevronsRight size={14} /></button>
        </div>
      )}
      {onSize && pageSize && sizes.length > 0 && (
        <label className="pg-size">
          Pe pagină
          <select value={pageSize} onChange={(e) => onSize(Number(e.target.value))}>
            {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      )}
    </nav>
  )
}

function Empty({ text, icon }: { text: string; icon?: React.ReactNode }) {
  return <div className="empty">{icon}<span>{text}</span></div>
}

function SortBar<T extends { key: string; label: string }>({
  options, sort, onChange,
}: { options: T[]; sort: SortState; onChange: (s: SortState) => void }) {
  return (
    <div className="sortbar">
      <label className="sel-wrap">
        <span>Sortează după</span>
        <select value={sort.key} onChange={(e) => onChange({ key: e.target.value, dir: sort.dir })}>
          {options.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
      </label>
      <button
        className="btn sm ghost"
        onClick={() => onChange({ key: sort.key, dir: sort.dir === 'asc' ? 'desc' : 'asc' })}
        aria-label={sort.dir === 'asc' ? 'Ordine crescătoare' : 'Ordine descrescătoare'}
        title={sort.dir === 'asc' ? 'Crescător' : 'Descrescător'}
      >
        {sort.dir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
        {sort.dir === 'asc' ? 'Crescător' : 'Descrescător'}
      </button>
    </div>
  )
}

function PieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return <div className="muted" style={{ padding: 20, textAlign: 'center' }}>Fără date</div>

  let cumulative = 0
  const size = 150
  const cx = size / 2
  const cy = size / 2
  const r = 56
  const ir = 32

  const slices = data.filter((d) => d.value > 0).map((d) => {
    const pct = d.value / total
    const a0 = cumulative * 2 * Math.PI - Math.PI / 2
    cumulative += pct
    const a1 = cumulative * 2 * Math.PI - Math.PI / 2
    const large = pct > 0.5 ? 1 : 0
    const p = (rad: number, a: number) => `${cx + rad * Math.cos(a)} ${cy + rad * Math.sin(a)}`
    // un singur segment de 100% nu poate fi desenat ca arc; îl împărțim
    const path = pct >= 0.9999
      ? `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} Z M ${cx - ir} ${cy} A ${ir} ${ir} 0 1 0 ${cx + ir} ${cy} A ${ir} ${ir} 0 1 0 ${cx - ir} ${cy} Z`
      : `M ${p(ir, a0)} L ${p(r, a0)} A ${r} ${r} 0 ${large} 1 ${p(r, a1)} L ${p(ir, a1)} A ${ir} ${ir} 0 ${large} 0 ${p(ir, a0)} Z`
    return { ...d, pct, path }
  })

  return (
    <div className="pie">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Proiecte per status">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} fillRule="evenodd" stroke="#111113" strokeWidth={2}>
            <title>{s.label}: {s.value}</title>
          </path>
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#f2f2f2" fontSize={20} fontWeight={700}>{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#8b8b93" fontSize={9} letterSpacing="1">TOTAL</text>
      </svg>
      <ul className="legend">
        {slices.map((s, i) => (
          <li key={i}>
            <span className="dot" style={{ background: s.color }} />
            <span>{s.label}</span>
            <b style={{ color: s.color }}>{s.value}</b>
            <em>{(s.pct * 100).toFixed(0)}%</em>
          </li>
        ))}
      </ul>
    </div>
  )
}

function RevenueBars({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const w = 320
  const h = 170
  const pad = 20
  const bw = 32
  const gap = data.length > 1 ? (w - pad * 2 - bw * data.length) / (data.length - 1) : 0
  const compact = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : String(Math.round(v)))
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label="Venituri pe luni">
      {data.map((d, i) => {
        const bh = d.value > 0 ? Math.max(3, Math.round((d.value / max) * (h - 56))) : 0
        const x = pad + i * (bw + gap)
        const y = h - 28 - bh
        return (
          <g key={i}>
            <rect x={x} y={h - 28 - 2} width={bw} height={2} fill="#2e2e32" />
            {bh > 0 && (
              <rect x={x} y={y} width={bw} height={bh} rx={3} fill="#e2b36e" opacity={0.92}>
                <title>{d.label}: {d.value.toLocaleString('ro-RO')} lei</title>
              </rect>
            )}
            {d.value > 0 && <text x={x + bw / 2} y={y - 6} textAnchor="middle" fill="#f2f2f2" fontSize={10}>{compact(d.value)}</text>}
            <text x={x + bw / 2} y={h - 10} textAnchor="middle" fill="#8b8b93" fontSize={10}>{d.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

/* ============================================================
   PAGINA
============================================================ */
export default function AdminDashboardPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imgInputRef = useRef<HTMLInputElement>(null)
  const prodFileInputRef = useRef<HTMLInputElement>(null)
  const chatBoxRef = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(true)
  const [adminName, setAdminName] = useState('')
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [currentAdminId, setCurrentAdminId] = useState('')

  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [activeProjectTab, setActiveProjectTab] = useState<'faze' | 'documente' | 'mesaje'>('faze')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const [projects, setProjects] = useState<Project[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [clients, setClients] = useState<Profile[]>([])
  const [phases, setPhases] = useState<Phase[]>([])
  const [documents, setDocuments] = useState<DocumentRow[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  // formulare / modale
  const [projectForm, setProjectForm] = useState<ProjectDraft | null>(null)
  const [productForm, setProductForm] = useState<ProductDraft | null>(null)
  const [phaseForm, setPhaseForm] = useState<PhaseDraft | null>(null)
  const [clientForm, setClientForm] = useState<Partial<Profile> | null>(null)
  const [notifyTarget, setNotifyTarget] = useState<{ id: string; name: string } | null>(null)
  const [notifyForm, setNotifyForm] = useState({ titlu: '', mesaj: '', link: '' })
  const [previewImg, setPreviewImg] = useState<string | null>(null)
  const [orderDetail, setOrderDetail] = useState<{ order: Order; items: OrderItem[] | null; error?: string } | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)

  // upload documente proiect
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadName, setUploadName] = useState('')
  const [uploadTip, setUploadTip] = useState('altul')
  const [uploadVizibil, setUploadVizibil] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  // upload produs
  const [imgUploading, setImgUploading] = useState(false)
  const [prodFileUploading, setProdFileUploading] = useState(false)

  // filtre
  const [projectFilter, setProjectFilter] = useState('')
  const [projectStatusFilter, setProjectStatusFilter] = useState('toate')
  const [orderFilter, setOrderFilter] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('toate')
  const [productFilter, setProductFilter] = useState('')
  const [productView, setProductView] = useState<'toate' | 'active' | 'inactive' | 'top'>('toate')
  const [clientFilter, setClientFilter] = useState('')
  const [clientRoleFilter, setClientRoleFilter] = useState('toate')

  const [newMessage, setNewMessage] = useState('')

  /* ---------- notificări (toast) + confirmare ---------- */
  const [toasts, setToasts] = useState<{ id: number; kind: ToastKind; text: string }[]>([])
  const toastId = useRef(0)
  const toast = useCallback((kind: ToastKind, text: string) => {
    const id = ++toastId.current
    setToasts((t) => [...t, { id, kind, text }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === 'error' ? 6000 : 3500)
  }, [])

  const [confirmState, setConfirmState] = useState<{ title: string; message: string; label: string; danger: boolean } | null>(null)
  const confirmResolver = useRef<((v: boolean) => void) | null>(null)
  const ask = useCallback(
    (opts: { title: string; message: string; label?: string; danger?: boolean }) =>
      new Promise<boolean>((resolve) => {
        confirmResolver.current = resolve
        setConfirmState({ title: opts.title, message: opts.message, label: opts.label || 'Confirmă', danger: opts.danger ?? true })
      }),
    []
  )
  const answerConfirm = (v: boolean) => {
    confirmResolver.current?.(v)
    confirmResolver.current = null
    setConfirmState(null)
  }

  /** Rulează o operație Supabase; afișează eroarea (dacă e cazul) și întoarce true/false. */
  const mutate = useCallback(
    async (action: () => PromiseLike<{ error: { message: string } | null }>, okMsg?: string) => {
      try {
        const { error } = await action()
        if (error) { toast('error', error.message); return false }
        if (okMsg) toast('success', okMsg)
        return true
      } catch (e) {
        toast('error', errMsg(e))
        return false
      }
    },
    [toast]
  )

  /* ---------- încărcare date ---------- */
  const fetchProjects = useCallback(async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*,profiles_client:profiles!projects_client_id_fkey(full_name),profiles_responsabil:profiles!projects_responsabil_id_fkey(full_name)')
      .order('created_at', { ascending: false })
    if (error) toast('error', 'Proiecte: ' + error.message)
    setProjects((data as Project[]) || [])
  }, [supabase, toast])

  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (error) toast('error', 'Comenzi: ' + error.message)
    setOrders((data as Order[]) || [])
  }, [supabase, toast])

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (error) toast('error', 'Produse: ' + error.message)
    setProducts((data as Product[]) || [])
  }, [supabase, toast])

  const fetchClients = useCallback(async () => {
    // RPC security definer: aduce și provider-ul de login (din auth.users)
    const { data, error } = await supabase.rpc('get_all_profiles_with_provider')
    if (error) {
      const { data: fallback } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      setClients((fallback as Profile[]) || [])
      return
    }
    setClients((data as Profile[]) || [])
  }, [supabase])

  const fetchMessages = useCallback(async (projectId: string) => {
    const { data } = await supabase.from('messages').select('*,profiles(full_name)').eq('project_id', projectId).order('created_at')
    setMessages((data as Message[]) || [])
  }, [supabase])

  const fetchProjectDetails = useCallback(async (projectId: string) => {
    const [{ data: ph }, { data: dc }] = await Promise.all([
      supabase.from('phases').select('*').eq('project_id', projectId).order('ordine'),
      supabase.from('documents').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
    ])
    setPhases((ph as Phase[]) || [])
    setDocuments((dc as DocumentRow[]) || [])
    await fetchMessages(projectId)
  }, [supabase, fetchMessages])

  const fetchAll = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('full_name,rol,id').eq('id', user.id).single()
      if (!profile || (profile.rol !== 'superadmin' && profile.rol !== 'angajat')) { router.push('/dashboard/client'); return }
      setAdminName(profile.full_name || 'Admin')
      setIsSuperAdmin(profile.rol === 'superadmin')
      setCurrentAdminId(profile.id)
      await Promise.all([fetchProjects(), fetchOrders(), fetchProducts(), fetchClients()])
    } finally {
      setLoading(false)
    }
  }, [supabase, router, fetchProjects, fetchOrders, fetchProducts, fetchClients])

  /* ---------- navigare (hash: #proiecte/<id>) ---------- */
  const go = useCallback((tab: TabKey, projectId: string | null = null) => {
    setActiveTab(tab)
    setActiveProjectId(projectId)
    setDrawerOpen(false)
    if (projectId) {
      setActiveProjectTab('faze')
      setMessages([])
      fetchProjectDetails(projectId)
    }
    try {
      history.replaceState(null, '', `#${tab}${projectId ? '/' + projectId : ''}`)
    } catch { /* ignorat */ }
    window.scrollTo({ top: 0 })
  }, [fetchProjectDetails])

  useEffect(() => {
    const [t, id] = window.location.hash.replace('#', '').split('/')
    if (NAV.some((n) => n.key === t)) {
      setActiveTab(t as TabKey)
      if (t === 'proiecte' && id) {
        setActiveProjectId(id)
        fetchProjectDetails(id)
      }
    }
    try {
      setCollapsed(localStorage.getItem('adm-collapsed') === '1')
    } catch { /* ignorat */ }
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try { localStorage.setItem('adm-collapsed', c ? '0' : '1') } catch { /* ignorat */ }
      return !c
    })
  }

  /* ---------- realtime ---------- */
  useEffect(() => {
    if (!activeProjectId) return
    const ch = supabase
      .channel('admin-msg-' + activeProjectId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `project_id=eq.${activeProjectId}` },
        () => fetchMessages(activeProjectId))
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [supabase, activeProjectId, fetchMessages])

  // Comenzi noi / schimbări de status (ex. plăți Stripe confirmate prin webhook).
  // Necesită: alter publication supabase_realtime add table public.orders;
  useEffect(() => {
    const ch = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [supabase, fetchOrders])

  /* ============================================================
     PROIECTE – filtrare, sortare, paginare
  ============================================================ */
  const filteredProjects = useMemo(() => {
    const q = projectFilter.trim().toLowerCase()
    return projects.filter((p) => {
      if (projectStatusFilter !== 'toate' && p.status !== projectStatusFilter) return false
      if (!q) return true
      return (
        p.nume.toLowerCase().includes(q) ||
        (p.profiles_client?.full_name || '').toLowerCase().includes(q) ||
        (p.adresa || '').toLowerCase().includes(q)
      )
    })
  }, [projects, projectFilter, projectStatusFilter])
  const projectSort = useSorted(filteredProjects, PROJECT_GETTERS, { key: 'created_at', dir: 'desc' })
  const projectPg = usePagination(projectSort.sorted, 10, `${projectFilter}|${projectStatusFilter}|${projectSort.sort.key}|${projectSort.sort.dir}`)

  /* COMENZI */
  const filteredOrders = useMemo(() => {
    const q = orderFilter.trim().toLowerCase()
    return orders.filter((o) => {
      if (orderStatusFilter !== 'toate' && o.status !== orderStatusFilter) return false
      if (!q) return true
      return o.email.toLowerCase().includes(q) || (o.billing_name || '').toLowerCase().includes(q) || o.id.toLowerCase().includes(q)
    })
  }, [orders, orderFilter, orderStatusFilter])
  const orderSort = useSorted(filteredOrders, ORDER_GETTERS, { key: 'date', dir: 'desc' })
  const orderPg = usePagination(orderSort.sorted, 10, `${orderFilter}|${orderStatusFilter}|${orderSort.sort.key}|${orderSort.sort.dir}`)

  /* PRODUSE */
  const filteredProducts = useMemo(() => {
    const q = productFilter.trim().toLowerCase()
    return products.filter((p) => {
      if (productView === 'active' && !p.activ) return false
      if (productView === 'inactive' && p.activ) return false
      if (productView === 'top' && !p.featured) return false
      if (!q) return true
      return p.nume.toLowerCase().includes(q) || (p.categorie || '').toLowerCase().includes(q) || (p.tags || []).some((t) => t.toLowerCase().includes(q))
    })
  }, [products, productFilter, productView])
  const productSort = useSorted(filteredProducts, PRODUCT_GETTERS, { key: 'created_at', dir: 'desc' })
  const productPg = usePagination(productSort.sorted, 12, `${productFilter}|${productView}|${productSort.sort.key}|${productSort.sort.dir}`)

  /* UTILIZATORI */
  const filteredClients = useMemo(() => {
    const q = clientFilter.trim().toLowerCase()
    return clients.filter((c) => {
      if (clientRoleFilter !== 'toate' && c.rol !== clientRoleFilter) return false
      if (!q) return true
      return (c.full_name || '').toLowerCase().includes(q) || (c.company || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q)
    })
  }, [clients, clientFilter, clientRoleFilter])
  const clientSort = useSorted(filteredClients, CLIENT_GETTERS, { key: 'din', dir: 'desc' })
  const clientPg = usePagination(clientSort.sorted, 10, `${clientFilter}|${clientRoleFilter}|${clientSort.sort.key}|${clientSort.sort.dir}`)

  /* DETALII PROIECT: faze, documente, mesaje */
  const phasePg = usePagination(phases, 10, activeProjectId || '')
  const docSort = useSorted(documents, DOC_GETTERS, { key: 'data', dir: 'desc' })
  const docPg = usePagination(docSort.sorted, 10, `${activeProjectId}|${docSort.sort.key}|${docSort.sort.dir}`)

  const MSG_PAGE = 15
  const msgPages = Math.max(1, Math.ceil(messages.length / MSG_PAGE))
  const [msgPage, setMsgPage] = useState(1)
  const [msgFollow, setMsgFollow] = useState(true)
  useEffect(() => { setMsgFollow(true) }, [activeProjectId])
  useEffect(() => { if (msgFollow) setMsgPage(msgPages) }, [msgFollow, msgPages, messages.length])
  const safeMsgPage = Math.min(msgPage, msgPages)
  const msgSlice = messages.slice((safeMsgPage - 1) * MSG_PAGE, safeMsgPage * MSG_PAGE)
  useEffect(() => {
    const el = chatBoxRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [msgSlice.length, safeMsgPage, activeProjectTab])

  /* ============================================================
     DERIVATE
  ============================================================ */
  const activeProject = projects.find((p) => p.id === activeProjectId)
  const revenue = useMemo(
    () => orders.filter((o) => o.status === 'paid' || o.status === 'completed').reduce((s, o) => s + Number(o.total), 0),
    [orders]
  )
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const overallProgress = phases.length > 0 ? Math.round(phases.reduce((s, p) => s + p.progres, 0) / phases.length) : 0

  const pieData = PROJECT_STATUSES.map((s) => ({
    label: STATUS_LABELS[s] || s,
    value: projects.filter((p) => p.status === s).length,
    color: STATUS_COLORS[s] || '#555555',
  }))

  const monthlyRevenue = useMemo(() => {
    const now = new Date()
    const months: { key: string; label: string; value: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleDateString('ro-RO', { month: 'short' }),
        value: 0,
      })
    }
    for (const o of orders) {
      if (o.status !== 'paid' && o.status !== 'completed') continue
      const d = new Date(o.created_at)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const m = months.find((x) => x.key === key)
      if (m) m.value += Number(o.total)
    }
    return months
  }, [orders])

  const topProducts = useMemo(() => [...products].sort((a, b) => b.nr_descarcari - a.nr_descarcari).slice(0, 5), [products])

  /* ============================================================
     PROIECTE – CRUD
  ============================================================ */
  const openProjectForm = (p?: Project) => {
    setProjectForm(
      p
        ? {
            id: p.id, nume: p.nume, descriere: p.descriere || '', status: p.status,
            client_id: p.client_id || '', responsabil_id: p.responsabil_id || '', adresa: p.adresa || '',
            suprafata: p.suprafata != null ? String(p.suprafata) : '', buget: p.buget != null ? String(p.buget) : '',
            data_start: p.data_start || '', data_estimata_finalizare: p.data_estimata_finalizare || '',
            data_finalizare: p.data_finalizare || '',
          }
        : { ...emptyProject }
    )
  }

  async function saveProject() {
    if (!projectForm) return
    const f = projectForm
    if (!f.nume.trim()) { toast('error', 'Numele proiectului este obligatoriu.'); return }
    setSaving(true)
    const payload = {
      nume: f.nume.trim(),
      descriere: f.descriere || null,
      status: f.status,
      adresa: f.adresa || null,
      suprafata: f.suprafata ? Number(f.suprafata) : null,
      buget: f.buget ? Number(f.buget) : null,
      client_id: f.client_id || null,
      responsabil_id: f.responsabil_id || null,
      data_start: f.data_start || null,
      data_estimata_finalizare: f.data_estimata_finalizare || null,
      data_finalizare: f.data_finalizare || null,
    }
    const ok = await mutate(
      () => (f.id ? supabase.from('projects').update(payload).eq('id', f.id) : supabase.from('projects').insert([payload])),
      f.id ? 'Proiect actualizat.' : 'Proiect creat.'
    )
    setSaving(false)
    if (!ok) return
    setProjectForm(null)
    fetchProjects()
  }

  async function deleteProject(p: Project) {
    const yes = await ask({ title: 'Ștergi proiectul?', message: `„${p.nume}” și tot ce conține (faze, documente, mesaje) vor fi șterse definitiv.`, label: 'Șterge proiectul' })
    if (!yes) return
    if (await mutate(() => supabase.from('projects').delete().eq('id', p.id), 'Proiect șters.')) {
      if (activeProjectId === p.id) go('proiecte')
      fetchProjects()
    }
  }

  async function updateProjectStatus(id: string, status: string) {
    if (await mutate(() => supabase.from('projects').update({ status }).eq('id', id), 'Status actualizat.')) fetchProjects()
  }

  /* ---------- faze ---------- */
  async function savePhase() {
    if (!phaseForm || !activeProjectId) return
    const f = phaseForm
    if (!f.nume.trim()) { toast('error', 'Numele fazei este obligatoriu.'); return }
    setSaving(true)
    const base = {
      nume: f.nume.trim(),
      descriere: f.descriere || null,
      status: f.status,
      progres: Math.min(100, Math.max(0, Number(f.progres) || 0)),
      data_start: f.data_start || null,
      data_sfarsit: f.data_sfarsit || null,
    }
    const ok = await mutate(
      () => {
        if (f.id) return supabase.from('phases').update(base).eq('id', f.id)
        const ordine = phases.length > 0 ? Math.max(...phases.map((p) => p.ordine)) + 1 : 0
        return supabase.from('phases').insert([{ ...base, project_id: activeProjectId, ordine }])
      },
      f.id ? 'Fază actualizată.' : 'Fază adăugată.'
    )
    setSaving(false)
    if (!ok) return
    setPhaseForm(null)
    fetchProjectDetails(activeProjectId)
  }

  async function deletePhase(ph: Phase) {
    const yes = await ask({ title: 'Ștergi faza?', message: `„${ph.nume}” va fi ștearsă.`, label: 'Șterge' })
    if (!yes || !activeProjectId) return
    if (await mutate(() => supabase.from('phases').delete().eq('id', ph.id), 'Fază ștearsă.')) fetchProjectDetails(activeProjectId)
  }

  async function movePhase(ph: Phase, dir: -1 | 1) {
    if (!activeProjectId) return
    const idx = phases.findIndex((p) => p.id === ph.id)
    const other = phases[idx + dir]
    if (!other) return
    const ok1 = await mutate(() => supabase.from('phases').update({ ordine: other.ordine }).eq('id', ph.id))
    const ok2 = ok1 && (await mutate(() => supabase.from('phases').update({ ordine: ph.ordine }).eq('id', other.id)))
    if (ok2) fetchProjectDetails(activeProjectId)
  }

  /* ---------- documente ---------- */
  function handleFile(f: File) {
    setUploadFile(f)
    if (!uploadName) setUploadName(f.name.replace(/\.[^.]+$/, ''))
    const ext = f.name.split('.').pop()?.toLowerCase() || ''
    if (['dxf', 'dwg'].includes(ext)) setUploadTip(ext)
    else if (ext === 'pdf') setUploadTip('pdf')
    else if (['png', 'jpg', 'jpeg'].includes(ext)) setUploadTip('imagine')
    else if (['doc', 'docx'].includes(ext)) setUploadTip('raport')
    else setUploadTip('altul')
  }

  async function uploadDocument() {
    if (!uploadFile || !activeProjectId) return
    setUploading(true)
    setUploadError('')
    try {
      const safeName = uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `${activeProjectId}/${Date.now()}_${safeName}`
      const { error: storageErr } = await supabase.storage.from('documents').upload(path, uploadFile, { upsert: false })
      if (storageErr) throw new Error(storageErr.message)
      const { data: signed, error: signErr } = await supabase.storage.from('documents').createSignedUrl(path, 60 * 60 * 24 * 365 * 10)
      if (signErr || !signed?.signedUrl) throw new Error('Nu s-a putut genera URL-ul')
      const { error: dbErr } = await supabase.from('documents').insert([{
        project_id: activeProjectId, nume: uploadName || uploadFile.name, tip: uploadTip, url: signed.signedUrl,
        marime_bytes: uploadFile.size, vizibil_client: uploadVizibil, incarcat_de: currentAdminId,
      }])
      if (dbErr) throw new Error(dbErr.message)
      setUploadFile(null); setUploadName(''); setUploadTip('altul'); setUploadVizibil(true); setShowUpload(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      toast('success', 'Document încărcat.')
      fetchProjectDetails(activeProjectId)
    } catch (e) {
      setUploadError(errMsg(e))
    } finally {
      setUploading(false)
    }
  }

  async function deleteDocument(d: DocumentRow) {
    const yes = await ask({ title: 'Ștergi documentul?', message: `„${d.nume}” va fi șters definitiv.`, label: 'Șterge' })
    if (!yes || !activeProjectId) return
    try {
      const m = new URL(d.url).pathname.match(/\/documents\/(.+)/)
      if (m) await supabase.storage.from('documents').remove([decodeURIComponent(m[1])])
    } catch { /* ignorat */ }
    if (await mutate(() => supabase.from('documents').delete().eq('id', d.id), 'Document șters.')) fetchProjectDetails(activeProjectId)
  }

  /* ---------- mesaje ---------- */
  async function sendMessage() {
    const text = newMessage.trim()
    if (!text || !activeProjectId) return
    setNewMessage('')
    const ok = await mutate(() => supabase.from('messages').insert([{ project_id: activeProjectId, sender_id: currentAdminId, mesaj: text }]))
    if (!ok) setNewMessage(text)
    else { setMsgFollow(true); fetchMessages(activeProjectId) }
  }

  /* ============================================================
     PRODUSE – CRUD
  ============================================================ */
  const openProductForm = (p?: Product) => {
    setTagInput('')
    setProductForm(
      p
        ? {
            id: p.id, nume: p.nume, descriere: p.descriere || '', descriere_scurta: p.descriere_scurta || '',
            pret: String(p.pret ?? ''), pret_vechi: p.pret_vechi != null ? String(p.pret_vechi) : '',
            categorie: p.categorie || '', imagine_url: p.imagine_url || '', imagini: p.imagini || [],
            fisier_url: p.fisier_url || '', activ: p.activ, featured: p.featured, tags: p.tags || [],
          }
        : { ...emptyProduct }
    )
  }

  async function saveProduct() {
    if (!productForm) return
    const f = productForm
    if (!f.nume.trim()) { toast('error', 'Numele produsului este obligatoriu.'); return }
    const payload = {
      nume: f.nume.trim(),
      descriere: f.descriere || null,
      descriere_scurta: f.descriere_scurta || null,
      pret: Number(f.pret) || 0,
      pret_vechi: f.pret_vechi ? Number(f.pret_vechi) : null,
      categorie: f.categorie || null,
      imagine_url: f.imagine_url || null,
      imagini: f.imagini.length > 0 ? f.imagini : null,
      fisier_url: f.fisier_url || null,
      activ: f.activ,
      featured: f.featured,
      tags: f.tags.length > 0 ? f.tags : null,
    }
    setSaving(true)
    const ok = await mutate(
      () => (f.id ? supabase.from('products').update(payload).eq('id', f.id) : supabase.from('products').insert([payload])),
      f.id ? 'Produs salvat.' : 'Produs publicat.'
    )
    setSaving(false)
    if (!ok) return
    setProductForm(null)
    fetchProducts()
  }

  async function toggleProduct(id: string, field: 'activ' | 'featured', value: boolean) {
    if (await mutate(() => supabase.from('products').update({ [field]: value }).eq('id', id))) fetchProducts()
  }

  async function deleteProduct(p: Product) {
    const yes = await ask({ title: 'Ștergi produsul?', message: `„${p.nume}” va fi șters din magazin.`, label: 'Șterge produsul' })
    if (!yes) return
    if (await mutate(() => supabase.from('products').delete().eq('id', p.id), 'Produs șters.')) fetchProducts()
  }

  async function duplicateProduct(p: Product) {
    const { id, created_at, nr_descarcari, ...rest } = p
    void id; void created_at; void nr_descarcari
    if (await mutate(() => supabase.from('products').insert([{ ...rest, nume: rest.nume + ' (copie)', activ: false }]), 'Produs duplicat (inactiv).')) fetchProducts()
  }

  async function uploadProductImages(files: FileList | File[]) {
    const arr = Array.from(files)
    if (arr.length === 0) return
    setImgUploading(true)
    try {
      const urls: string[] = []
      for (const file of arr) {
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const path = `products/${Date.now()}_${safe}`
        const { error } = await supabase.storage.from('products').upload(path, file, { upsert: false })
        if (error) throw new Error(error.message)
        urls.push(supabase.storage.from('products').getPublicUrl(path).data.publicUrl)
      }
      setProductForm((prev) => {
        if (!prev) return prev
        const imagini = [...prev.imagini, ...urls]
        return { ...prev, imagini, imagine_url: prev.imagine_url || imagini[0] }
      })
    } catch (e) {
      toast('error', 'Upload imagini: ' + errMsg(e))
    } finally {
      setImgUploading(false)
    }
  }

  const removeProductImage = (url: string) =>
    setProductForm((prev) => {
      if (!prev) return prev
      const imagini = prev.imagini.filter((u) => u !== url)
      return { ...prev, imagini, imagine_url: prev.imagine_url === url ? imagini[0] || '' : prev.imagine_url }
    })

  async function uploadProductFile(file: File) {
    setProdFileUploading(true)
    try {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `files/${Date.now()}_${safe}`
      const { error: upErr } = await supabase.storage.from('product-files').upload(path, file, { upsert: false })
      if (upErr) throw new Error(upErr.message)
      const { data: signed, error: signErr } = await supabase.storage.from('product-files').createSignedUrl(path, 60 * 60 * 24 * 365 * 10)
      if (signErr || !signed?.signedUrl) throw new Error('Nu s-a putut genera URL-ul')
      setProductForm((prev) => (prev ? { ...prev, fisier_url: signed.signedUrl } : prev))
      toast('success', 'Fișier încărcat.')
    } catch (e) {
      toast('error', 'Upload fișier: ' + errMsg(e))
    } finally {
      setProdFileUploading(false)
    }
  }

  const addTag = () => {
    const t = tagInput.trim()
    if (!t) return
    setProductForm((p) => (p && !p.tags.includes(t) ? { ...p, tags: [...p.tags, t] } : p))
    setTagInput('')
  }

  /* ============================================================
     COMENZI
  ============================================================ */
  async function updateOrderStatus(id: string, status: string) {
    if (await mutate(() => supabase.from('orders').update({ status }).eq('id', id), 'Status comandă actualizat.')) fetchOrders()
  }

  async function deleteOrder(o: Order) {
    const yes = await ask({ title: 'Ștergi comanda?', message: `Comanda lui ${o.email} (${fmtMoney(o.total)}) va fi ștearsă. Plata din Stripe NU este rambursată automat.`, label: 'Șterge comanda' })
    if (!yes) return
    if (await mutate(() => supabase.from('orders').delete().eq('id', o.id), 'Comandă ștearsă.')) fetchOrders()
  }

  async function openOrder(o: Order) {
    setOrderDetail({ order: o, items: null })
    const { data, error } = await supabase.from('order_items').select('id,product_id,nume_produs,pret_la_cumparare').eq('order_id', o.id)
    setOrderDetail({ order: o, items: (data as OrderItem[]) || [], error: error?.message })
  }

  function exportCSV() {
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const headers = ['ID', 'Email', 'Nume facturare', 'Total', 'Status', 'Data', 'Stripe']
    const rows = orderSort.sorted.map((o) => [
      o.id, o.email, o.billing_name || '', o.total, o.status,
      new Date(o.created_at).toLocaleDateString('ro-RO'), o.stripe_payment_intent || o.stripe_payment_id || '',
    ])
    const csv = '\uFEFF' + [headers, ...rows].map((r) => r.map(esc).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `comenzi_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast('success', `Export: ${rows.length} comenzi.`)
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast('info', 'Copiat.')
    } catch {
      toast('error', 'Nu am putut copia.')
    }
  }

  /* ============================================================
     UTILIZATORI
  ============================================================ */
  async function toggleClient(id: string, activ: boolean) {
    if (await mutate(() => supabase.from('profiles').update({ activ }).eq('id', id), activ ? 'Utilizator activat.' : 'Utilizator blocat.')) fetchClients()
  }
  async function changeClientRole(id: string, rol: string) {
    if (await mutate(() => supabase.from('profiles').update({ rol }).eq('id', id), 'Rol actualizat.')) fetchClients()
  }
  async function saveClient() {
    if (!clientForm?.id) return
    const { full_name, phone, company } = clientForm
    setSaving(true)
    const ok = await mutate(() => supabase.from('profiles').update({ full_name, phone, company }).eq('id', clientForm.id as string), 'Utilizator actualizat.')
    setSaving(false)
    if (ok) { setClientForm(null); fetchClients() }
  }
  async function deleteClient(id: string, name: string) {
    const label = name || id
    if (!(await ask({ title: 'Ștergi utilizatorul?', message: `„${label}” va fi șters. Proiectele și comenzile asociate pot fi afectate.`, label: 'Continuă' }))) return
    if (!(await ask({ title: 'Confirmare finală', message: `Chiar vrei să ștergi definitiv „${label}”? Acțiunea nu poate fi anulată.`, label: 'Șterge definitiv' }))) return
    if (await mutate(() => supabase.from('profiles').delete().eq('id', id), 'Utilizator șters.')) fetchClients()
  }

  /* ============================================================
     NOTIFICĂRI
  ============================================================ */
  const openNotify = (id: string, name: string) => {
    setNotifyTarget({ id, name })
    setNotifyForm({ titlu: '', mesaj: '', link: '' })
  }
  async function sendNotification() {
    if (!notifyTarget || !notifyForm.titlu.trim()) { toast('error', 'Titlul este obligatoriu.'); return }
    setSaving(true)
    const ok = await mutate(
      () => supabase.from('notifications').insert([{ user_id: notifyTarget.id, titlu: notifyForm.titlu.trim(), mesaj: notifyForm.mesaj || null, link: notifyForm.link || null }]),
      'Notificare trimisă.'
    )
    setSaving(false)
    if (ok) setNotifyTarget(null)
  }

  /* ============================================================
     RENDER
  ============================================================ */
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0b0b0c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e2b36e', fontFamily: 'DM Mono, monospace', fontSize: 12, letterSpacing: '0.2em' }}>
        SE ÎNCARCĂ...
      </div>
    )
  }

  const navCount: Partial<Record<TabKey, number>> = {
    proiecte: projects.length,
    comenzi: orders.length,
    magazin: products.length,
    clienti: clients.length,
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@400;700&display=swap');

        .adm, .adm * { box-sizing: border-box; }
        .adm {
          --bg:#0b0b0c; --panel:#111113; --panel2:#161618; --line:#232326; --line2:#2e2e32;
          --text:#f2f2f2; --muted:#8b8b93; --faint:#5a5a62;
          --gold:#e2b36e; --gold2:#c59653; --green:#34d399; --red:#f87171; --blue:#a5b4fc;
          --sb:248px; --sbc:72px;
          min-height:100vh; background:var(--bg); color:var(--text);
          font-family:'DM Sans',system-ui,sans-serif; font-size:14px; line-height:1.5;
          -webkit-font-smoothing:antialiased;
        }
        .adm button, .adm input, .adm select, .adm textarea { font-family:inherit; font-size:inherit; color:inherit; }
        .adm h1, .adm h2, .adm h3, .adm p { margin:0; }
        .mono { font-family:'DM Mono',monospace; }
        .muted { color:var(--muted); }

        /* --- Sidebar --- */
        .sb { position:fixed; inset:0 auto 0 0; width:var(--sb); background:var(--panel); border-right:1px solid var(--line);
              display:flex; flex-direction:column; z-index:60; transition:width .2s ease, transform .25s ease; }
        .collapsed .sb { width:var(--sbc); }
        .sb-top { display:flex; align-items:center; gap:10px; padding:18px 16px; border-bottom:1px solid var(--line); min-height:68px; }
        .sb-logo { width:36px; height:36px; border-radius:9px; background:linear-gradient(135deg,var(--gold),var(--gold2)); color:#111; font-weight:700;
                   display:flex; align-items:center; justify-content:center; flex:none; font-family:'Playfair Display',serif; }
        .sb-brand { overflow:hidden; white-space:nowrap; }
        .sb-brand b { display:block; font-size:14px; }
        .sb-brand span { font-size:11px; color:var(--muted); }
        .collapsed .sb-brand, .collapsed .nav-lbl, .collapsed .nav-cnt, .collapsed .sb-user-meta, .collapsed .sb-foot .btn-lbl { display:none; }
        .nav { flex:1; padding:14px 10px; display:flex; flex-direction:column; gap:4px; overflow-y:auto; }
        .nav-item { display:flex; align-items:center; gap:12px; padding:11px 12px; border-radius:9px; border:none; background:transparent; color:var(--muted);
                    cursor:pointer; text-align:left; width:100%; text-decoration:none; font-weight:500; position:relative; }
        .nav-item:hover { background:var(--panel2); color:var(--text); }
        .nav-item.on { background:rgba(226,179,110,.1); color:var(--gold); }
        .nav-item.on::before { content:''; position:absolute; left:-10px; top:8px; bottom:8px; width:3px; border-radius:0 3px 3px 0; background:var(--gold); }
        .nav-item svg { flex:none; }
        .nav-lbl { flex:1; white-space:nowrap; }
        .nav-cnt { font-size:11px; padding:2px 8px; border-radius:99px; background:var(--panel2); color:var(--muted); font-family:'DM Mono',monospace; }
        .nav-item.on .nav-cnt { background:rgba(226,179,110,.15); color:var(--gold); }
        .nav-sep { height:1px; background:var(--line); margin:10px 6px; }
        .sb-foot { padding:12px 10px; border-top:1px solid var(--line); display:flex; flex-direction:column; gap:8px; }
        .sb-user { display:flex; align-items:center; gap:10px; padding:6px 6px; }
        .avatar { width:34px; height:34px; border-radius:50%; background:var(--panel2); border:1px solid var(--line2); color:var(--gold);
                  display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px; flex:none; }
        .sb-user-meta { min-width:0; }
        .sb-user-meta b { display:block; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .sb-user-meta span { font-size:10px; color:var(--gold); letter-spacing:.12em; font-family:'DM Mono',monospace; }
        .scrim { display:none; }

        /* --- Main --- */
        .main { margin-left:var(--sb); transition:margin .2s ease; min-width:0; }
        .collapsed .main { margin-left:var(--sbc); }
        .topbar { position:sticky; top:0; z-index:40; display:flex; align-items:center; gap:14px; padding:14px clamp(16px,3vw,40px);
                  background:rgba(11,11,12,.86); backdrop-filter:blur(10px); border-bottom:1px solid var(--line); }
        .topbar h1 { font-size:18px; font-weight:600; flex:1; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .crumbs { font-size:12px; color:var(--muted); display:flex; align-items:center; gap:6px; }
        .menu-btn { display:none; }
        .content { padding:26px clamp(16px,3vw,40px) 80px; max-width:1400px; margin:0 auto; }

        @media (max-width:1023px) {
          .sb { transform:translateX(-100%); width:var(--sb) !important; }
          .sb.open { transform:none; box-shadow:0 0 60px rgba(0,0,0,.6); }
          .main, .collapsed .main { margin-left:0; }
          .menu-btn { display:inline-flex; }
          .scrim.show { display:block; position:fixed; inset:0; background:rgba(0,0,0,.6); z-index:55; }
          .collapsed .sb-brand, .collapsed .nav-lbl, .collapsed .nav-cnt, .collapsed .sb-user-meta, .collapsed .sb-foot .btn-lbl { display:revert; }
          .collapse-btn { display:none !important; }
        }

        /* --- Elemente comune --- */
        .icon-btn { width:34px; height:34px; display:inline-flex; align-items:center; justify-content:center; border-radius:8px; border:1px solid var(--line2);
                    background:var(--panel2); cursor:pointer; color:var(--muted); flex:none; }
        .icon-btn:hover { color:var(--text); border-color:var(--gold); }
        .btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:10px 18px; border-radius:9px; border:1px solid var(--line2);
               background:var(--panel2); color:var(--text); font-weight:600; cursor:pointer; white-space:nowrap; text-decoration:none; }
        .btn:hover:not(:disabled) { border-color:var(--gold); color:var(--gold); }
        .btn:disabled { opacity:.4; cursor:not-allowed; }
        .btn.primary { background:var(--gold); border-color:var(--gold); color:#141414; }
        .btn.primary:hover:not(:disabled) { background:var(--gold2); border-color:var(--gold2); color:#141414; }
        .btn.danger { color:var(--red); border-color:rgba(248,113,113,.4); background:transparent; }
        .btn.danger:hover:not(:disabled) { background:var(--red); color:#111; border-color:var(--red); }
        .btn.ghost { background:transparent; }
        .btn.sm { padding:7px 12px; font-size:12px; border-radius:8px; }
        .btn:focus-visible, .icon-btn:focus-visible, .nav-item:focus-visible, .pg-btn:focus-visible, .th-btn:focus-visible { outline:2px solid var(--gold); outline-offset:2px; }

        .panel { background:var(--panel); border:1px solid var(--line); border-radius:14px; padding:20px; }
        .panel-t { font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); font-weight:600; margin-bottom:16px;
                   display:flex; align-items:center; justify-content:space-between; gap:10px; }
        .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
        .stats { display:grid; grid-template-columns:repeat(auto-fill,minmax(190px,1fr)); gap:14px; margin-bottom:16px; }
        .stat { text-align:left; background:var(--panel); border:1px solid var(--line); border-radius:14px; padding:18px; cursor:pointer; transition:.15s; }
        .stat:hover { border-color:var(--gold); transform:translateY(-1px); }
        .stat-ic { width:34px; height:34px; border-radius:9px; background:rgba(226,179,110,.1); color:var(--gold); display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
        .stat-v { font-size:26px; font-weight:700; letter-spacing:-.01em; }
        .stat-l { font-size:12px; color:var(--muted); margin-top:2px; }
        .stat-n { font-size:11px; color:var(--gold); margin-top:6px; }
        @media (max-width:900px) { .grid-2 { grid-template-columns:1fr; } }

        .toolbar { display:flex; flex-wrap:wrap; align-items:center; gap:10px; margin-bottom:14px; }
        .toolbar .grow { flex:1; }
        .search { position:relative; flex:1 1 240px; max-width:380px; }
        .search svg { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--faint); pointer-events:none; }
        .search input { width:100%; padding:10px 12px 10px 36px; border-radius:9px; border:1px solid var(--line2); background:var(--panel); outline:none; }
        .search input:focus { border-color:var(--gold); }
        .chips { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px; }
        .chip-btn { padding:6px 12px; border-radius:99px; border:1px solid var(--line2); background:transparent; color:var(--muted); cursor:pointer; font-size:12px; font-weight:600; }
        .chip-btn:hover { color:var(--text); border-color:var(--faint); }
        .chip-btn.on { border-color:var(--gold); color:var(--gold); background:rgba(226,179,110,.08); }
        .chip-btn em { font-style:normal; opacity:.6; margin-left:6px; font-family:'DM Mono',monospace; }
        .sortbar { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .sel-wrap { display:inline-flex; align-items:center; gap:8px; font-size:12px; color:var(--muted); }
        .sel-wrap select, .pg-size select, .sel { padding:8px 10px; border-radius:8px; border:1px solid var(--line2); background:var(--panel); outline:none; cursor:pointer; }
        .sel-wrap select:focus, .pg-size select:focus, .sel:focus { border-color:var(--gold); }
        .sel option, .sel-wrap option, .pg-size option, .inp option { background:#161618; }

        .bdg { display:inline-flex; align-items:center; font-size:11px; font-weight:600; padding:3px 10px; border-radius:99px; border:1px solid; white-space:nowrap; }
        .chip { display:inline-flex; align-items:center; gap:6px; font-size:12px; padding:3px 10px; border-radius:7px; background:var(--panel2); border:1px solid var(--line); color:#cfcfd4; }
        .tag { display:inline-flex; align-items:center; gap:4px; font-size:11px; padding:2px 9px; border-radius:99px; background:rgba(226,179,110,.1); color:var(--gold); margin:0 6px 6px 0; }
        .tag button { background:none; border:none; cursor:pointer; color:inherit; opacity:.7; padding:0; line-height:1; }

        .empty { display:flex; flex-direction:column; align-items:center; gap:8px; padding:48px 20px; text-align:center; color:var(--muted);
                 border:1px dashed var(--line2); border-radius:14px; background:var(--panel); }

        /* --- Tabele --- */
        .tbl-wrap { overflow-x:auto; border:1px solid var(--line); border-radius:14px; background:var(--panel); margin-bottom:14px; }
        .tbl { width:100%; border-collapse:collapse; min-width:680px; }
        .tbl th { text-align:left; padding:0; background:var(--panel2); border-bottom:1px solid var(--line); font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); font-weight:600; white-space:nowrap; }
        .tbl th > span { display:block; padding:12px 16px; }
        .th-btn { display:inline-flex; align-items:center; gap:6px; padding:12px 16px; background:none; border:none; cursor:pointer; text-transform:inherit; letter-spacing:inherit; font-weight:inherit; font-size:inherit; color:inherit; }
        .th-btn:hover, .th-btn.on { color:var(--gold); }
        .th-btn .dim { opacity:.4; }
        .tbl td { padding:13px 16px; border-bottom:1px solid var(--line); vertical-align:middle; }
        .tbl tr:last-child td { border-bottom:none; }
        .tbl tbody tr:hover td { background:rgba(255,255,255,.015); }
        .tbl tr.clickable { cursor:pointer; }
        .cell-sub { font-size:12px; color:var(--muted); }
        .acts { display:flex; gap:6px; flex-wrap:wrap; }
        .inline-sel { background:transparent; border:1px solid transparent; border-radius:6px; padding:4px 6px; cursor:pointer; font-weight:600; }
        .inline-sel:hover { border-color:var(--line2); }

        /* --- Paginare --- */
        .pg { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin:6px 0 4px; font-size:12px; color:var(--muted); }
        .pg-ctrl { display:flex; align-items:center; gap:4px; }
        .pg-btn { min-width:32px; height:32px; padding:0 8px; display:inline-flex; align-items:center; justify-content:center; border-radius:8px; border:1px solid var(--line2);
                  background:var(--panel); color:var(--text); cursor:pointer; font-family:'DM Mono',monospace; font-size:12px; }
        .pg-btn:hover:not(:disabled) { border-color:var(--gold); color:var(--gold); }
        .pg-btn.on { background:var(--gold); border-color:var(--gold); color:#111; font-weight:700; }
        .pg-btn:disabled { opacity:.35; cursor:not-allowed; }
        .pg-ell { padding:0 4px; color:var(--faint); }
        .pg-size { display:inline-flex; align-items:center; gap:8px; }

        /* --- Carduri proiect / produs --- */
        .plist { display:flex; flex-direction:column; gap:12px; margin-bottom:14px; }
        .pcard { background:var(--panel); border:1px solid var(--line); border-radius:14px; padding:18px 20px; display:flex; gap:16px; transition:.15s; }
        .pcard:hover { border-color:var(--line2); }
        .pcard-bar { width:4px; border-radius:4px; flex:none; }
        .pcard-body { flex:1; min-width:0; }
        .pcard-top { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-wrap:wrap; }
        .pcard h3 { font-size:16px; font-weight:600; }
        .meta { display:flex; flex-wrap:wrap; gap:6px 14px; font-size:12px; color:var(--muted); margin-top:4px; }
        .chips-row { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }

        .pgrid { display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:16px; margin-bottom:14px; }
        .prod { background:var(--panel); border:1px solid var(--line); border-radius:14px; overflow:hidden; display:flex; flex-direction:column; transition:.15s; }
        .prod:hover { border-color:var(--line2); }
        .prod-img { width:100%; height:150px; object-fit:cover; background:#0e0e10; display:block; cursor:zoom-in; }
        .prod-ph { width:100%; height:150px; background:#0e0e10; display:flex; align-items:center; justify-content:center; color:var(--faint); font-size:12px; cursor:pointer; border-bottom:1px dashed var(--line2); }
        .prod-b { padding:14px 16px 16px; display:flex; flex-direction:column; gap:6px; flex:1; }
        .prod-price { font-size:18px; font-weight:700; color:var(--gold); }
        .prod-price s { font-size:12px; color:var(--faint); font-weight:400; margin-left:8px; }
        .prod-badges { display:flex; gap:4px; flex-wrap:wrap; }
        .pb { font-size:10px; padding:2px 7px; border-radius:5px; border:1px solid; font-weight:600; letter-spacing:.04em; }

        /* --- Faze, sub-taburi, chat --- */
        .subtabs { display:flex; gap:4px; border-bottom:1px solid var(--line); margin-bottom:20px; overflow-x:auto; }
        .subtab { padding:11px 18px; border:none; background:none; color:var(--muted); cursor:pointer; font-weight:600; border-bottom:2px solid transparent; margin-bottom:-1px; white-space:nowrap; }
        .subtab:hover { color:var(--text); }
        .subtab.on { color:var(--gold); border-bottom-color:var(--gold); }
        .prog { height:6px; border-radius:6px; background:var(--line2); overflow:hidden; flex:1; min-width:80px; }
        .prog > i { display:block; height:100%; background:var(--gold); border-radius:6px; transition:width .4s; }
        .phase { background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:16px 18px; margin-bottom:10px; }
        .phase-top { display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:10px; }
        .phase-n { width:26px; height:26px; border-radius:50%; background:var(--panel2); border:1px solid var(--line2); display:flex; align-items:center; justify-content:center; font-size:12px; color:var(--muted); flex:none; }
        .chat { max-height:420px; overflow-y:auto; display:flex; flex-direction:column; gap:10px; padding:16px; background:var(--panel); border:1px solid var(--line); border-radius:14px; margin-bottom:10px; }
        .bubble { max-width:78%; padding:10px 14px; border-radius:14px; font-size:14px; line-height:1.55; white-space:pre-wrap; word-break:break-word; }
        .bubble.me { align-self:flex-end; background:rgba(226,179,110,.14); border:1px solid rgba(226,179,110,.3); border-bottom-right-radius:4px; }
        .bubble.other { align-self:flex-start; background:var(--panel2); border:1px solid var(--line2); border-bottom-left-radius:4px; }
        .bubble small { display:block; margin-top:6px; font-size:11px; color:var(--muted); }
        .compose { display:flex; gap:8px; }
        .compose .inp { margin:0; }

        .upload-zone { border:2px dashed var(--line2); border-radius:12px; padding:32px 16px; text-align:center; color:var(--muted); cursor:pointer; transition:.15s; margin-bottom:14px; }
        .upload-zone:hover, .upload-zone.drag, .upload-zone.has { border-color:var(--gold); color:var(--text); }

        /* --- Formulare --- */
        .fld { display:flex; flex-direction:column; gap:6px; margin-bottom:14px; }
        .fld-l { font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); font-weight:600; }
        .fld-h { font-size:11px; color:var(--faint); }
        .inp { width:100%; padding:11px 13px; border-radius:9px; border:1px solid var(--line2); background:var(--bg); outline:none; margin-bottom:0; }
        .inp:focus { border-color:var(--gold); }
        textarea.inp { resize:vertical; min-height:80px; }
        .row2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        @media (max-width:600px) { .row2 { grid-template-columns:1fr; } }
        .check { display:flex; align-items:center; gap:8px; cursor:pointer; font-size:13px; color:#cfcfd4; margin-bottom:14px; }
        .check input { accent-color:var(--gold); width:16px; height:16px; }
        .gallery { display:grid; grid-template-columns:repeat(auto-fill,minmax(84px,1fr)); gap:8px; margin-bottom:8px; }
        .thumb { position:relative; aspect-ratio:1; border-radius:8px; overflow:hidden; border:2px solid var(--line2); cursor:pointer; }
        .thumb.cover { border-color:var(--gold); }
        .thumb img { width:100%; height:100%; object-fit:cover; display:block; }
        .thumb .x { position:absolute; top:3px; right:3px; width:20px; height:20px; border-radius:50%; background:rgba(0,0,0,.75); color:var(--red); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; }
        .thumb .cv { position:absolute; bottom:0; left:0; right:0; text-align:center; background:var(--gold); color:#111; font-size:9px; font-weight:700; padding:1px 0; }
        .thumb-add { aspect-ratio:1; border-radius:8px; border:2px dashed var(--line2); display:flex; align-items:center; justify-content:center; color:var(--muted); cursor:pointer; background:none; }
        .thumb-add:hover { border-color:var(--gold); color:var(--gold); }
        .file-chip { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:10px 12px; border:1px solid var(--gold); border-radius:9px; background:rgba(226,179,110,.06); color:var(--gold); font-size:13px; margin-bottom:10px; }
        .section-label { font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); font-weight:600; margin:8px 0; }

        /* --- Modale --- */
        .ov { position:fixed; inset:0; background:rgba(0,0,0,.72); backdrop-filter:blur(3px); z-index:200; display:flex; align-items:center; justify-content:center; padding:16px; }
        .mdl { background:var(--panel); border:1px solid var(--line2); border-radius:16px; width:100%; max-width:560px; max-height:92vh; display:flex; flex-direction:column; }
        .mdl.wide { max-width:720px; }
        .mdl-hd { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 22px; border-bottom:1px solid var(--line); }
        .mdl-hd h2 { font-size:17px; font-weight:600; }
        .mdl-bd { padding:22px; overflow-y:auto; }
        .mdl-ft { display:flex; justify-content:flex-end; gap:10px; margin-top:8px; flex-wrap:wrap; }

        /* --- Toast --- */
        .toasts { position:fixed; right:18px; bottom:18px; z-index:400; display:flex; flex-direction:column; gap:10px; max-width:min(380px, calc(100vw - 36px)); }
        .toast { display:flex; gap:10px; align-items:flex-start; padding:12px 14px; border-radius:11px; background:var(--panel2); border:1px solid var(--line2); box-shadow:0 10px 30px rgba(0,0,0,.45); font-size:13px; animation:tin .25s ease both; }
        .toast.success { border-color:rgba(52,211,153,.5); } .toast.success svg { color:var(--green); }
        .toast.error { border-color:rgba(248,113,113,.55); } .toast.error svg { color:var(--red); }
        .toast.info svg { color:var(--gold); }
        .toast svg { flex:none; margin-top:1px; }
        @keyframes tin { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }

        /* --- Grafice --- */
        .pie { display:flex; align-items:center; gap:22px; flex-wrap:wrap; }
        .legend { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px; font-size:13px; }
        .legend li { display:flex; align-items:center; gap:8px; }
        .legend .dot { width:10px; height:10px; border-radius:3px; display:inline-block; }
        .legend em { font-style:normal; color:var(--faint); font-size:11px; }
        .rowline { display:flex; align-items:center; gap:12px; padding:11px 0; border-bottom:1px solid var(--line); }
        .rowline:last-child { border-bottom:none; }
        .rowline.link { cursor:pointer; }
        .rowline.link:hover { background:rgba(255,255,255,.015); }
        .rank { width:26px; font-weight:700; color:var(--faint); font-family:'DM Mono',monospace; }
        .grow-1 { flex:1; min-width:0; }
        .ell { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        @media (prefers-reduced-motion:reduce) { .adm *, .toast { transition:none !important; animation:none !important; } }
        @media (max-width:560px) {
          .pcard { flex-direction:column; gap:10px; } .pcard-bar { width:100%; height:4px; }
          .btn.sm { padding:8px 12px; }
        }
      `}</style>

      {USE_DASH_HEADER && <DashHeader />}

      <div className={`adm${collapsed ? ' collapsed' : ''}`}>
        {/* ======================= SIDEBAR ======================= */}
        <div className={`scrim${drawerOpen ? ' show' : ''}`} onClick={() => setDrawerOpen(false)} aria-hidden="true" />
        <aside className={`sb${drawerOpen ? ' open' : ''}`} aria-label="Navigare principală">
          <div className="sb-top">
            <div className="sb-logo">P4</div>
            <div className="sb-brand">
              <b>PROARH.4D</b>
              <span>Panou administrare</span>
            </div>
          </div>

          <nav className="nav">
            {NAV.map((n) => {
              const Icon = n.icon
              const cnt = navCount[n.key]
              return (
                <button
                  key={n.key}
                  className={`nav-item${activeTab === n.key ? ' on' : ''}`}
                  onClick={() => go(n.key)}
                  aria-current={activeTab === n.key ? 'page' : undefined}
                  title={n.label}
                >
                  <Icon size={18} />
                  <span className="nav-lbl">{n.label}</span>
                  {cnt !== undefined && <span className="nav-cnt">{cnt}</span>}
                </button>
              )
            })}
            <div className="nav-sep" />
            <Link href="/dashboard/admin/proiecte-noi" className="nav-item" title="Publică proiecte noi">
              <PlusSquare size={18} />
              <span className="nav-lbl">Publică proiecte noi</span>
              <ExternalLink size={13} className="nav-cnt" style={{ background: 'none' }} />
            </Link>
          </nav>

          <div className="sb-foot">
            <div className="sb-user">
              <div className="avatar">{initials(adminName)}</div>
              <div className="sb-user-meta">
                <b>{adminName}</b>
                <span>{isSuperAdmin ? 'SUPERADMIN' : 'ANGAJAT'}</span>
              </div>
            </div>
            <button className="btn sm ghost collapse-btn" onClick={toggleCollapsed} title={collapsed ? 'Extinde meniul' : 'Restrânge meniul'} aria-label={collapsed ? 'Extinde meniul' : 'Restrânge meniul'}>
              {collapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
              <span className="btn-lbl">Restrânge</span>
            </button>
            <button className="btn sm danger" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} title="Deconectare">
              <LogOut size={15} />
              <span className="btn-lbl">Deconectare</span>
            </button>
          </div>
        </aside>

        {/* ======================= CONȚINUT ======================= */}
        <div className="main">
          <header className="topbar">
            <button className="icon-btn menu-btn" onClick={() => setDrawerOpen(true)} aria-label="Deschide meniul"><Menu size={18} /></button>
            <div style={{ minWidth: 0, flex: 1 }}>
              {activeTab === 'proiecte' && activeProject ? (
                <div className="crumbs">
                  <button className="btn sm ghost" style={{ padding: '2px 8px' }} onClick={() => go('proiecte')}>Proiecte</button>
                  <ChevronRight size={13} />
                  <span className="ell">{activeProject.nume}</span>
                </div>
              ) : null}
              <h1>{activeTab === 'proiecte' && activeProject ? activeProject.nume : TAB_TITLES[activeTab]}</h1>
            </div>
            <Link href="/" className="btn sm ghost" title="Înapoi pe site"><ArrowRight size={14} /> Home page</Link>
          </header>

          <main className="content">
            {/* ======================= PREZENTARE ======================= */}
            {activeTab === 'overview' && (
              <>
                <div className="stats">
                  <button className="stat" onClick={() => go('proiecte')}>
                    <div className="stat-ic"><Folder size={18} /></div>
                    <div className="stat-v">{projects.length}</div>
                    <div className="stat-l">Proiecte</div>
                  </button>
                  <button className="stat" onClick={() => { setProjectStatusFilter('in_progres'); go('proiecte') }}>
                    <div className="stat-ic"><Folder size={18} /></div>
                    <div className="stat-v">{projects.filter((p) => p.status === 'in_progres').length}</div>
                    <div className="stat-l">Proiecte în progres</div>
                  </button>
                  <button className="stat" onClick={() => go('comenzi')}>
                    <div className="stat-ic"><ShoppingCart size={18} /></div>
                    <div className="stat-v">{orders.length}</div>
                    <div className="stat-l">Comenzi</div>
                    {pendingOrders > 0 && <div className="stat-n">{pendingOrders} în așteptare</div>}
                  </button>
                  <button className="stat" onClick={() => go('comenzi')}>
                    <div className="stat-ic"><ShoppingCart size={18} /></div>
                    <div className="stat-v">{revenue.toLocaleString('ro-RO')} <span style={{ fontSize: 14, color: 'var(--muted)' }}>lei</span></div>
                    <div className="stat-l">Venituri (plătite)</div>
                  </button>
                  <button className="stat" onClick={() => { setProductView('active'); go('magazin') }}>
                    <div className="stat-ic"><Package size={18} /></div>
                    <div className="stat-v">{products.filter((p) => p.activ).length}</div>
                    <div className="stat-l">Produse active</div>
                  </button>
                  <button className="stat" onClick={() => { setClientRoleFilter('client'); go('clienti') }}>
                    <div className="stat-ic"><Users size={18} /></div>
                    <div className="stat-v">{clients.filter((c) => c.rol === 'client').length}</div>
                    <div className="stat-l">Clienți</div>
                  </button>
                </div>

                <div className="grid-2">
                  <section className="panel">
                    <div className="panel-t">Proiecte per status</div>
                    <PieChart data={pieData} />
                  </section>
                  <section className="panel">
                    <div className="panel-t">Venituri ultimele 6 luni</div>
                    <RevenueBars data={monthlyRevenue} />
                  </section>
                </div>

                <div className="grid-2">
                  <section className="panel">
                    <div className="panel-t">
                      Comenzi recente
                      <button className="btn sm ghost" onClick={() => go('comenzi')}>Vezi toate</button>
                    </div>
                    {orders.length === 0 ? <div className="muted">Nicio comandă.</div> : orders.slice(0, 5).map((o) => (
                      <div key={o.id} className="rowline link" onClick={() => { go('comenzi'); openOrder(o) }}>
                        <div className="grow-1">
                          <div className="ell">{o.billing_name || o.email}</div>
                          <div className="cell-sub">{fmt(o.created_at)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: 'var(--gold)', fontWeight: 600 }}>{fmtMoney(o.total)}</div>
                          <StatusBadge status={o.status} />
                        </div>
                      </div>
                    ))}
                  </section>
                  <section className="panel">
                    <div className="panel-t">
                      Proiecte recente
                      <button className="btn sm ghost" onClick={() => go('proiecte')}>Vezi toate</button>
                    </div>
                    {projects.length === 0 ? <div className="muted">Niciun proiect.</div> : projects.slice(0, 5).map((p) => (
                      <div key={p.id} className="rowline link" onClick={() => go('proiecte', p.id)}>
                        <div className="grow-1">
                          <div className="ell">{p.nume}</div>
                          <div className="cell-sub">{p.profiles_client?.full_name || '—'} · {fmt(p.created_at)}</div>
                        </div>
                        <StatusBadge status={p.status} />
                      </div>
                    ))}
                  </section>
                </div>

                <section className="panel">
                  <div className="panel-t">Top produse descărcate</div>
                  {topProducts.length === 0 ? <div className="muted">Fără date.</div> : topProducts.map((p, i) => (
                    <div key={p.id} className="rowline">
                      <span className="rank">#{i + 1}</span>
                      {p.imagine_url && <img src={p.imagine_url} alt="" style={{ width: 44, height: 34, objectFit: 'cover', borderRadius: 6, background: '#0e0e10' }} />}
                      <div className="grow-1">
                        <div className="ell" style={{ fontWeight: 600 }}>{p.nume}</div>
                        <div className="cell-sub">{p.nr_descarcari} descărcări</div>
                      </div>
                      <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{fmtMoney(p.pret)}</span>
                    </div>
                  ))}
                </section>
              </>
            )}

            {/* ======================= PROIECTE – LISTĂ ======================= */}
            {activeTab === 'proiecte' && !activeProjectId && (
              <>
                <div className="toolbar">
                  <div className="search">
                    <Search size={15} />
                    <input placeholder="Caută proiect, client sau adresă..." value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} aria-label="Caută proiecte" />
                  </div>
                  <SortBar options={PROJECT_SORTS} sort={projectSort.sort} onChange={projectSort.setSort} />
                  <div className="grow" />
                  <button className="btn primary" onClick={() => openProjectForm()}><Plus size={16} /> Proiect nou</button>
                </div>

                <div className="chips" role="group" aria-label="Filtrare după status">
                  {['toate', ...PROJECT_STATUSES].map((s) => {
                    const count = s === 'toate' ? projects.length : projects.filter((p) => p.status === s).length
                    return (
                      <button key={s} className={`chip-btn${projectStatusFilter === s ? ' on' : ''}`} onClick={() => setProjectStatusFilter(s)}>
                        {s === 'toate' ? 'Toate' : STATUS_LABELS[s]}<em>{count}</em>
                      </button>
                    )
                  })}
                </div>

                {projectPg.total === 0 ? (
                  <Empty text={projects.length === 0 ? 'Nu există proiecte încă.' : 'Niciun proiect nu corespunde filtrelor.'} icon={<Folder size={26} />} />
                ) : (
                  <div className="plist">
                    {projectPg.slice.map((p) => (
                      <article key={p.id} className="pcard">
                        <div className="pcard-bar" style={{ background: STATUS_COLORS[p.status] || '#555555' }} />
                        <div className="pcard-body">
                          <div className="pcard-top">
                            <div style={{ minWidth: 0 }}>
                              <h3>{p.nume}</h3>
                              <div className="meta">
                                <span>Client: <b style={{ color: '#d4d4d8', fontWeight: 500 }}>{p.profiles_client?.full_name || '—'}</b></span>
                                <span>Responsabil: <b style={{ color: '#d4d4d8', fontWeight: 500 }}>{p.profiles_responsabil?.full_name || '—'}</b></span>
                                <span>{fmt(p.created_at)}</span>
                              </div>
                              {p.adresa && <div className="meta">{p.adresa}</div>}
                            </div>
                            <StatusBadge status={p.status} />
                          </div>
                          <div className="chips-row">
                            {p.suprafata != null && <span className="chip">{p.suprafata} m²</span>}
                            {p.buget != null && <span className="chip">{fmtMoney(p.buget)}</span>}
                            {p.data_estimata_finalizare && <span className="chip">Termen: {fmt(p.data_estimata_finalizare)}</span>}
                          </div>
                          <div className="acts" style={{ marginTop: 14 }}>
                            <button className="btn sm primary" onClick={() => go('proiecte', p.id)}>Detalii <ArrowRight size={13} /></button>
                            <button className="btn sm" onClick={() => openProjectForm(p)}><Pencil size={13} /> Editează</button>
                            <select className="sel" value={p.status} onChange={(e) => updateProjectStatus(p.id, e.target.value)} aria-label="Schimbă statusul">
                              {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                            </select>
                            <button className="btn sm" onClick={() => openNotify(p.client_id!, p.profiles_client?.full_name || 'client')} disabled={!p.client_id}><Bell size={13} /> Notifică</button>
                            {isSuperAdmin && <button className="btn sm danger" onClick={() => deleteProject(p)}><Trash2 size={13} /> Șterge</button>}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
                <Pagination {...projectPg} onPage={projectPg.setPage} onSize={projectPg.setPageSize} sizes={[5, 10, 25, 50]} />
              </>
            )}

            {/* ======================= PROIECT – DETALII ======================= */}
            {activeTab === 'proiecte' && activeProjectId && !activeProject && (
              <Empty text="Proiectul nu a fost găsit (sau se încarcă)." icon={<Folder size={26} />} />
            )}

            {activeTab === 'proiecte' && activeProjectId && activeProject && (
              <>
                <section className="panel" style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <div className="meta" style={{ marginTop: 0 }}>
                        <span>Client: <b style={{ color: '#d4d4d8', fontWeight: 500 }}>{activeProject.profiles_client?.full_name || '—'}</b></span>
                        <span>Responsabil: <b style={{ color: '#d4d4d8', fontWeight: 500 }}>{activeProject.profiles_responsabil?.full_name || '—'}</b></span>
                      </div>
                      <div className="chips-row">
                        {activeProject.adresa && <span className="chip">{activeProject.adresa}</span>}
                        {activeProject.buget != null && <span className="chip">{fmtMoney(activeProject.buget)}</span>}
                        {activeProject.suprafata != null && <span className="chip">{activeProject.suprafata} m²</span>}
                        {activeProject.data_estimata_finalizare && <span className="chip">Termen: {fmt(activeProject.data_estimata_finalizare)}</span>}
                      </div>
                      {activeProject.descriere && <p className="muted" style={{ marginTop: 12, maxWidth: 760 }}>{activeProject.descriere}</p>}
                      {phases.length > 0 && (
                        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, maxWidth: 420 }}>
                          <div className="prog"><i style={{ width: `${overallProgress}%` }} /></div>
                          <span className="mono" style={{ color: 'var(--gold)', fontSize: 12 }}>{overallProgress}%</span>
                        </div>
                      )}
                    </div>
                    <StatusBadge status={activeProject.status} />
                  </div>
                  <div className="acts" style={{ marginTop: 16 }}>
                    <button className="btn sm" onClick={() => openProjectForm(activeProject)}><Pencil size={13} /> Editează</button>
                    <button className="btn sm" onClick={() => openNotify(activeProject.client_id!, activeProject.profiles_client?.full_name || 'client')} disabled={!activeProject.client_id}><Bell size={13} /> Notifică clientul</button>
                    {isSuperAdmin && <button className="btn sm danger" onClick={() => deleteProject(activeProject)}><Trash2 size={13} /> Șterge proiectul</button>}
                  </div>
                </section>

                <div className="subtabs" role="tablist">
                  {([['faze', `Faze (${phases.length})`], ['documente', `Documente (${documents.length})`], ['mesaje', `Mesaje (${messages.length})`]] as const).map(([t, label]) => (
                    <button key={t} role="tab" aria-selected={activeProjectTab === t} className={`subtab${activeProjectTab === t ? ' on' : ''}`} onClick={() => setActiveProjectTab(t)}>{label}</button>
                  ))}
                </div>

                {/* ---- FAZE ---- */}
                {activeProjectTab === 'faze' && (
                  <>
                    <div className="toolbar">
                      <div className="panel-t" style={{ margin: 0 }}>Faze proiect</div>
                      <div className="grow" />
                      <button className="btn primary sm" onClick={() => setPhaseForm({ ...emptyPhase })}><Plus size={14} /> Fază nouă</button>
                    </div>
                    {phasePg.total === 0 ? <Empty text="Nicio fază adăugată." /> : phasePg.slice.map((ph, i) => {
                      const globalIdx = (phasePg.page - 1) * phasePg.pageSize + i
                      return (
                        <div key={ph.id} className="phase">
                          <div className="phase-top">
                            <span className="phase-n">{globalIdx + 1}</span>
                            <b style={{ flex: 1, minWidth: 140 }}>{ph.nume}</b>
                            <StatusBadge status={ph.status} />
                          </div>
                          {ph.descriere && <p className="muted" style={{ marginBottom: 10 }}>{ph.descriere}</p>}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <div className="prog"><i style={{ width: `${ph.progres}%` }} /></div>
                            <span className="mono" style={{ color: 'var(--gold)', fontSize: 12, minWidth: 36 }}>{ph.progres}%</span>
                          </div>
                          {(ph.data_start || ph.data_sfarsit) && (
                            <div className="cell-sub" style={{ display: 'flex', gap: 14 }}>
                              {ph.data_start && <span>Start: {fmt(ph.data_start)}</span>}
                              {ph.data_sfarsit && <span>Sfârșit: {fmt(ph.data_sfarsit)}</span>}
                            </div>
                          )}
                          <div className="acts" style={{ marginTop: 12 }}>
                            <button className="icon-btn" onClick={() => movePhase(ph, -1)} disabled={globalIdx === 0} aria-label="Mută mai sus"><ArrowUp size={14} /></button>
                            <button className="icon-btn" onClick={() => movePhase(ph, 1)} disabled={globalIdx === phases.length - 1} aria-label="Mută mai jos"><ArrowDown size={14} /></button>
                            <button className="btn sm" onClick={() => setPhaseForm({ id: ph.id, nume: ph.nume, descriere: ph.descriere || '', status: ph.status, progres: ph.progres, data_start: ph.data_start || '', data_sfarsit: ph.data_sfarsit || '' })}><Pencil size={13} /> Editează</button>
                            <button className="btn sm danger" onClick={() => deletePhase(ph)}><Trash2 size={13} /> Șterge</button>
                          </div>
                        </div>
                      )
                    })}
                    <Pagination {...phasePg} onPage={phasePg.setPage} onSize={phasePg.setPageSize} sizes={[5, 10, 25]} />
                  </>
                )}

                {/* ---- DOCUMENTE ---- */}
                {activeProjectTab === 'documente' && (
                  <>
                    <div className="toolbar">
                      <div className="panel-t" style={{ margin: 0 }}>Documente</div>
                      <div className="grow" />
                      <button className="btn primary sm" onClick={() => setShowUpload((s) => !s)}><Upload size={14} /> {showUpload ? 'Ascunde încărcarea' : 'Încarcă document'}</button>
                    </div>

                    {showUpload && (
                      <section className="panel" style={{ marginBottom: 16 }}>
                        <div
                          className={`upload-zone${dragOver ? ' drag' : ''}${uploadFile ? ' has' : ''}`}
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                          onDragLeave={() => setDragOver(false)}
                          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                        >
                          {uploadFile ? (
                            <div><b style={{ color: 'var(--gold)' }}>{uploadFile.name}</b><div className="cell-sub">{fmtBytes(uploadFile.size)}</div></div>
                          ) : (
                            <div><Upload size={22} style={{ marginBottom: 8 }} /><div>Click sau trage fișierul aici</div><div className="cell-sub" style={{ marginTop: 4 }}>PDF · DXF · DWG · DOC · XLS · PNG · ZIP · IFC · SKP</div></div>
                          )}
                        </div>
                        <input ref={fileInputRef} type="file" accept={DOC_ACCEPT} style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                        <div className="row2">
                          <Field label="Nume document"><input className="inp" value={uploadName} onChange={(e) => setUploadName(e.target.value)} /></Field>
                          <Field label="Tip">
                            <select className="inp" value={uploadTip} onChange={(e) => setUploadTip(e.target.value)}>
                              {DOC_TIPURI.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </Field>
                        </div>
                        <label className="check"><input type="checkbox" checked={uploadVizibil} onChange={(e) => setUploadVizibil(e.target.checked)} /> Vizibil pentru client</label>
                        {uploadError && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 10 }}>{uploadError}</p>}
                        <div className="mdl-ft" style={{ marginTop: 0 }}>
                          {uploadFile && <button className="btn" onClick={() => { setUploadFile(null); setUploadName(''); if (fileInputRef.current) fileInputRef.current.value = '' }}>Anulează</button>}
                          <button className="btn primary" onClick={uploadDocument} disabled={!uploadFile || uploading}>{uploading ? 'Se încarcă...' : 'Încarcă fișierul'}</button>
                        </div>
                      </section>
                    )}

                    {docPg.total === 0 ? <Empty text="Niciun document încărcat." icon={<FileText size={26} />} /> : (
                      <div className="tbl-wrap">
                        <table className="tbl">
                          <thead>
                            <tr>
                              <Th label="Nume" k="nume" sort={docSort.sort} onSort={docSort.toggle} />
                              <Th label="Tip" k="tip" sort={docSort.sort} onSort={docSort.toggle} />
                              <Th label="Mărime" k="marime" sort={docSort.sort} onSort={docSort.toggle} />
                              <th><span>Vizibil</span></th>
                              <Th label="Data" k="data" sort={docSort.sort} onSort={docSort.toggle} firstDir="desc" />
                              <th><span /></th>
                            </tr>
                          </thead>
                          <tbody>
                            {docPg.slice.map((d) => (
                              <tr key={d.id}>
                                <td><a href={d.url} target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>{d.nume} <ExternalLink size={12} style={{ verticalAlign: '-1px' }} /></a></td>
                                <td><span className="chip">{d.tip}</span></td>
                                <td className="muted">{fmtBytes(d.marime_bytes)}</td>
                                <td style={{ color: d.vizibil_client ? 'var(--green)' : 'var(--faint)' }}>{d.vizibil_client ? 'Da' : 'Nu'}</td>
                                <td className="muted">{fmt(d.created_at)}</td>
                                <td><button className="btn sm danger" onClick={() => deleteDocument(d)} aria-label={`Șterge ${d.nume}`}><Trash2 size={13} /></button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <Pagination {...docPg} onPage={docPg.setPage} onSize={docPg.setPageSize} sizes={[5, 10, 25]} />
                  </>
                )}

                {/* ---- MESAJE ---- */}
                {activeProjectTab === 'mesaje' && (
                  <>
                    <div className="chat" ref={chatBoxRef} role="log" aria-live="polite">
                      {messages.length === 0 ? <div className="muted" style={{ textAlign: 'center', padding: 30 }}>Niciun mesaj.</div> : msgSlice.map((m) => {
                        const mine = m.sender_id === currentAdminId
                        return (
                          <div key={m.id} className={`bubble ${mine ? 'me' : 'other'}`}>
                            {m.mesaj}
                            <small>{m.profiles?.full_name || 'Anonim'} · {new Date(m.created_at).toLocaleString('ro-RO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</small>
                          </div>
                        )
                      })}
                    </div>
                    <Pagination
                      page={safeMsgPage}
                      totalPages={msgPages}
                      total={messages.length}
                      from={messages.length === 0 ? 0 : (safeMsgPage - 1) * MSG_PAGE + 1}
                      to={Math.min(safeMsgPage * MSG_PAGE, messages.length)}
                      onPage={(p) => { setMsgPage(p); setMsgFollow(p === msgPages) }}
                    />
                    <div className="compose" style={{ marginTop: 10 }}>
                      <input className="inp" placeholder="Scrie un mesaj..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) sendMessage() }} aria-label="Mesaj nou" />
                      <button className="btn primary" onClick={sendMessage} disabled={!newMessage.trim()}><Send size={15} /> Trimite</button>
                    </div>
                  </>
                )}
              </>
            )}

            {/* ======================= COMENZI ======================= */}
            {activeTab === 'comenzi' && (
              <>
                <div className="toolbar">
                  <div className="search">
                    <Search size={15} />
                    <input placeholder="Caută după e-mail, nume sau ID..." value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)} aria-label="Caută comenzi" />
                  </div>
                  <select className="sel" value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)} aria-label="Filtrează după status">
                    <option value="toate">Toate statusurile</option>
                    {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                  <div className="grow" />
                  <button className="btn sm" onClick={exportCSV} disabled={orderSort.sorted.length === 0}><Download size={14} /> Export CSV ({orderSort.sorted.length})</button>
                </div>

                {orderPg.total === 0 ? <Empty text={orders.length === 0 ? 'Nicio comandă încă.' : 'Nicio comandă nu corespunde filtrelor.'} icon={<ShoppingCart size={26} />} /> : (
                  <div className="tbl-wrap">
                    <table className="tbl">
                      <thead>
                        <tr>
                          <Th label="Client" k="client" sort={orderSort.sort} onSort={orderSort.toggle} />
                          <Th label="Total" k="total" sort={orderSort.sort} onSort={orderSort.toggle} firstDir="desc" />
                          <Th label="Status" k="status" sort={orderSort.sort} onSort={orderSort.toggle} />
                          <Th label="Data" k="date" sort={orderSort.sort} onSort={orderSort.toggle} firstDir="desc" />
                          <th><span>Stripe</span></th>
                          <th><span>Acțiuni</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderPg.slice.map((o) => {
                          const stripeId = o.stripe_payment_intent || o.stripe_payment_id
                          return (
                            <tr key={o.id} className="clickable" onClick={() => openOrder(o)}>
                              <td>
                                <div style={{ fontWeight: 600 }}>{o.billing_name || o.email}</div>
                                {o.billing_name && <div className="cell-sub">{o.email}</div>}
                              </td>
                              <td style={{ color: 'var(--gold)', fontWeight: 600 }}>{fmtMoney(o.total)}</td>
                              <td onClick={(e) => e.stopPropagation()}>
                                <select className="inline-sel" style={{ color: STATUS_COLORS[o.status] || '#8b8b93' }} value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)} aria-label="Status comandă">
                                  {!ORDER_STATUSES.includes(o.status) && <option value={o.status}>{STATUS_LABELS[o.status] || o.status}</option>}
                                  {ORDER_STATUSES.map((s) => <option key={s} value={s} style={{ color: '#f2f2f2' }}>{STATUS_LABELS[s]}</option>)}
                                </select>
                              </td>
                              <td className="muted">{fmt(o.created_at)}</td>
                              <td onClick={(e) => e.stopPropagation()}>
                                {stripeId ? (
                                  <button className="btn sm ghost mono" onClick={() => copyText(stripeId)} title={`${stripeId} (click pentru copiere)`}>
                                    <Copy size={12} /> {stripeId.slice(0, 12)}…
                                  </button>
                                ) : <span className="muted">—</span>}
                              </td>
                              <td onClick={(e) => e.stopPropagation()}>
                                <div className="acts">
                                  {o.user_id && <button className="btn sm" onClick={() => openNotify(o.user_id!, o.billing_name || o.email)} aria-label="Notifică"><Bell size={13} /></button>}
                                  {isSuperAdmin && <button className="btn sm danger" onClick={() => deleteOrder(o)} aria-label="Șterge comanda"><Trash2 size={13} /></button>}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                <Pagination {...orderPg} onPage={orderPg.setPage} onSize={orderPg.setPageSize} />
              </>
            )}

            {/* ======================= MAGAZIN ======================= */}
            {activeTab === 'magazin' && (
              <>
                <div className="toolbar">
                  <div className="search">
                    <Search size={15} />
                    <input placeholder="Caută produs, categorie sau tag..." value={productFilter} onChange={(e) => setProductFilter(e.target.value)} aria-label="Caută produse" />
                  </div>
                  <SortBar options={PRODUCT_SORTS} sort={productSort.sort} onChange={productSort.setSort} />
                  <div className="grow" />
                  <button className="btn primary" onClick={() => openProductForm()}><Plus size={16} /> Produs nou</button>
                </div>

                <div className="chips" role="group" aria-label="Filtrare produse">
                  {([['toate', 'Toate', products.length], ['active', 'Active', products.filter((p) => p.activ).length], ['inactive', 'Inactive', products.filter((p) => !p.activ).length], ['top', 'Top', products.filter((p) => p.featured).length]] as const).map(([k, l, n]) => (
                    <button key={k} className={`chip-btn${productView === k ? ' on' : ''}`} onClick={() => setProductView(k)}>{l}<em>{n}</em></button>
                  ))}
                </div>

                {productPg.total === 0 ? <Empty text={products.length === 0 ? 'Niciun produs încă.' : 'Niciun produs nu corespunde filtrelor.'} icon={<Package size={26} />} /> : (
                  <div className="pgrid">
                    {productPg.slice.map((p) => (
                      <article key={p.id} className="prod">
                        {p.imagine_url
                          ? <img src={p.imagine_url} alt={p.nume} className="prod-img" onClick={() => setPreviewImg(p.imagine_url)} />
                          : <div className="prod-ph" onClick={() => openProductForm(p)}>+ Adaugă imagine</div>}
                        <div className="prod-b">
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                            <b style={{ flex: 1 }}>{p.nume}</b>
                            <div className="prod-badges">
                              {p.activ && <span className="pb" style={{ color: 'var(--green)', borderColor: 'rgba(52,211,153,.5)' }}>ACTIV</span>}
                              {p.featured && <span className="pb" style={{ color: 'var(--gold)', borderColor: 'rgba(226,179,110,.5)' }}>TOP</span>}
                              {p.fisier_url && <span className="pb" style={{ color: 'var(--blue)', borderColor: 'rgba(165,180,252,.5)' }}>FIȘIER</span>}
                            </div>
                          </div>
                          <div className="cell-sub">{p.categorie || 'Fără categorie'}</div>
                          <div className="prod-price">{Number(p.pret) === 0 ? 'Gratuit' : fmtMoney(p.pret)}{p.pret_vechi != null && <s>{fmtMoney(p.pret_vechi)}</s>}</div>
                          {p.tags && p.tags.length > 0 && <div>{p.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>}
                          <div className="cell-sub">{p.nr_descarcari} descărcări{p.imagini && p.imagini.length > 0 ? ` · ${p.imagini.length} poze` : ''}{Number(p.pret) > 0 && !p.fisier_url ? ' · ⚠ fără fișier' : ''}</div>
                          <div className="acts" style={{ marginTop: 'auto', paddingTop: 10 }}>
                            <button className="btn sm" onClick={() => openProductForm(p)}><Pencil size={13} /> Editează</button>
                            <button className="btn sm" style={{ color: p.activ ? 'var(--green)' : 'var(--muted)' }} onClick={() => toggleProduct(p.id, 'activ', !p.activ)}>{p.activ ? 'Activ' : 'Inactiv'}</button>
                            <button className="icon-btn" style={{ color: p.featured ? 'var(--gold)' : undefined }} onClick={() => toggleProduct(p.id, 'featured', !p.featured)} aria-label={p.featured ? 'Scoate din Top' : 'Marchează Top'} aria-pressed={p.featured}><Star size={14} fill={p.featured ? 'currentColor' : 'none'} /></button>
                            <button className="icon-btn" onClick={() => duplicateProduct(p)} aria-label="Duplică"><Copy size={14} /></button>
                            {isSuperAdmin && <button className="icon-btn" style={{ color: 'var(--red)' }} onClick={() => deleteProduct(p)} aria-label="Șterge produsul"><Trash2 size={14} /></button>}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
                <Pagination {...productPg} onPage={productPg.setPage} onSize={productPg.setPageSize} sizes={[8, 12, 24, 48]} />
              </>
            )}

            {/* ======================= UTILIZATORI ======================= */}
            {activeTab === 'clienti' && (
              <>
                <div className="toolbar">
                  <div className="search">
                    <Search size={15} />
                    <input placeholder="Caută după nume, companie sau e-mail..." value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} aria-label="Caută utilizatori" />
                  </div>
                  <div className="grow" />
                </div>
                <div className="chips" role="group" aria-label="Filtrare după rol">
                  {['toate', 'client', 'angajat', 'superadmin'].map((r) => (
                    <button key={r} className={`chip-btn${clientRoleFilter === r ? ' on' : ''}`} onClick={() => setClientRoleFilter(r)}>
                      {r === 'toate' ? 'Toți' : r}<em>{r === 'toate' ? clients.length : clients.filter((c) => c.rol === r).length}</em>
                    </button>
                  ))}
                </div>

                {clientPg.total === 0 ? <Empty text="Niciun utilizator nu corespunde filtrelor." icon={<Users size={26} />} /> : (
                  <div className="tbl-wrap">
                    <table className="tbl" style={{ minWidth: 860 }}>
                      <thead>
                        <tr>
                          <Th label="Nume" k="nume" sort={clientSort.sort} onSort={clientSort.toggle} />
                          <Th label="Companie" k="companie" sort={clientSort.sort} onSort={clientSort.toggle} />
                          <th><span>Telefon</span></th>
                          <Th label="Logare" k="logare" sort={clientSort.sort} onSort={clientSort.toggle} />
                          <Th label="Rol" k="rol" sort={clientSort.sort} onSort={clientSort.toggle} />
                          <Th label="Status" k="status" sort={clientSort.sort} onSort={clientSort.toggle} />
                          <Th label="Din" k="din" sort={clientSort.sort} onSort={clientSort.toggle} firstDir="desc" />
                          <th><span>Acțiuni</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientPg.slice.map((c) => (
                          <tr key={c.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{initials(c.full_name || '?')}</span>
                                <div>
                                  <div style={{ fontWeight: 600 }}>{c.full_name || '—'}</div>
                                  {c.email && <div className="cell-sub">{c.email}</div>}
                                </div>
                              </div>
                            </td>
                            <td className="muted">{c.company || '—'}</td>
                            <td className="muted">{c.phone || '—'}</td>
                            <td><span className="bdg" style={{ color: providerColor(c.provider), borderColor: `${providerColor(c.provider)}55`, background: `${providerColor(c.provider)}14` }}>{providerLabel(c.provider)}</span></td>
                            <td>
                              {isSuperAdmin ? (
                                <select className="inline-sel" value={c.rol} onChange={(e) => changeClientRole(c.id, e.target.value)} aria-label="Rol utilizator">
                                  {['client', 'angajat', 'superadmin'].map((r) => <option key={r} value={r}>{r}</option>)}
                                </select>
                              ) : <span className="chip">{c.rol}</span>}
                            </td>
                            <td style={{ color: c.activ ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>{c.activ ? 'Activ' : 'Blocat'}</td>
                            <td className="muted">{fmt(c.created_at)}</td>
                            <td>
                              <div className="acts">
                                {isSuperAdmin && <button className="btn sm" onClick={() => setClientForm({ ...c })} aria-label="Editează"><Pencil size={13} /></button>}
                                <button className="btn sm" onClick={() => openNotify(c.id, c.full_name || c.id)} aria-label="Notifică"><Bell size={13} /></button>
                                {isSuperAdmin && <button className="btn sm" style={{ color: c.activ ? 'var(--red)' : 'var(--green)' }} onClick={() => toggleClient(c.id, !c.activ)}>{c.activ ? 'Blochează' : 'Activează'}</button>}
                                {isSuperAdmin && <button className="btn sm danger" onClick={() => deleteClient(c.id, c.full_name || '')} aria-label="Șterge"><Trash2 size={13} /></button>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <Pagination {...clientPg} onPage={clientPg.setPage} onSize={clientPg.setPageSize} />
              </>
            )}
          </main>
        </div>

      {/* ======================= MODALE ======================= */}

      {/* Previzualizare imagine */}
      {previewImg && (
        <div className="ov" style={{ zIndex: 300 }} onClick={() => setPreviewImg(null)}>
          <div style={{ position: 'relative' }}>
            <img src={previewImg} alt="previzualizare" style={{ maxWidth: '92vw', maxHeight: '86vh', objectFit: 'contain', display: 'block', borderRadius: 10 }} />
            <button className="icon-btn" style={{ position: 'absolute', top: -14, right: -14, background: 'var(--gold)', color: '#111' }} onClick={() => setPreviewImg(null)} aria-label="Închide"><X size={16} /></button>
          </div>
        </div>
      )}

      {/* Proiect (nou / editare) */}
      {projectForm && (
        <Modal title={projectForm.id ? 'Editează proiect' : 'Proiect nou'} onClose={() => setProjectForm(null)}>
          <Field label="Nume proiect *"><input className="inp" value={projectForm.nume} onChange={(e) => setProjectForm({ ...projectForm, nume: e.target.value })} autoFocus /></Field>
          <Field label="Descriere"><textarea className="inp" value={projectForm.descriere} onChange={(e) => setProjectForm({ ...projectForm, descriere: e.target.value })} /></Field>
          <Field label="Adresă"><input className="inp" value={projectForm.adresa} onChange={(e) => setProjectForm({ ...projectForm, adresa: e.target.value })} /></Field>
          <div className="row2">
            <Field label="Suprafață (m²)"><input className="inp" type="number" value={projectForm.suprafata} onChange={(e) => setProjectForm({ ...projectForm, suprafata: e.target.value })} /></Field>
            <Field label="Buget (lei)"><input className="inp" type="number" value={projectForm.buget} onChange={(e) => setProjectForm({ ...projectForm, buget: e.target.value })} /></Field>
          </div>
          <div className="row2">
            <Field label="Data start"><input className="inp" type="date" value={projectForm.data_start} onChange={(e) => setProjectForm({ ...projectForm, data_start: e.target.value })} /></Field>
            <Field label="Termen estimat"><input className="inp" type="date" value={projectForm.data_estimata_finalizare} onChange={(e) => setProjectForm({ ...projectForm, data_estimata_finalizare: e.target.value })} /></Field>
          </div>
          {projectForm.id && <Field label="Data finalizare"><input className="inp" type="date" value={projectForm.data_finalizare} onChange={(e) => setProjectForm({ ...projectForm, data_finalizare: e.target.value })} /></Field>}
          <div className="row2">
            <Field label="Client">
              <select className="inp" value={projectForm.client_id} onChange={(e) => setProjectForm({ ...projectForm, client_id: e.target.value })}>
                <option value="">— Selectează —</option>
                {clients.filter((c) => c.rol === 'client').map((c) => <option key={c.id} value={c.id}>{c.full_name || c.email || c.id}</option>)}
              </select>
            </Field>
            <Field label="Responsabil">
              <select className="inp" value={projectForm.responsabil_id} onChange={(e) => setProjectForm({ ...projectForm, responsabil_id: e.target.value })}>
                <option value="">— Selectează —</option>
                {clients.filter((c) => c.rol === 'angajat' || c.rol === 'superadmin').map((c) => <option key={c.id} value={c.id}>{c.full_name || c.email || c.id}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Status">
            <select className="inp" value={projectForm.status} onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}>
              {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </Field>
          <div className="mdl-ft">
            <button className="btn" onClick={() => setProjectForm(null)}>Anulează</button>
            <button className="btn primary" onClick={saveProject} disabled={saving}>{saving ? 'Se salvează...' : projectForm.id ? 'Salvează' : 'Creează proiect'}</button>
          </div>
        </Modal>
      )}

      {/* Fază (nouă / editare) */}
      {phaseForm && (
        <Modal title={phaseForm.id ? 'Editează fază' : 'Fază nouă'} onClose={() => setPhaseForm(null)}>
          <Field label="Nume fază *"><input className="inp" value={phaseForm.nume} onChange={(e) => setPhaseForm({ ...phaseForm, nume: e.target.value })} autoFocus /></Field>
          <Field label="Descriere"><textarea className="inp" value={phaseForm.descriere} onChange={(e) => setPhaseForm({ ...phaseForm, descriere: e.target.value })} /></Field>
          <div className="row2">
            <Field label="Status">
              <select className="inp" value={phaseForm.status} onChange={(e) => setPhaseForm({ ...phaseForm, status: e.target.value })}>
                {PHASE_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </Field>
            <Field label={`Progres: ${phaseForm.progres}%`}>
              <input type="range" min={0} max={100} step={5} value={phaseForm.progres} onChange={(e) => setPhaseForm({ ...phaseForm, progres: Number(e.target.value) })} style={{ accentColor: '#e2b36e', width: '100%', marginTop: 10 }} />
            </Field>
          </div>
          <div className="row2">
            <Field label="Data start"><input className="inp" type="date" value={phaseForm.data_start} onChange={(e) => setPhaseForm({ ...phaseForm, data_start: e.target.value })} /></Field>
            <Field label="Data sfârșit"><input className="inp" type="date" value={phaseForm.data_sfarsit} onChange={(e) => setPhaseForm({ ...phaseForm, data_sfarsit: e.target.value })} /></Field>
          </div>
          <div className="mdl-ft">
            <button className="btn" onClick={() => setPhaseForm(null)}>Anulează</button>
            <button className="btn primary" onClick={savePhase} disabled={saving}>{saving ? 'Se salvează...' : phaseForm.id ? 'Salvează' : 'Adaugă'}</button>
          </div>
        </Modal>
      )}

      {/* Produs (nou / editare) */}
      {productForm && (
        <Modal title={productForm.id ? 'Editează produs' : 'Produs nou'} onClose={() => setProductForm(null)} wide>
          <div className="section-label">Poze produs</div>
          <div className="gallery">
            {productForm.imagini.map((url) => (
              <div key={url} className={`thumb${productForm.imagine_url === url ? ' cover' : ''}`} onClick={() => setProductForm({ ...productForm, imagine_url: url })} title="Click pentru a seta ca poză principală">
                <img src={url} alt="" />
                <button className="x" onClick={(e) => { e.stopPropagation(); removeProductImage(url) }} aria-label="Elimină poza"><X size={12} /></button>
                {productForm.imagine_url === url && <span className="cv">PRINCIPALĂ</span>}
              </div>
            ))}
            <button className="thumb-add" onClick={() => imgInputRef.current?.click()} aria-label="Adaugă poze">{imgUploading ? '…' : <Plus size={20} />}</button>
          </div>
          <input ref={imgInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => { if (e.target.files) uploadProductImages(e.target.files); e.target.value = '' }} />
          <p className="fld-h" style={{ marginBottom: 16 }}>Poți încărca mai multe poze deodată. Click pe o poză o setează ca principală.</p>

          <Field label="Nume produs *"><input className="inp" value={productForm.nume} onChange={(e) => setProductForm({ ...productForm, nume: e.target.value })} /></Field>
          <Field label="Descriere scurtă"><input className="inp" value={productForm.descriere_scurta} onChange={(e) => setProductForm({ ...productForm, descriere_scurta: e.target.value })} /></Field>
          <Field label="Descriere completă"><textarea className="inp" value={productForm.descriere} onChange={(e) => setProductForm({ ...productForm, descriere: e.target.value })} /></Field>
          <div className="row2">
            <Field label="Preț (lei) *" hint="0 = produs gratuit"><input className="inp" type="number" min={0} step="0.01" value={productForm.pret} onChange={(e) => setProductForm({ ...productForm, pret: e.target.value })} /></Field>
            <Field label="Preț vechi (lei)"><input className="inp" type="number" min={0} step="0.01" value={productForm.pret_vechi} onChange={(e) => setProductForm({ ...productForm, pret_vechi: e.target.value })} /></Field>
          </div>
          <Field label="Categorie"><input className="inp" value={productForm.categorie} onChange={(e) => setProductForm({ ...productForm, categorie: e.target.value })} /></Field>

          <div className="section-label">Fișier de descărcat (produs digital)</div>
          {productForm.fisier_url ? (
            <div className="file-chip">
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}><Paperclip size={14} /><span className="ell">{fileNameFromUrl(productForm.fisier_url) || 'fișier încărcat'}</span></span>
              <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <a href={productForm.fisier_url} target="_blank" rel="noreferrer" style={{ color: 'var(--gold)' }}>Vezi</a>
                <button className="icon-btn" style={{ width: 26, height: 26, color: 'var(--red)' }} onClick={() => setProductForm({ ...productForm, fisier_url: '' })} aria-label="Elimină fișierul"><X size={13} /></button>
              </span>
            </div>
          ) : (
            <div className="upload-zone" style={{ padding: 18 }} onClick={() => prodFileInputRef.current?.click()}>
              {prodFileUploading ? 'Se încarcă...' : 'Click pentru a încărca fișierul · PDF, DWG, DXF, ZIP...'}
            </div>
          )}
          <input ref={prodFileInputRef} type="file" accept={PRODUCT_FILE_ACCEPT} style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadProductFile(f); e.target.value = '' }} />
          <Field label="...sau URL manual"><input className="inp" value={productForm.fisier_url} onChange={(e) => setProductForm({ ...productForm, fisier_url: e.target.value })} /></Field>

          <div className="section-label">Tag-uri</div>
          <div>{productForm.tags.map((t) => (
            <span key={t} className="tag">{t}<button onClick={() => setProductForm({ ...productForm, tags: productForm.tags.filter((x) => x !== t) })} aria-label={`Elimină ${t}`}><X size={11} /></button></span>
          ))}</div>
          <div className="compose" style={{ marginBottom: 14 }}>
            <input className="inp" placeholder="Adaugă tag și apasă Enter..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} />
            <button className="btn" onClick={addTag}><Plus size={14} /></button>
          </div>

          <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
            <label className="check"><input type="checkbox" checked={productForm.activ} onChange={(e) => setProductForm({ ...productForm, activ: e.target.checked })} /> Activ în magazin</label>
            <label className="check"><input type="checkbox" checked={productForm.featured} onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })} /> Marcat Top</label>
          </div>
          {Number(productForm.pret) > 0 && !productForm.fisier_url && (
            <p style={{ color: 'var(--gold)', fontSize: 12, marginBottom: 12 }}>⚠ Produs plătit fără fișier: clientul nu va avea ce descărca după plată.</p>
          )}

          <div className="mdl-ft">
            <button className="btn" onClick={() => setProductForm(null)}>Anulează</button>
            <button className="btn primary" onClick={saveProduct} disabled={saving}>{saving ? 'Se salvează...' : productForm.id ? 'Salvează' : 'Publică produsul'}</button>
          </div>
        </Modal>
      )}

      {/* Utilizator (editare) */}
      {clientForm && (
        <Modal title={<>Editează {clientForm.full_name || 'utilizator'}</>} onClose={() => setClientForm(null)}>
          {clientForm.provider && (
            <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span className="bdg" style={{ color: providerColor(clientForm.provider), borderColor: `${providerColor(clientForm.provider)}55`, background: `${providerColor(clientForm.provider)}14` }}>Logat prin {providerLabel(clientForm.provider)}</span>
              {clientForm.email && <span className="muted">{clientForm.email}</span>}
            </div>
          )}
          <Field label="Nume complet"><input className="inp" value={clientForm.full_name || ''} onChange={(e) => setClientForm({ ...clientForm, full_name: e.target.value })} /></Field>
          <Field label="Telefon"><input className="inp" value={clientForm.phone || ''} onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })} /></Field>
          <Field label="Companie"><input className="inp" value={clientForm.company || ''} onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })} /></Field>
          <div className="mdl-ft">
            <button className="btn" onClick={() => setClientForm(null)}>Anulează</button>
            <button className="btn primary" onClick={saveClient} disabled={saving}>{saving ? 'Se salvează...' : 'Salvează'}</button>
          </div>
        </Modal>
      )}

      {/* Notificare */}
      {notifyTarget && (
        <Modal title={<>Notificare → {notifyTarget.name}</>} onClose={() => setNotifyTarget(null)}>
          <Field label="Titlu *"><input className="inp" value={notifyForm.titlu} onChange={(e) => setNotifyForm({ ...notifyForm, titlu: e.target.value })} autoFocus /></Field>
          <Field label="Mesaj (opțional)"><textarea className="inp" value={notifyForm.mesaj} onChange={(e) => setNotifyForm({ ...notifyForm, mesaj: e.target.value })} /></Field>
          <Field label="Link (ex: /dashboard/client)"><input className="inp" value={notifyForm.link} onChange={(e) => setNotifyForm({ ...notifyForm, link: e.target.value })} /></Field>
          <div className="mdl-ft">
            <button className="btn" onClick={() => setNotifyTarget(null)}>Anulează</button>
            <button className="btn primary" onClick={sendNotification} disabled={saving}><Send size={14} /> {saving ? 'Se trimite...' : 'Trimite'}</button>
          </div>
        </Modal>
      )}

      {/* Detalii comandă */}
      {orderDetail && (
        <Modal title="Detalii comandă" onClose={() => setOrderDetail(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 18px', marginBottom: 18 }}>
            <span className="muted">Client</span><span>{orderDetail.order.billing_name || '—'}</span>
            <span className="muted">E-mail</span><span>{orderDetail.order.email}</span>
            <span className="muted">Status</span><span><StatusBadge status={orderDetail.order.status} /></span>
            <span className="muted">Data</span><span>{new Date(orderDetail.order.created_at).toLocaleString('ro-RO')}</span>
            <span className="muted">Total</span><b style={{ color: 'var(--gold)' }}>{fmtMoney(orderDetail.order.total)}</b>
            <span className="muted">ID comandă</span><span className="mono" style={{ fontSize: 12, wordBreak: 'break-all' }}>{orderDetail.order.id}</span>
            {(orderDetail.order.stripe_payment_intent || orderDetail.order.stripe_payment_id) && (
              <><span className="muted">Stripe</span><span className="mono" style={{ fontSize: 12, wordBreak: 'break-all' }}>{orderDetail.order.stripe_payment_intent || orderDetail.order.stripe_payment_id}</span></>
            )}
          </div>
          <div className="section-label">Produse comandate</div>
          {orderDetail.items === null ? <div className="muted">Se încarcă...</div> : orderDetail.error ? (
            <p style={{ color: 'var(--red)', fontSize: 13 }}>{orderDetail.error}</p>
          ) : orderDetail.items.length === 0 ? <div className="muted">Nu există articole înregistrate pentru această comandă.</div> : (
            <div>
              {orderDetail.items.map((it) => (
                <div key={it.id} className="rowline">
                  <div className="grow-1 ell">{it.nume_produs}</div>
                  <b style={{ color: 'var(--gold)' }}>{Number(it.pret_la_cumparare) === 0 ? 'Gratuit' : fmtMoney(it.pret_la_cumparare)}</b>
                </div>
              ))}
            </div>
          )}
          <p className="fld-h" style={{ marginTop: 14 }}>Rambursările se fac din panoul Stripe; schimbarea statusului aici nu returnează banii.</p>
          <div className="mdl-ft">
            {orderDetail.order.user_id && <button className="btn" onClick={() => { const o = orderDetail.order; setOrderDetail(null); openNotify(o.user_id!, o.billing_name || o.email) }}><Bell size={14} /> Notifică</button>}
            <button className="btn primary" onClick={() => setOrderDetail(null)}>Închide</button>
          </div>
        </Modal>
      )}

      {/* Confirmare */}
      {confirmState && (
        <Modal title={confirmState.title} onClose={() => answerConfirm(false)}>
          <p style={{ color: '#cfcfd4', marginBottom: 20 }}>{confirmState.message}</p>
          <div className="mdl-ft">
            <button className="btn" onClick={() => answerConfirm(false)}>Anulează</button>
            <button className={`btn ${confirmState.danger ? 'danger' : 'primary'}`} onClick={() => answerConfirm(true)}>{confirmState.label}</button>
          </div>
        </Modal>
      )}

      {/* Notificări toast */}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.kind}`} role={t.kind === 'error' ? 'alert' : 'status'}>
            {t.kind === 'success' ? <Check size={16} /> : t.kind === 'error' ? <AlertTriangle size={16} /> : <Info size={16} />}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
      </div>
    </>
  )
}