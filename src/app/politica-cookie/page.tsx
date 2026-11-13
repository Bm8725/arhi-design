'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CookieBanner from "@/components/Cookiebanner";

const COMPANY = {
  name: 'PROIECTEARH 4D S.R.L.',
  brand: 'PROARH.4D',
  site: 'proarh4d.ro',
  cui: '36685509',
  regCom: 'J15/1090/28/10/2016',
  email: 'proiectearh4d@gmail.com', // 
}
const LAST_UPDATE = 'noiembrie 2026'

export default function CookiePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  const openSettings = () => window.dispatchEvent(new Event('open-cookie-settings'))

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;1,400&display=swap');
        .c-root *,.c-root *::before,.c-root *::after{box-sizing:border-box}

        /* Fundal Crem Cald / Studio Light Aesthetic */
        .c-root{min-height:100vh;background:#fcfbf9;font-family:'DM Mono',monospace;color:#2a2723;position:relative;overflow-x:hidden}

        .c-ambient{position:fixed;inset:0;pointer-events:none;z-index:0;background:radial-gradient(ellipse 80% 50% at 15% 20%,rgba(226,179,110,0.12) 0%,transparent 60%),radial-gradient(ellipse 60% 60% at 85% 80%,rgba(140,120,90,0.06) 0%,transparent 60%)}
        .c-grid{position:fixed;inset:0;pointer-events:none;z-index:0;background-image:linear-gradient(rgba(42,39,35,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(42,39,35,0.015) 1px,transparent 1px);background-size:80px 80px}

        .c-wrap{position:relative;z-index:1;max-width:820px;margin:0 auto;padding:140px 40px 100px;min-height:100vh;display:flex;flex-direction:column;opacity:0;transform:translateY(15px);transition:opacity 0.6s ease,transform 0.6s ease}
        .c-wrap.ready{opacity:1;transform:translateY(0)}

        .c-eyebrow{font-size:10px;letter-spacing:0.35em;text-transform:uppercase;color:#b88b4a;margin-bottom:18px;display:flex;align-items:center;gap:12px}
        .c-eyebrow::before{content:'';width:28px;height:1px;background:linear-gradient(to right,rgba(184,139,74,0.6),transparent)}

        .c-title{font-family:'Playfair Display',serif;font-size:clamp(32px,5vw,48px);font-weight:400;line-height:1.2;color:#1a1816;letter-spacing:-0.01em;margin:0 0 16px}
        .c-title em{font-style:italic;color:#b88b4a;font-weight:400}
        .c-updated{font-size:11px;letter-spacing:0.1em;color:#8c8275;margin-bottom:48px}

        .c-card{background:#ffffff;border:1px solid rgba(42,39,35,0.05);padding:40px;margin-bottom:32px;box-shadow:0 4px 30px rgba(140,120,90,0.02)}
        .c-section-title{font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#b88b4a;margin:0 0 16px;font-weight:500}

        .c-text{font-size:13.5px;line-height:1.75;color:#4a443c}
        .c-text p{margin:0 0 16px}
        .c-text p:last-child{margin-bottom:0}
        .c-text ul{margin:0 0 16px;padding-left:20px}
        .c-text li{margin-bottom:8px}
        .c-text a{color:#b88b4a;text-decoration:underline;text-underline-offset:3px}
        .c-text a:hover{color:#1a1816}
        .c-text code{font-family:inherit;background:rgba(184,139,74,0.1);padding:1px 5px}

        .c-table-scroll{overflow-x:auto;margin-top:16px}
        .c-table{width:100%;min-width:520px;border-collapse:collapse;font-size:12px}
        .c-table th{text-align:left;padding:10px 12px 10px 0;border-bottom:1px solid rgba(42,39,35,0.1);color:#1a1816;font-weight:500;text-transform:uppercase;letter-spacing:0.1em}
        .c-table td{padding:12px 12px 12px 0;border-bottom:1px solid rgba(42,39,35,0.05);color:#5c554c;vertical-align:top;word-break:break-word}

        .c-btn{display:inline-block;margin-top:4px;padding:11px 18px;font-family:inherit;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#ffffff;background:#1a1816;border:1px solid #1a1816;cursor:pointer;transition:background 0.2s}
        .c-btn:hover{background:#3a352f}
        .c-btn:focus-visible{outline:2px solid #b88b4a;outline-offset:2px}

        .c-links{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:48px;padding-top:24px;border-top:1px solid rgba(42,39,35,0.08)}
        .c-link{font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#8c8275;text-decoration:none;transition:color 0.2s}
        .c-link:hover{color:#1a1816}

        @media (max-width:600px){
          .c-wrap{padding:110px 20px 70px}
          .c-card{padding:26px 20px}
        }
        @media (prefers-reduced-motion:reduce){
          .c-wrap{transition:none;transform:none}
        }
      `}</style>

      <div className="c-root">
        <div className="c-ambient" />
        <div className="c-grid" />
        <Navbar />

        <div className={`c-wrap${mounted ? ' ready' : ''}`}>
          <div className="c-eyebrow">Transparență tehnologică</div>
          <h1 className="c-title">Utilizarea <em>fișierelor</em> cookie.</h1>
          <p className="c-updated">Ultima actualizare: {LAST_UPDATE}</p>

          {/* 01 */}
          <div className="c-card">
            <h2 className="c-section-title">01 / Ce sunt cookie-urile</h2>
            <div className="c-text">
              <p>
                Cookie-urile sunt fișiere mici de date salvate în browserul dumneavoastră. Le folosim,
                împreună cu tehnologii similare (de exemplu stocarea locală a browserului), pentru
                funcționarea platformei <strong>{COMPANY.site}</strong>, administrată de{' '}
                <strong>{COMPANY.name}</strong> (CUI {COMPANY.cui}, {COMPANY.regCom}), sub marca{' '}
                <strong>{COMPANY.brand}</strong>.
              </p>
              <p>
                Cookie-urile care conțin date personale sunt prelucrate conform{' '}
                <Link href="/politica-confidentialitate">Politicii de confidențialitate</Link>.
              </p>
            </div>
          </div>

          {/* 02 */}
          <div className="c-card">
            <h2 className="c-section-title">02 / Categorii și consimțământ</h2>
            <div className="c-text">
              <p>La prima vizită, bannerul de cookie vă permite să alegeți între:</p>
              <ul>
                <li><strong>Tehnice (necesare)</strong> — esențiale pentru site, cont și coș de cumpărături. Sunt mereu active și nu necesită consimțământ.</li>
                <li><strong>Analitice</strong> — statistici despre utilizarea site-ului. Se activează doar dacă le acceptați.</li>
                <li><strong>Marketing</strong> — măsurarea campaniilor și conținut personalizat de la terți. Se activează doar dacă le acceptați.</li>
              </ul>
              <p>
                Alegerea este reținută 12 luni, după care vă vom întreba din nou. O puteți modifica oricând:
              </p>
              <button type="button" className="c-btn" onClick={openSettings}>
                Deschide setările de cookie
              </button>
            </div>
          </div>

          {/* 03 */}
          <div className="c-card">
            <h2 className="c-section-title">03 / Cookie-uri tehnice (necesare)</h2>
            <div className="c-text">
              <p>
                Fără acestea, autentificarea în contul Smart Connect, securitatea sesiunii și funcțiile
                de bază ale site-ului nu pot funcționa.
              </p>

              <div className="c-table-scroll">
                <table className="c-table">
                  <thead>
                    <tr>
                      <th style={{ width: '28%' }}>Nume</th>
                      <th style={{ width: '44%' }}>Scop</th>
                      <th style={{ width: '28%' }}>Durată</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>sb-…-auth-token</strong></td>
                      <td>Menținerea securizată a sesiunii de autentificare (furnizor: Supabase).</td>
                      <td>Sesiune / până la deconectare</td>
                    </tr>
                    <tr>
                      <td><strong>app-theme</strong></td>
                      <td>Reținerea preferințelor de interfață grafică.</td>
                      <td>1 an</td>
                    </tr>
                    <tr>
                      <td><strong>wa-widget-state</strong></td>
                      <td>Starea deschis/închis a modulului de contact WhatsApp.</td>
                      <td>Sesiune</td>
                    </tr>
                    <tr>
                      <td><strong>proarh_governance_consent, proarh_cookie_matrix, proarh_consent_meta</strong></td>
                      <td>Rețin alegerea dumneavoastră privind cookie-urile (stocare locală a browserului).</td>
                      <td>12 luni</td>
                    </tr>
                    {/* Adaugă aici cookie-ul / cheia coșului de cumpărături, dacă există */}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 04 */}
          <div className="c-card">
            <h2 className="c-section-title">04 / Cookie-uri analitice și de marketing</h2>
            <div className="c-text">
              <p>
                Aceste cookie-uri se instalează <strong>numai după acordul dumneavoastră</strong> exprimat
                în banner și pot fi retrase oricând din setări. Dacă refuzați, site-ul rămâne complet
                funcțional.
              </p>

              <div className="c-table-scroll">
                <table className="c-table">
                  <thead>
                    <tr>
                      <th style={{ width: '28%' }}>Furnizor / nume</th>
                      <th style={{ width: '44%' }}>Scop</th>
                      <th style={{ width: '28%' }}>Categorie · Durată</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* COMPLETEAZĂ cu serviciile reale (ex. Google Analytics: _ga, _ga_*) sau
                        elimină secțiunea și categoriile din banner dacă nu folosești niciun serviciu. */}
                    <tr>
                      <td><strong>[COMPLETEAZĂ]</strong></td>
                      <td>[Scop]</td>
                      <td>[Analitice / Marketing · durată]</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 05 */}
          <div className="c-card">
            <h2 className="c-section-title">05 / Cookie-uri ale terților</h2>
            <div className="c-text">
              <p>
                Procesatorul de plăți al magazinului, WhatsApp (dacă deschideți conversația) și alte
                servicii externe pot seta propriile cookie-uri pe paginile lor. Acestea sunt guvernate de
                politicile respectivilor furnizori, asupra cărora nu avem control.
              </p>
            </div>
          </div>

          {/* 06 */}
          <div className="c-card">
            <h2 className="c-section-title">06 / Controlul din browser</h2>
            <div className="c-text">
              <p>
                Puteți șterge sau bloca cookie-urile oricând din setările browserului (Chrome, Firefox,
                Safari, Edge). Blocarea celor tehnice poate însă face imposibilă autentificarea, utilizarea
                coșului de cumpărături sau accesul în Dashboard.
              </p>
              <p>
                Pentru întrebări legate de cookie-uri sau date personale, ne puteți scrie la {COMPANY.email}.
                Aveți dreptul să vă adresați și ANSPDCP, la{' '}
                <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer">
                  dataprotection.ro
                </a>.
              </p>
            </div>
          </div>

          <div className="c-links">
            <Link href="/politica-confidentialitate" className="c-link">Confidențialitate (GDPR)</Link>
            <Link href="/termeni-conditii" className="c-link">Termeni și condiții</Link>
            <Link href="/" className="c-link">← Home</Link>
          </div>
        </div>

        <CookieBanner />
        <Footer />
      </div>
    </>
  )
}