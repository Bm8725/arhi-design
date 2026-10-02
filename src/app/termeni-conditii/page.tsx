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
          <div className="c-eyebrow">TERMENI LEGALI // CONTRACT DIGITAL</div>
          <h1 className="c-title">TERMENI ȘI CONDIȚII.</h1>

          {/* Bloc 01 - Utilizarea Site-ului */}
          <div className="c-card">
            <h2 className="c-section-title">01 / DISPOZIȚII GENERALE</h2>
            <div className="c-text">
              <p>
                Prezentul document stabilește regulile și condițiile de utilizare a platformei digitale <strong>proarh4d.ro</strong>. Prin accesarea site-ului, navigarea în portofoliu sau achiziția de pe shop-ul nostru, sunteți de acord să respectați integral acești termeni. Platforma este administrată de biroul de proiectare și consultanță arhitecturală <strong>PROARH.4D</strong>.
              </p>
            </div>
          </div>

          {/* Bloc 02 - Servicii, Shop 3D și Drepturi */}
          <div className="c-card">
            <h2 className="c-section-title">02 / PROPRIETATE INTELECTUALĂ ȘI LIVRABILE</h2>
            <div className="c-text">
              <p>
                Toate conceptele, schițele CAD, randările 3D, imaginile și modelele arhitecturale prezentate sau vândute prin intermediul acestui site aparțin în exclusivitate <strong>PROARH.4D</strong> și sunt protejate de legea drepturilor de autor. Achiziția de modele 3D de pe shop oferă o licență de utilizare non-exclusivă, fiind strict interzisă revânzarea sau redistribuirea fișierelor sursă.
              </p>
              
              <table className="c-table">
                <thead>
                  <tr>
                    <th style={{ width: '30%' }}>SERVICIU / PRODUS</th>
                    <th style={{ width: '50%' }}>DREPTURI DE UTILIZARE & SPECIFICAȚII</th>
                    <th style={{ width: '20%' }}>STATUS LICENȚĂ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Proiectare & Arhitectură</strong></td>
                    <td>Drept de execuție unic pentru conceptul autorizat (case, vile, clădiri administrative).</td>
                    <td>UNIC / EXCLUSIV</td>
                  </tr>
                  <tr>
                    <td><strong>Modele 3D & Obiecte Shop</strong></td>
                    <td>Utilizare comercială sau personală integrată în randări proprii. Interzisă redistribuirea.</td>
                    <td>NON-EXCLUSIV</td>
                  </tr>
                  <tr>
                    <td><strong>Randări & Materiale Media</strong></td>
                    <td>Prezentare portofoliu cu obligația de păstrare a semnăturii autorului Bogdan Șotîngeanu.</td>
                    <td>PROTEJAT</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bloc 03 - Responsabilități și nZEB */}
          <div className="c-card">
            <h2 className="c-section-title">03 / LIMITAREA RESPONSABILITĂȚII</h2>
            <div className="c-text">
              <p>
                Modelele digitale și informațiile din secțiunea de consultanță au un scop conceptual și orientativ. <strong>PROARH.4D</strong> nu își asumă răspunderea pentru erori cauzate de utilizarea neconformă a fișierelor descărcate fără verificarea tehnică sau adaptarea lor la contextul real de pe teren de către specialiști autorizați (structuriști, instalatori). Orice proiect de execuție sau documentație nZEB se va supune unui contract distinct semnat fizic sau digital.
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