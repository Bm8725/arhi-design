"use client";

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'


const COMPANY = {
  name: 'PROIECTEARH 4D S.R.L.',
  brand: 'PROARH.4D',
  site: 'proarh4d.ro',
  cui: '36685509',
  regCom: 'J15/1090/28/10/2016',
  email: 'proiectearh4d@gmail.com', // 
}
const LAST_UPDATE = 'noiembrie 2026'

export default function TermeniConditiiPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap');
        .c-root *,.c-root *::before,.c-root *::after{box-sizing:border-box}

        /* Fundal Universal Clar - Alb Complet / Stil Interfață Curată */
        .c-root{min-height:100vh;background:#ffffff;font-family:'DM Mono',monospace;color:#111111;position:relative;overflow-x:hidden}

        .c-grid{position:fixed;inset:0;pointer-events:none;z-index:0;background-image:linear-gradient(rgba(0,0,0,0.01) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.01) 1px,transparent 1px);background-size:40px 40px}

        .c-wrap{position:relative;z-index:1;max-width:800px;margin:0 auto;padding:140px 24px 100px;min-height:100vh;display:flex;flex-direction:column;opacity:0;transform:translateY(10px);transition:opacity 0.4s ease,transform 0.4s ease}
        .c-wrap.ready{opacity:1;transform:translateY(0)}

        .c-eyebrow{font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#666666;margin-bottom:12px}
        .c-title{font-size:clamp(28px,4vw,40px);font-weight:400;line-height:1.3;color:#000000;letter-spacing:-0.02em;margin:0 0 12px;text-transform:uppercase}
        .c-updated{font-size:11px;letter-spacing:0.1em;color:#888888;margin-bottom:40px}

        .c-card{background:#ffffff;border-bottom:1px solid rgba(0,0,0,0.08);padding:24px 0;margin-bottom:24px}
        .c-section-title{font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#000000;margin:0 0 12px;font-weight:600}

        .c-text{font-size:13px;line-height:1.7;color:#333333}
        .c-text p{margin:0 0 12px}
        .c-text p:last-child{margin-bottom:0}
        .c-text ul{margin:0 0 12px;padding-left:20px}
        .c-text li{margin-bottom:6px}
        .c-text a{color:#000000;text-decoration:underline;text-underline-offset:3px}

        .c-table-scroll{overflow-x:auto;margin-top:16px}
        .c-table{width:100%;min-width:480px;border-collapse:collapse;font-size:12px}
        .c-table th{text-align:left;padding:8px 12px 8px 0;border-bottom:1px solid #000000;color:#000000;font-weight:600;text-transform:uppercase;letter-spacing:0.05em}
        .c-table td{padding:10px 12px 10px 0;border-bottom:1px solid rgba(0,0,0,0.05);color:#444444;vertical-align:top}

        .c-id{width:100%;border-collapse:collapse;font-size:12.5px;margin-top:8px}
        .c-id th{text-align:left;width:34%;padding:8px 12px 8px 0;border-bottom:1px solid rgba(0,0,0,0.05);color:#777777;font-weight:400;vertical-align:top}
        .c-id td{padding:8px 0;border-bottom:1px solid rgba(0,0,0,0.05);color:#111111;vertical-align:top}

        .c-links{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:40px;padding-top:20px;border-top:1px solid rgba(0,0,0,0.1)}
        .c-link{font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#666666;text-decoration:none;transition:color 0.2s}
        .c-link:hover{color:#000000}

        @media (max-width:600px){
          .c-wrap{padding:110px 20px 70px}
          .c-id th{width:42%}
        }
        @media (prefers-reduced-motion:reduce){
          .c-wrap{transition:none;transform:none}
        }
      `}</style>

      <div className="c-root">
        <div className="c-grid" />
        <Navbar />

        <div className={`c-wrap${mounted ? ' ready' : ''}`}>
          <div className="c-eyebrow">Termeni legali // Contract digital</div>
          <h1 className="c-title">Termeni și condiții.</h1>
          <p className="c-updated">Ultima actualizare: {LAST_UPDATE}</p>

          {/* 01 */}
          <div className="c-card">
            <h2 className="c-section-title">01 / Dispoziții generale</h2>
            <div className="c-text">
              <p>
                Prezentul document stabilește regulile de utilizare a platformei <strong>{COMPANY.site}</strong> și
                condițiile de comercializare a serviciilor și produselor digitale oferite prin ea. Prin accesarea
                site-ului, crearea unui cont Smart Connect sau plasarea unei comenzi, confirmați că ați citit
                și acceptați acești termeni.
              </p>
              <p>Platforma este administrată de:</p>
              <table className="c-id">
                <tbody>
                  <tr><th>Operator economic</th><td>{COMPANY.name}</td></tr>
                  <tr><th>Marcă</th><td>{COMPANY.brand} — birou de proiectare și consultanță arhitecturală</td></tr>
                  <tr><th>CUI / Reg. Com.</th><td>{COMPANY.cui} / {COMPANY.regCom}</td></tr>

                </tbody>
              </table>
            </div>
          </div>

          {/* 02 */}
          <div className="c-card">
            <h2 className="c-section-title">02 / Servicii și produse oferite</h2>
            <div className="c-text">
              <p>Prin {COMPANY.site}, {COMPANY.name} oferă:</p>
              <ul>
                <li>servicii de proiectare și consultanță de arhitectură: concept, consultanță, documentații pentru autorizare, asistență pe durata execuției;</li>
                <li>randări 3D/4D, digitalizare și analize nZEB;</li>
                <li>produse digitale în magazinul online (modele 3D și obiecte arhitecturale), livrate sub formă de fișiere descărcabile.</li>
              </ul>
              <p>
                Serviciile de proiectare se prestează pe baza unui contract distinct, încheiat în scris sau
                în format digital. Informațiile de pe site, inclusiv portofoliul, au caracter de prezentare
                și nu constituie ofertă fermă.
              </p>
            </div>
          </div>

          {/* 03 */}
          <div className="c-card">
            <h2 className="c-section-title">03 / Proprietate intelectuală și livrabile</h2>
            <div className="c-text">
              <p>
                Conceptele, schițele CAD, randările 3D, imaginile și modelele prezentate sau vândute prin
                acest site aparțin {COMPANY.name} / autorului  și sunt protejate de legislația
                privind dreptul de autor. Achiziția unui model 3D din magazin conferă o licență de utilizare
                non-exclusivă; revânzarea, redistribuirea sau punerea la dispoziția terților a fișierelor
                sursă este interzisă.
              </p>

              <div className="c-table-scroll">
                <table className="c-table">
                  <thead>
                    <tr>
                      <th style={{ width: '30%' }}>Serviciu / produs</th>
                      <th style={{ width: '50%' }}>Drepturi de utilizare</th>
                      <th style={{ width: '20%' }}>Licență</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Proiectare & Arhitectură</strong></td>
                      <td>Drept de execuție, o singură dată, pentru conceptul autorizat (case, vile, clădiri administrative), pe amplasamentul și pentru beneficiarul din contract.</td>
                      <td>Unic / exclusiv</td>
                    </tr>
                    <tr>
                      <td><strong>Modele 3D & obiecte din shop</strong></td>
                      <td>Utilizare personală sau comercială, integrată în randări și proiecte proprii. Redistribuirea fișierelor este interzisă.</td>
                      <td>Non-exclusiv</td>
                    </tr>
                    <tr>
                      <td><strong>Randări & materiale media</strong></td>
                      <td>Prezentare în portofoliu, cu păstrarea semnăturii autorului Bogdan Șotîngeanu.</td>
                      <td>Protejat</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 04 */}
          <div className="c-card">
            <h2 className="c-section-title">04 / Cont Smart Connect</h2>
            <div className="c-text">
              <p>
                Contul vă oferă acces la comenzi și la fișierele achiziționate. Sunteți responsabil pentru
                păstrarea confidențialității datelor de autentificare și pentru activitatea desfășurată din
                cont. Datele furnizate trebuie să fie corecte și actualizate. Ne rezervăm dreptul de a
                suspenda conturile folosite abuziv sau contrar acestor termeni.
              </p>
            </div>
          </div>

          {/* 05 */}
          <div className="c-card">
            <h2 className="c-section-title">05 / Comenzi, prețuri și plată</h2>
            <div className="c-text">
              <ul>
                <li>Prețurile sunt afișate în lei (RON), cu TVA inclus acolo unde este aplicabil.</li>
                <li>Contractul se consideră încheiat la confirmarea comenzii de către {COMPANY.name}, după înregistrarea plății.</li>
                <li>Plata se face online cu cardul (Visa / Mastercard), prin intermediul unui procesator de plăți autorizat. Nu stocăm datele complete ale cardului.</li>
                <li>Factura se emite electronic și este disponibilă în cont sau trimisă pe e-mail.</li>
                <li>Serviciile de proiectare se tarifează conform ofertei sau contractului semnat, cu eșalonarea plăților prevăzută acolo.</li>
              </ul>
            </div>
          </div>

          {/* 06 */}
          <div className="c-card">
            <h2 className="c-section-title">06 / Livrare produse digitale</h2>
            <div className="c-text">
              <p>
                Produsele din magazin sunt livrate electronic, prin descărcare din contul Smart Connect sau
                prin link trimis pe e-mail, de regulă imediat după confirmarea plății. Nu există livrare
                fizică. În cazul în care descărcarea nu funcționează, ne puteți scrie la proiectearh4d@gmail.com
                și remediem problema.
              </p>
            </div>
          </div>

          {/* 07 */}
          <div className="c-card">
            <h2 className="c-section-title">07 / Dreptul de retragere</h2>
            <div className="c-text">
              <p>
                Consumatorii au, în principiu, dreptul de a se retrage din contractele la distanță în 14 zile,
                fără penalități și fără a justifica decizia, conform legislației privind protecția
                consumatorilor (OUG nr. 34/2014).
              </p>
              <p>
                Pentru <strong>conținutul digital livrat fără suport material</strong> (modele 3D descărcabile),
                dreptul de retragere se pierde odată cu începerea descărcării, dacă ați fost informat și ați
                consimțit expres în momentul comenzii. Pentru <strong>serviciile de proiectare</strong>, dacă
                prestarea începe la cererea dumneavoastră în perioada de retragere, veți datora proporțional
                valoarea serviciilor deja prestate.
              </p>
              <p>
                Pentru retragere, trimiteți o declarație clară la {COMPANY.email}.
              </p>
            </div>
          </div>

          {/* 08 */}
          <div className="c-card">
            <h2 className="c-section-title">08 / Limitarea răspunderii</h2>
            <div className="c-text">
              <p>
                Modelele digitale și informațiile din secțiunea de consultanță au scop conceptual și
                orientativ. {COMPANY.name} nu răspunde pentru erori rezultate din utilizarea fișierelor
                descărcate fără verificare tehnică sau fără adaptarea lor la contextul real al terenului de
                către specialiști autorizați (proiectanți de structuri, instalații, verificatori atestați).
                Orice proiect pentru autorizare sau execuție și orice documentație nZEB se realizează în
                baza unui contract distinct.
              </p>
              <p>
                Nu garantăm funcționarea neîntreruptă a site-ului și nu răspundem pentru întreruperi
                independente de voința noastră (mentenanță, furnizori terți, forță majoră). Nimic din acești
                termeni nu limitează drepturile legale ale consumatorilor.
              </p>
            </div>
          </div>

          {/* 09 */}
          <div className="c-card">
            <h2 className="c-section-title">09 / Date personale și cookie-uri</h2>
            <div className="c-text">
              <p>
                Prelucrarea datelor personale este descrisă în{' '}
                <Link href="/politica-confidentialitate">Politica de confidențialitate</Link>, iar utilizarea
                cookie-urilor în <Link href="/politica-cookie">Politica de Cookie</Link>.
              </p>
            </div>
          </div>

          {/* 10 */}
          <div className="c-card">
            <h2 className="c-section-title">10 / Reclamații, litigii și legea aplicabilă</h2>
            <div className="c-text">
              <p>
                Pentru reclamații, ne puteți scrie la {COMPANY.email}; vă răspundem în cel mult 30 de zile.
                Consumatorii pot apela și la{' '}
                <a href="https://anpc.ro" target="_blank" rel="noopener noreferrer">ANPC</a>, inclusiv la
                entitățile de soluționare alternativă a litigiilor (SAL) listate pe site-ul acesteia.
              </p>
              <p>
                Acești termeni sunt guvernați de legea română. Litigiile se soluționează amiabil, iar în
                lipsa unei înțelegeri, de instanțele române competente.
              </p>
              <p>
                Putem modifica acești termeni; versiunea în vigoare este cea publicată pe această pagină.
                Comenzile plasate anterior rămân supuse termenilor valabili la data plasării lor.
              </p>
            </div>
          </div>

          <div className="c-links">
            <Link href="/politica-confidentialitate" className="c-link">Confidențialitate</Link>
            <Link href="/politica-cookie" className="c-link">Cookie</Link>
            <Link href="/" className="c-link">← Home</Link>
          </div>
        </div>

        <Footer />
      </div>
    </>
  )
}