'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

export default function AboutPage() {
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => { 
    setTimeout(() => setMounted(true), 50)
  }, [])

  // Datele fixe pentru ca funcția de share să trimită link-ul curat pe rețelele sociale
  async function handleShare() {
    const shareData = {
      title: 'proarh3d.ro | Birou de proiectare arhitecturala Dambovita.',
      text: 'Proiectare arhitecturala. Dambovita. Romania',
      url: 'https://proarh3d.ro'
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareData.url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      console.log('Eroare la share:', err)
    }
  }

  return (
    <>
      <head>
        <title>Despre Noi | proarh3d.ro</title>
        <meta name="description" content="Suntem un colectiv de arhitecți dedicați spațiilor minimaliste și atemporale. Transformăm concepte riguroase în realitate." />
        
        {/* Open Graph / Facebook / WhatsApp - Link-uri text directe pe care WhatsApp le citește instant */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://proarh3d.ro" />
        <meta property="og:title" content="Despre Noi | proarh3d.ro" />
        <meta property="og:description" content="Formă. Funcție. Spațiu atemporal. Vezi manifestul echipei noastre de arhitectură." />
        <meta property="og:image" content="https://proarh3d.ro" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Despre Noi | proarh3d.ro" />
        <meta name="twitter:description" content="Formă. Funcție. Spațiu atemporal. Vezi manifestul echipei noastre de arhitectură." />
        <meta name="twitter:image" content="https://proarh3d.ro" />
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
      `}</style>

      <div className="a-root">
        <div className="a-ambient" />
        <div className="a-grid" />
        <Navbar />

        <div className={`a-wrap${mounted ? ' ready' : ''}`}>
          <div className="a-eyebrow">Manifestul Nostru</div>
          <h1 className="a-title">Arhitectură cu <em>sens.</em></h1>

          <div className="a-content">
            <p>
              Suntem un colectiv de arhitecți dedicați creării de spații care transcend tendințele trecătoare. 
              Găsim echilibrul perfect între rigoarea tehnică, funcționalitatea absolută și estetica minimalistă.
            </p>
            <p>
              Fiecare linie trasată în laboratorul nostru de proiectare are un scop definit. Nu construim doar 
              structuri, ci modelăm experiențe umane, lumină naturală și volume geometrice pure.
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
              <div className="a-spec-value">Arhitecți, designeri de interior și ingineri uniți de aceeași viziune riguroasă.</div>
            </div>
          </div>

          <div className="a-cta-row">
            <Link href="/portofoliu" style={{ textDecoration: 'none' }}>
              <button type="button" className="a-btn-submit">
                <span>Vezi portofoliul</span>
                <div className="a-btn-arrow" />
              </button>
            </Link>

            <button type="button" className="a-btn-share" onClick={handleShare}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>
              </svg>
              <span>{copied ? 'Link copiat!' : 'Distribuie'}</span>
            </button>
          </div>

          <div className="a-links">
            <Link href="/contact" className="a-link">Să discutăm proiectul tău</Link>
            <Link href="/" className="a-link">← Acasă</Link>
          </div>
        </div>

        <WhatsAppWidget />
        <Footer />
      </div>
    </>
  )
}