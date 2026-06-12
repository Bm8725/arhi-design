"use client";

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'


export default function TermeniConditiiPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://googleapis.com');
        .c-root*,.c-root *::before,.c-root *::after{box-sizing:border-box}
        
        /* Fundal Universal Clar - Alb Complet / Stil Interfață Curată */
        .c-root {
          min-height: 100vh;
          background: #ffffff;
          font-family: 'DM Mono', monospace;
          color: #111111;
          position: relative;
          overflow-x: hidden;
        }
        
        /* Grilă tehnică neutră și discretă */
        .c-grid {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background-image: linear-gradient(rgba(0, 0, 0, 0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.01) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        
        .c-wrap {
          position: relative;
          z-index: 1;
          max-width: 800px;
          margin: 0 auto;
          padding: 140px 24px 100px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .c-wrap.ready {
          opacity: 1;
          transform: translateY(0);
        }
        
        .c-eyebrow {
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #666666;
          margin-bottom: 12px;
        }
        
        .c-title {
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 400;
          line-height: 1.3;
          color: #000000;
          letter-spacing: -0.02em;
          margin-bottom: 40px;
          text-transform: uppercase;
        }
        
        /* Structură de card rigidă și clară */
        .c-card {
          background: #ffffff;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          padding: 24px 0;
          margin-bottom: 24px;
        }
        
        .c-section-title {
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #000000;
          margin-bottom: 12px;
          font-weight: 600;
        }
        
        .c-text {
          font-size: 13px;
          line-height: 1.7;
          color: #333333;
        }
        .c-text p {
          margin-bottom: 12px;
        }
        .c-text p:last-child {
          margin-bottom: 0;
        }
        
        /* Tabel de date simplu și generalist */
        .c-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 16px;
          font-size: 12px;
        }
        .c-table th {
          text-align: left;
          padding: 8px 0;
          border-bottom: 1px solid #000000;
          color: #000000;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .c-table td {
          padding: 10px 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          color: #444444;
          vertical-align: top;
        }
        
        .c-links {
          display: flex;
          justify-content: space-between;
          margin-top: 40px;
          padding-top: 20px;
          border-t: 1px solid rgba(0, 0, 0, 0.1);
        }
        .c-link {
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #666666;
          text-decoration: none;
          transition: color 0.2s;
        }
        .c-link:hover {
          color: #000000;
        }
      `}</style>

      <div className="c-root">
        <div className="c-grid" />
        <Navbar />

        <div className={`c-wrap${mounted ? ' ready' : ''}`}>
          <div className="c-eyebrow">TERMENI LEGALI // SECȚIUNE GENERALĂ</div>
          <h1 className="c-title">TERMENI ȘI CONDIȚII.</h1>

          {/* Bloc generic 01 */}
          <div className="c-card">
            <h2 className="c-section-title">01 / INTRODUCERE</h2>
            <div className="c-text">
              <p>
                Acesta este un bloc de text generalist. Puteți înlocui acest conținut cu termenii și regulile specifice aplicației sau platformei dumneavoastră digitale.
              </p>
            </div>
          </div>

          {/* Bloc generic 02 - Cu tabel inclus */}
          <div className="c-card">
            <h2 className="c-section-title">02 / STRUCTURĂ ȘI DATE TEHNICE</h2>
            <div className="c-text">
              <p>
                Mai jos se află o schemă tabelară de bază pe care o puteți folosi pentru a segmenta planurile tarifare, fazele proiectului sau permisiunile utilizatorilor.
              </p>
              
              <table className="c-table">
                <thead>
                  <tr>
                    <th style={{ width: '30%' }}>PARAMETRU</th>
                    <th style={{ width: '50%' }}>DESCRIERE GENERALĂ</th>
                    <th style={{ width: '20%' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>PARAM_01</strong></td>
                    <td>Exemplu de text tehnic pentru prima coloană de specificații.</td>
                    <td>ACTIV</td>
                  </tr>
                  <tr>
                    <td><strong>PARAM_02</strong></td>
                    <td>Exemplu de text tehnic pentru a doua coloană de specificații.</td>
                    <td>REVOCABIL</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bloc generic 03 */}
          <div className="c-card">
            <h2 className="c-section-title">03 / RESPONSABILITĂȚI</h2>
            <div className="c-text">
              <p>
                Text adițional pentru completarea politicii site-ului. Fundalul alb și textul de contrast închis asigură o citire impecabilă pe orice tip de ecran.
              </p>
            </div>
          </div>

          <div className="c-links">
            <Link href="/politica-confidentialitate" className="c-link">Confidențialitate</Link>
            <Link href="/" className="c-link">← Home</Link>
          </div>
        </div>


        <Footer />
      </div>
    </>
  )
}