'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

const SITE_URL = 'https://arhi-design.vercel.app'
const SITE_TITLE = 'proarh4d.ro | Birou de proiectare arhitecturala Dambovita.'
const SITE_TEXT = 'Proiectare arhitecturala. Dambovita. Romania'

export default function AboutPage() {
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [cardDataUrl, setCardDataUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
  }, [])

  // ── generează cardul de share pe <canvas>, o singură dată ──
  const drawCard = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const W = canvas.width
    const H = canvas.height

    // fundal
    ctx.fillStyle = '#0c0c0c'
    ctx.fillRect(0, 0, W, H)
    const grad = ctx.createRadialGradient(W * 0.18, H * 0.22, 0, W * 0.18, H * 0.22, W * 0.85)
    grad.addColorStop(0, 'rgba(226,179,110,0.12)')
    grad.addColorStop(1, 'rgba(12,12,12,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // grilă subtilă, ca pe pagină
    ctx.strokeStyle = 'rgba(255,255,255,0.045)'
    ctx.lineWidth = 1
    for (let x = 0; x <= W; x += 60) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, H)
      ctx.stroke()
    }
    for (let y = 0; y <= H; y += 60) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(W, y)
      ctx.stroke()
    }

    // motiv arhitectural abstract, colț dreapta-jos
    ctx.strokeStyle = 'rgba(226,179,110,0.4)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(W - 280, H - 70)
    ctx.lineTo(W - 170, H - 230)
    ctx.lineTo(W - 60, H - 70)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(W - 230, H - 70)
    ctx.lineTo(W - 230, H - 150)
    ctx.moveTo(W - 100, H - 70)
    ctx.lineTo(W - 100, H - 150)
    ctx.stroke()

    // ramă fină exterioară
    ctx.strokeStyle = 'rgba(226,179,110,0.25)'
    ctx.lineWidth = 1
    ctx.strokeRect(20, 20, W - 40, H - 40)

    const marginX = 72

    // eyebrow
    ctx.fillStyle = '#e2b36e'
    ctx.font = '600 19px "DM Mono", monospace'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText('M A N I F E S T U L   N O S T R U', marginX, 118)

    // titlu
    ctx.fillStyle = '#ffffff'
    ctx.font = '400 74px "Playfair Display", Georgia, serif'
    ctx.fillText('Arhitectură cu', marginX, 226)
    ctx.fillStyle = '#e2b36e'
    ctx.font = 'italic 400 74px "Playfair Display", Georgia, serif'
    ctx.fillText('sens.', marginX, 310)

    // citat
    ctx.fillStyle = 'rgba(225,225,225,0.85)'
    ctx.font = '400 21px "DM Mono", monospace'
    const words =
      'Modelăm experiențe umane, lumină naturală și volume geometrice pure.'.split(' ')
    let line = ''
    let curY = 390
    const lineHeight = 32
    const maxWidth = 680
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' '
      if (ctx.measureText(testLine).width > maxWidth && n > 0) {
        ctx.fillText(line, marginX, curY)
        line = words[n] + ' '
        curY += lineHeight
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, marginX, curY)

    // footer
    ctx.fillStyle = '#e2b36e'
    ctx.font = '600 19px "DM Mono", monospace'
    ctx.fillText('PROARH.4D', marginX, H - 56)
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '400 17px "DM Mono", monospace'
    ctx.fillText('proarh4d.ro', marginX, H - 30)

    return canvas.toDataURL('image/png')
  }, [])

  useEffect(() => {
    const url = drawCard()
    if (url) setCardDataUrl(url)
  }, [drawCard])

  // ESC pentru închiderea panoului de share
  useEffect(() => {
    if (!shareOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShareOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shareOpen])

  async function handleNativeShare() {
    try {
      let filesToShare: File[] | undefined

      if (cardDataUrl) {
        try {
          const res = await fetch(cardDataUrl)
          const blob = await res.blob()
          const file = new File([blob], 'proarh4d-arhitectura-cu-sens.png', {
            type: 'image/png',
          })
          if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
            filesToShare = [file]
          }
        } catch {
          // dacă imaginea nu poate fi atașată, continuăm doar cu linkul
        }
      }

      if (navigator.share) {
        await navigator.share({
          title: SITE_TITLE,
          text: SITE_TEXT,
          url: SITE_URL,
          ...(filesToShare ? { files: filesToShare } : {}),
        })
      } else {
        await handleCopyLink()
      }
    } catch {
      // share anulat de utilizator — nu facem nimic
    }
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(SITE_URL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    if (!cardDataUrl) return
    const a = document.createElement('a')
    a.href = cardDataUrl
    a.download = 'proarh4d-arhitectura-cu-sens.png'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const shareText = encodeURIComponent(`${SITE_TITLE} — ${SITE_TEXT}`)
  const shareUrlEnc = encodeURIComponent(SITE_URL)

  return (
    <>
      <head>
        <title>Despre Noi | proarh4d.ro</title>
        <meta name="description" content="Suntem un colectiv de arhitecți dedicați spațiilor minimaliste și atemporale. Transformăm concepte riguroase în realitate." />
        
        {/* Open Graph / Facebook / WhatsApp - Link-uri text directe pe care WhatsApp le citește instant */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://arhi-design.vercel.app" />
        <meta property="og:title" content="Despre Noi | proarh3d.ro" />
        <meta property="og:description" content="Formă. Funcție. Spațiu atemporal. Vezi manifestul echipei noastre de arhitectură." />
        <meta property="og:image" content="https://arhi-design.vercel.app" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Despre Noi | proarh4d.ro" />
        <meta name="twitter:description" content="Formă. Funcție. Spațiu atemporal. Vezi manifestul echipei noastre de arhitectură." />
        <meta name="twitter:image" content="https://arhi-design.vercel.app" />
      </head>

      <style>{`
        @import url('https://googleapis.com');
        .a-root *,.a-root *::before,.a-root *::after{box-sizing:border-box}
        .a-root{min-height:100vh;background:#0c0c0c;font-family:'DM Mono',monospace;color:#e0e0e0;position:relative;overflow-x:hidden}
        .a-ambient{position:fixed;inset:0;pointer-events:none;z-index:0;background:radial-gradient(ellipse 80% 50% at 15% 20%,rgba(226,179,110,0.06) 0%,transparent 60%),radial-gradient(ellipse 60% 60% at 85% 80%,rgba(140,120,90,0.04) 0%,transparent 60%)}
        .a-grid{position:fixed;inset:0;pointer-events:none;z-index:0;background-image:linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px);background-size:80px 80px}
        .a-wrap{position:relative;z-index:1;max-width:720px;margin:0 auto;padding:120px 40px 80px;min-height:100vh;display:flex;flex-direction:column;justify-content:center;opacity:0;transform:translateY(20px);transition:opacity 0.7s ease,transform 0.7s ease}
        .a-wrap.ready{opacity:1;transform:translateY(0)}
        .a-eyebrow{font-size:10px;letter-spacing:0.35em;text-transform:uppercase;color:#e2b36e;margin-bottom:18px;display:flex;align-items:center;gap:12px}
        .a-eyebrow::before{content:'';width:28px;height:1px;background:linear-gradient(to right,rgba(226,179,110,0.6),transparent)}
        .a-title{font-family:'Playfair Display',serif;font-size:clamp(32px,5vw,54px);font-weight:400;line-height:1.15;color:#ffffff;letter-spacing:-0.01em;margin-bottom:36px}
        .a-title em{font-style:italic;color:#e2b36e;font-weight:400}
        .a-content{font-size:14px;line-height:1.8;color:rgba(225,225,225,0.85);margin-bottom:48px}
        .a-content p{margin-bottom:24px}
        .a-specs{display:flex;flex-direction:column;gap:24px;margin-bottom:48px;border-top:1px solid rgba(255,255,255,0.1);padding-top:36px}
        .a-spec-item{display:grid;grid-template-columns:140px 1fr;gap:16px}
        .a-spec-label{font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#e2b36e;padding-top:4px}
        .a-spec-value{font-size:13px;color:rgba(255,255,255,0.7);line-height:1.6}
        .a-cta-row{display:flex;align-items:center;flex-wrap:wrap;gap:20px;margin-top:20px}
        .a-btn-submit{display:inline-flex;align-items:center;gap:18px;background:none;border:1px solid rgba(226,179,110,0.5);color:#e2b36e;cursor:pointer;padding:15px 30px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;transition:all 0.25s;position:relative;overflow:hidden}
        .a-btn-submit::before{content:'';position:absolute;inset:0;background:rgba(226,179,110,0.1);transform:translateX(-101%);transition:transform 0.35s ease}
        .a-btn-submit:hover{border-color:#e2b36e;color:#ffffff}
        .a-btn-submit:hover::before{transform:translateX(0)}
        .a-btn-share{display:inline-flex;align-items:center;gap:12px;background:none;border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.6);cursor:pointer;padding:15px 24px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;transition:all 0.25s}
        .a-btn-share:hover{border-color:rgba(255,255,255,0.4);color:#ffffff}
        .a-btn-arrow{width:22px;height:1px;background:#e2b36e;position:relative;transition:width 0.25s}
        .a-btn-arrow::after{content:'';position:absolute;right:-1px;top:-3px;width:7px;height:7px;border-top:1px solid #e2b36e;border-right:1px solid #e2b36e;transform:rotate(45deg)}
        .a-btn-submit:hover .a-btn-arrow{width:32px;background:#ffffff}
        .a-btn-submit:hover .a-btn-arrow::after{border-color:#ffffff}
        .a-links{display:flex;justify-content:space-between;margin-top:48px;padding-top:22px;border-top:1px solid rgba(255,255,255,0.15)}
        .a-link{font-size:9.5px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.5);text-decoration:none;transition:color 0.2s}
        .a-link:hover{color:#ffffff}

        /* ── panou de share cu card generat ── */
        .a-share-backdrop{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,0.78);backdrop-filter:blur(8px);opacity:0;pointer-events:none;transition:opacity .3s ease}
        .a-share-backdrop.open{opacity:1;pointer-events:auto}
        .a-share-panel{position:relative;width:100%;max-width:460px;background:#101010;border:1px solid rgba(226,179,110,0.25);padding:24px;transform:scale(.95) translateY(14px);opacity:0;transition:transform .4s cubic-bezier(.16,1,.3,1),opacity .4s ease}
        .a-share-backdrop.open .a-share-panel{transform:scale(1) translateY(0);opacity:1}
        .a-share-close{position:absolute;top:14px;right:14px;width:26px;height:26px;display:flex;align-items:center;justify-content:center;background:none;border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.6);cursor:pointer;font-size:12px;transition:.2s}
        .a-share-close:hover{color:#fff;border-color:rgba(255,255,255,.4);transform:rotate(90deg)}
        .a-share-eyebrow{font-size:9.5px;letter-spacing:.28em;text-transform:uppercase;color:#e2b36e;margin-bottom:14px}
        .a-card-preview{width:100%;aspect-ratio:1200/630;border:1px solid rgba(255,255,255,.08);overflow:hidden;margin-bottom:18px;background:#000}
        .a-card-preview img{width:100%;height:100%;object-fit:cover;display:block}
        .a-share-row{display:flex;gap:10px;margin-bottom:16px}
        .a-share-row .a-btn-submit,.a-share-row .a-btn-share{flex:1;justify-content:center;padding:13px 16px}
        .a-social-row{display:flex;gap:10px}
        .a-social-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;height:38px;border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.6);text-decoration:none;font-size:9px;letter-spacing:.18em;text-transform:uppercase;transition:.2s}
        .a-social-btn:hover{border-color:#e2b36e;color:#e2b36e}
      `}</style>

      <div className="a-root">
        <div className="a-ambient" />
        <div className="a-grid" />
        <Navbar />

        {/* canvas ascuns, folosit pentru generarea cardului de share */}
        <canvas ref={canvasRef} width={1200} height={630} style={{ display: 'none' }} />

        <div className={`a-wrap${mounted ? ' ready' : ''}`}>
          <div className="a-eyebrow">Manifestul Nostru</div>
          <h1 className="a-title">Birou de arhitectura  <em>arh. Bogdan Șotîngeanu</em></h1>

          <div className="a-content">
            <p>
                 Suntem un birou de arhitectura condus de catre domnul Arhitect Bogdan Șotîngeanu, specializat în proiectarea de spații civile cat si industriale cu o viziune unica. 
            </p>
            <p>
              Fiecare linie trasată în biroul nostru de proiectare are un scop definit. Nu construim doar 
              structuri, ci modelăm experiențe umane, lumină naturală și volume geometrice pure.
              Biroul nostru se afla in mun. Targoviste, jud. Dambovita.
            </p>
          </div>

          <div className="a-specs">
            <div className="a-spec-item">
              <div className="a-spec-label">Filosofie</div>
              <div className="a-spec-value">Sustenabilitate prin detalii premium și materiale brute, atemporale.</div>
            </div>
            <div className="a-spec-item">
              <div className="a-spec-label">Abordare</div>
              <div className="a-spec-value">Proiectare integrată de la primele schițe conceptuale până la managementul execuției.</div>
            </div>
            <div className="a-spec-item">
              <div className="a-spec-label">Echipa</div>
              <div className="a-spec-value">Specialisti, designeri de interior și ingineri uniți de aceeași viziune riguroasă.</div>
            </div>
                        <div className="a-spec-item">
              <div className="a-spec-label">Contact</div>
              <div className="a-spec-value">+40 743 193 627 </div>
            </div>
          </div>

          <div className="a-cta-row">
            <Link href="/portofoliu" style={{ textDecoration: 'none' }}>
              <button type="button" className="a-btn-submit">
                <span>Vezi portofoliul</span>
                <div className="a-btn-arrow" />
              </button>
            </Link>

            <button type="button" className="a-btn-share" onClick={() => setShareOpen(true)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>
              </svg>
              <span>Distribuie</span>
            </button>
          </div>

          <div className="a-links">
           
            <Link href="/" className="a-link">← Acasă</Link>
          </div>
        </div>

        {/* ── panoul de share cu cardul generat ── */}
        <div
          className={`a-share-backdrop${shareOpen ? ' open' : ''}`}
          onClick={() => setShareOpen(false)}
        >
          <div className="a-share-panel" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="a-share-close"
              aria-label="Închide"
              onClick={() => setShareOpen(false)}
            >
              ✕
            </button>

            <div className="a-share-eyebrow">Cardul tău de distribuire</div>

            <div className="a-card-preview">
              {cardDataUrl && <img src={cardDataUrl} alt="Card proarh4d — Arhitectură cu sens" />}
            </div>

            <div className="a-share-row">
              <button type="button" className="a-btn-submit" onClick={handleNativeShare}>
                <span>Distribuie</span>
                <div className="a-btn-arrow" />
              </button>
              <button type="button" className="a-btn-share" onClick={handleDownload}>
                <span>Descarcă</span>
              </button>
            </div>

            <div className="a-social-row">
              <a
                className="a-social-btn"
                href={`https://wa.me/?text=${shareText}%20${shareUrlEnc}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
              <a
                className="a-social-btn"
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrlEnc}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
              <a
                className="a-social-btn"
                href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrlEnc}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                X
              </a>
              <button type="button" className="a-social-btn" onClick={handleCopyLink}>
                {copied ? 'Copiat!' : 'Copiază link'}
              </button>
            </div>
          </div>
        </div>

        <WhatsAppWidget />
        <Footer />
      </div>
    </>
  )
}