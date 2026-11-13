"use client";

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

/* ------------------------------------------------------------------
   DATE OPERATOR – verifică și completează înainte de publicare
   (CUI și nr. Reg. Com. au fost preluate din documente publice ale
   Primăriei Târgoviște; sediul apare diferit în două documente din 2025)
------------------------------------------------------------------- */
const COMPANY = {
  name: 'PROIECTEARH 4D S.R.L.',
  brand: 'PROARH.4D',
  site: 'proarh4d.ro',
  cui: '36685509',
  regCom: 'J25/1234/2025',
}
const LAST_UPDATE = 'noiembrie 2026'

export default function PoliticaConfidentialitatePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

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

        .c-title{font-family:'Playfair Display',serif;font-size:clamp(32px,5vw,48px);font-weight:400;line-height:1.2;color:#1a1816;letter-spacing:-0.01em;margin-bottom:16px}
        .c-title em{font-style:italic;color:#b88b4a;font-weight:400}
        .c-updated{font-size:11px;letter-spacing:0.1em;color:#8c8275;margin-bottom:48px}

        .c-card{background:#ffffff;border:1px solid rgba(42,39,35,0.05);padding:40px;margin-bottom:32px;box-shadow:0 4px 30px rgba(140,120,90,0.02)}

        .c-section-title{font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#b88b4a;margin-bottom:16px;font-weight:500}
        .c-text{font-size:13.5px;line-height:1.75;color:#4a443c}
        .c-text p{margin:0 0 16px}
        .c-text p:last-child{margin-bottom:0}
        .c-text a{color:#b88b4a;text-decoration:underline;text-underline-offset:3px}
        .c-text a:hover{color:#1a1816}
        .c-text ul{margin:0 0 16px;padding-left:20px}
        .c-text li{margin-bottom:8px}

        /* Tabele tehnice */
        .c-table-scroll{overflow-x:auto;margin-top:16px}
        .c-table{width:100%;min-width:520px;border-collapse:collapse;font-size:12px}
        .c-table th{text-align:left;padding:10px 12px 10px 0;border-bottom:1px solid rgba(42,39,35,0.1);color:#1a1816;font-weight:500;text-transform:uppercase;letter-spacing:0.1em}
        .c-table td{padding:12px 12px 12px 0;border-bottom:1px solid rgba(42,39,35,0.05);color:#5c554c;vertical-align:top}

        .c-id{width:100%;border-collapse:collapse;font-size:12.5px;margin-top:8px}
        .c-id th{text-align:left;width:34%;padding:10px 12px 10px 0;border-bottom:1px solid rgba(42,39,35,0.05);color:#8c8275;font-weight:400;vertical-align:top}
        .c-id td{padding:10px 0;border-bottom:1px solid rgba(42,39,35,0.05);color:#1a1816;vertical-align:top}

        .c-links{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:48px;padding-top:24px;border-top:1px solid rgba(42,39,35,0.08)}
        .c-link{font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#8c8275;text-decoration:none;transition:color 0.2s}
        .c-link:hover{color:#1a1816}

        @media (max-width:600px){
          .c-wrap{padding:110px 20px 70px}
          .c-card{padding:26px 20px}
          .c-id th{width:42%}
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
          <div className="c-eyebrow">Cadru Legal GDPR</div>
          <h1 className="c-title">Politica de <em>confidențialitate</em>.</h1>
          <p className="c-updated">Ultima actualizare: {LAST_UPDATE}</p>

          {/* 01 */}
          <div className="c-card">
            <h2 className="c-section-title">01 / Operatorul de date</h2>
            <div className="c-text">
              <p>
                Datele cu caracter personal sunt prelucrate de{' '}
                <strong>{COMPANY.name}</strong>, operatorul economic care administrează biroul de proiectare
                și consultanță arhitecturală <strong>{COMPANY.brand}</strong> și platforma{' '}
                <strong>{COMPANY.site}</strong>, în conformitate cu Regulamentul (UE) 2016/679 (GDPR) și
                legislația română aplicabilă cu baza de date administrata in regim SAAS prin platforma supabase.com.
              </p>
              <table className="c-id">
                <tbody>
                  <tr><th>Denumire</th><td>{COMPANY.name}</td></tr>
                  <tr><th>Marcă / site</th><td>{COMPANY.brand} — {COMPANY.site}</td></tr>
                  <tr><th>CUI</th><td>{COMPANY.cui}</td></tr>
                  <tr><th>Nr. Reg. Com.</th><td>{COMPANY.regCom}</td></tr>
              
                </tbody>
              </table>
            </div>
          </div>

          {/* 02 */}
          <div className="c-card">
            <h2 className="c-section-title">02 / Datele colectate și scopurile prelucrării</h2>
            <div className="c-text">
              <p>
                Prelucrăm doar datele necesare pentru serviciile noastre: arhitectură și proiectare
                rezidențială și comercială, consultanță, autorizare, modelare 3D/4D, analiză nZEB și
                magazinul digital de modele și obiecte arhitecturale 3D.
              </p>
              <div className="c-table-scroll">
                <table className="c-table">
                  <thead>
                    <tr>
                      <th style={{ width: '28%' }}>Categorie de date</th>
                      <th style={{ width: '44%' }}>Scopul prelucrării</th>
                      <th style={{ width: '28%' }}>Temei juridic</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Identitate</strong> (nume, prenume)</td>
                      <td>Întocmirea ofertelor, contractelor și a documentației tehnice.</td>
                      <td>Executarea contractului </td>
                    </tr>
                    <tr>
                      <td><strong>Contact</strong> (e-mail, telefon, WhatsApp)</td>
                      <td>Răspunsuri la solicitări, trimiterea randărilor, devizelor și a consultanței.</td>
                      <td>Consimțământ / măsuri precontractuale </td>
                    </tr>
                    <tr>
                      <td><strong>Date cadastrale, schițe, acte de proprietate</strong></td>
                      <td>Analiza spațială, studii de proiectare, documentații pentru autorizare.</td>
                      <td>Executarea contractului </td>
                    </tr>
                    <tr>
                      <td><strong>Cont Smart Connect</strong> (e-mail, parolă, istoric comenzi)</td>
                      <td>Autentificare, acces la comenzile și fișierele digitale achiziționate.</td>
                      <td>Executarea contractului </td>
                    </tr>
                    <tr>
                      <td><strong>Date de facturare</strong> (nume/denumire, adresă, CUI)</td>
                      <td>Emiterea facturilor și îndeplinirea obligațiilor fiscale și contabile.</td>
                      <td>Obligație legală </td>
                    </tr>
                    <tr>
                      <td><strong>Date tehnice</strong> (IP, tip dispozitiv, cookie-uri)</td>
                      <td>Funcționarea și securitatea site-ului, statistici, după caz.</td>
                      <td>Interes legitim / consimțământ, conform Politicii de Cookie</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p style={{ marginTop: 16 }}>
                Plățile din magazin sunt procesate de un procesator de plăți autorizat      <a href="https://www.stripe.com" target="_blank" rel="noopener noreferrer">
                  stripe.com
                </a>. (Visa / Mastercard).
                Nu stocăm datele complete ale cardului dumneavoastră, datele sunt stocate in infrastructura stripe.com.
              </p>
            </div>
          </div>

          {/* 03 */}
          <div className="c-card">
            <h2 className="c-section-title">03 / Destinatari și transferuri</h2>
            <div className="c-text">
              <p>Datele pot fi comunicate, strict în măsura necesară, către:</p>
              <ul>
                <li>furnizori de servicii de hosting, infrastructură IT și comunicare (de exemplu WhatsApp);</li>
                <li>procesatorul de plăți al magazinului online;</li>
                <li>contabil și, după caz, colaboratori de specialitate (topografi, ingineri de structuri și instalații, verificatori);</li>
                <li>autorități publice (primării, ANAF, instituții cu atribuții de avizare și autorizare), când legea o cere sau pentru dosarele pe care ni le-ați încredințat.</li>
              </ul>
              <p>
                Nu vindem datele personale. Dacă un furnizor se află în afara Spațiului Economic European,
                transferul se face doar cu garanții adecvate prevăzute de GDPR.
              </p>
            </div>
          </div>

          {/* 04 */}
          <div className="c-card">
            <h2 className="c-section-title">04 / Durata stocării</h2>
            <div className="c-text">
              <p>
                Păstrăm datele cât timp este necesar scopului pentru care au fost colectate și pe
                durata cerută de lege:
              </p>
              <ul>
                <li>documentele fiscale și contabile — conform termenelor legale de arhivare;</li>
                <li>documentația de proiect și corespondența aferentă — pe durata contractului și a perioadei de garanție/răspundere profesională;</li>
                <li>solicitările fără contract încheiat — până la 12 luni de la ultima interacțiune;</li>
                <li>contul Smart Connect — cât timp contul este activ sau până la cererea de ștergere.</li>
              </ul>
            </div>
          </div>

          {/* 05 */}
          <div className="c-card">
            <h2 className="c-section-title">05 / Drepturile dumneavoastră</h2>
            <div className="c-text">
              <p>În calitate de persoană vizată, aveți dreptul de:</p>
              <ul>
                <li>acces la datele prelucrate și la o copie a acestora;</li>
                <li>rectificare a datelor inexacte sau incomplete;</li>
                <li>ștergere („dreptul de a fi uitat”), când nu există obligația legală de păstrare;</li>
                <li>restricționare a prelucrării;</li>
                <li>portabilitate a datelor, într-un format structurat;</li>
                <li>opoziție la prelucrările bazate pe interes legitim;</li>
                <li>retragere a consimțământului, oricând, fără a afecta prelucrările anterioare.</li>
              </ul>
              <p>
                Pentru exercitarea drepturilor, scrieți-ne la proiectearh4d@gmail.com. Vă răspundem în cel mult
                30 de zile. Aveți și dreptul de a depune o plângere la Autoritatea Națională de
                Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP) —{' '}
                <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer">
                  dataprotection.ro
                </a>.
              </p>
            </div>
          </div>

          {/* 06 */}
          <div className="c-card">
            <h2 className="c-section-title">06 / Securitate și modificări</h2>
            <div className="c-text">
              <p>
                Aplicăm măsuri tehnice și organizatorice pentru protejarea datelor: conexiune criptată
                (HTTPS), acces restricționat la fișierele de proiect și stocare digitală securizată.
              </p>
              <p>
                Putem actualiza această politică pentru a reflecta schimbări legislative sau ale
                serviciilor noastre. Versiunea în vigoare este cea publicată pe această pagină, cu data
                ultimei actualizări indicată mai sus.
              </p>
            </div>
          </div>

          <div className="c-links">
            <Link href="/politica-cookie" className="c-link">Politica de Cookie</Link>
            <Link href="/termeni-conditii" className="c-link">Termeni și condiții</Link>
            <Link href="/" className="c-link">← Home</Link>
          </div>
        </div>

        <Footer />
      </div>
    </>
  )
}