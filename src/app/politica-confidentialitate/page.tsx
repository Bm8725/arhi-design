"use client";

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'
import CookieBanner from "@/components/Cookiebanner";

export default function PoliticaConfidentialitatePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://googleapis.com');
        .c-root*,.c-root *::before,.c-root *::after{box-sizing:border-box}
        
        /* Fundal Crem Cald / Studio Light Aesthetic */
        .c-root{min-height:100vh;background:#fcfbf9;font-family:'DM Mono',monospace;color:#2a2723;position:relative;overflow-x:hidden}
        
        /* Ambient discret adaptat pentru fundal deschis */
        .c-ambient{position:fixed;inset:0;pointer-events:none;z-index:0;background:radial-gradient(ellipse 80% 50% at 15% 20%,rgba(226,179,110,0.12) 0%,transparent 60%),radial-gradient(ellipse 60% 60% at 85% 80%,rgba(140,120,90,0.06) 0%,transparent 60%)}
        .c-grid{position:fixed;inset:0;pointer-events:none;z-index:0;background-image:linear-gradient(rgba(42,39,35,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(42,39,35,0.015) 1px,transparent 1px);background-size:80px 80px}
        
        .c-wrap{position:relative;z-index:1;max-width:760px;margin:0 auto;padding:140px 40px 100px;min-height:100vh;display:flex;flex-direction:column;justify-content:center;opacity:0;transform:translateY(15px);transition:opacity 0.6s ease,transform 0.6s ease}
        .c-wrap.ready{opacity:1;transform:translateY(0)}
        
        .c-eyebrow{font-size:10px;letter-spacing:0.35em;text-transform:uppercase;color:#b88b4a;margin-bottom:18px;display:flex;align-items:center;gap:12px}
        .c-eyebrow::before{content:'';width:28px;height:1px;background:linear-gradient(to right,rgba(184,139,74,0.6),transparent)}
        
        .c-title{font-family:'Playfair Display',serif;font-size:clamp(32px,5vw,48px);font-weight:400;line-height:1.2;color:#1a1816;letter-spacing:-0.01em;margin-bottom:48px}
        .c-title em{font-style:italic;color:#b88b4a;font-weight:400}
        
        /* Blocuri de text pe fundal Alb Pur rigid */
        .c-card{background:#ffffff;border:1px solid rgba(42,39,35,0.05);padding:40px;margin-bottom:32px;box-shadow:0 4px 30px rgba(140,120,90,0.02)}
        
        .c-section-title{font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#b88b4a;margin-bottom:16px;font-weight:500}
        .c-text{font-size:13.5px;line-height:1.75;color:#4a443c;margin-bottom:0}
        .c-text p{margin-bottom:16px}
        .c-text p:last-child{margin-bottom:0}
        
        /* Tabel tehnic pentru drepturile utilizatorului */
        .c-table{width:100%;border-collapse:collapse;margin-top:16px;font-size:12px}
        .c-table th{text-align:left;padding:10px 0;border-bottom:1px solid rgba(42,39,35,0.1);color:#1a1816;font-weight:500;text-transform:uppercase;letter-spacing:0.1em}
        .c-table td{padding:12px 0;border-bottom:1px solid rgba(42,39,35,0.05);color:#5c554c;vertical-align:top}
        
        .c-links{display:flex;justify-content:space-between;margin-top:48px;padding-top:24px;border-top:1px solid rgba(42,39,35,0.08)}
        .c-link{font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#8c8275;text-decoration:none;transition:color 0.2s}
        .c-link:hover{color:#1a1816}
      `}</style>

      <div className="c-root">
        <div className="c-ambient" />
        <div className="c-grid" />
        <Navbar />

        <div className={`c-wrap${mounted ? ' ready' : ''}`}>
          <div className="c-eyebrow">Cadru Legal GDPR</div>
          <h1 className="c-title">Politica de <em>confidențialitate</em>.</h1>

          {/* Secțiunea 1 */}
          <div className="c-card">
            <h2 className="c-section-title">01 / Operatorul de date</h2>
            <div className="c-text">
              <p>
                PROARH.4D activează ca operator digital de date. Respectăm integritatea spațiului dumneavoastră 
                virtual și prelucrăm informațiile cu caracter personal în conformitate cu normele stricte stabilite 
                de Regulamentul European GDPR.
              </p>
            </div>
          </div>

          {/* Secțiunea 2 */}
          <div className="c-card">
            <h2 className="c-section-title">02 / Structura datelor colectate</h2>
            <div className="c-text">
              <p>
                Interfața noastră colectează și procesează exclusiv vectorii de date minimi necesari bunei 
                desfășurări a serviciilor de arhitectură, modelare 3D avansată și analiză nZEB.
              </p>
              
              <table className="c-table">
                <thead>
                  <tr>
                    <th style={{ width: '30%' }}>Tip Data</th>
                    <th style={{ width: '40%' }}>Scopul Procesării</th>
                    <th style={{ width: '30%' }}>Temei Juridic</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Identitate (Nume)</strong></td>
                    <td>Personalizarea documentației tehnice și contractare.</td>
                    <td>Obligație Contractuală</td>
                  </tr>
                  <tr>
                    <td><strong>Contact (E-mail/Tel)</strong></td>
                    <td>Trimiterea randărilor, devizelor și consultanță rapidă.</td>
                    <td>Consimțământ Direct</td>
                  </tr>
                  <tr>
                    <td><strong>Date Cadastrale / Schițe</strong></td>
                    <td>Analiza spațială și inițierea studiilor de proiectare.</td>
                    <td>Executare Contract</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Secțiunea 3 */}
          <div className="c-card">
            <h2 className="c-section-title">03 / Drepturile utilizatorului</h2>
            <div className="c-text">
              <p>
                În calitate de proprietar al datelor, beneficiați de control absolut asupra acestora. Aveți dreptul 
                nativ de acces, rectificare imediată, restricționare a fluxului sau ștergere definitivă din baza de date 
                PROARH.4D. Orice solicitare oficială de eliminare poate fi adresată direct prin e-mail.
              </p>
            </div>
          </div>

          <div className="c-links">
            <Link href="/politica-cookie" className="c-link">Politica de Cookie</Link>
            <Link href="/" className="c-link">← Home</Link>
          </div>
        </div>


        <Footer />
      </div>
    </>
  )
}