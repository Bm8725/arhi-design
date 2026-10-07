'use client';
// Plasează fișierul în: src/app/kiosk/page.tsx  ->  proarh4d.ro/kiosk
// Produsele active din shop vin din Supabase (tabelul "products"), la fel ca în app/shop/page.
// Imaginile /plan.webp și /design.webp sunt cele din folderul public al site-ului.
// Comenzi: săgeți sau click stânga/dreapta = schimbă foaia, Spațiu = pauză, F sau butonul = ecran complet.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Proj = { title: string; place: string; area?: string; status?: string; images: string[] };
type Sheet = { id: string; title: string; ms: number; product?: any; project?: Proj };

const SHEETS: Sheet[] = [
  { id: 'brand', title: 'Prezentare', ms: 8000 },
  { id: 'wipe', title: 'De la schiță la randare', ms: 10000 },
  { id: 'servicii', title: 'Servicii', ms: 9000 },
  { id: 'shop', title: 'Shop 3D', ms: 9000 },
];

const STEPS = [
  ['Concept', 'Schițe și randări 3D pentru case, vile și spații comerciale.'],
  ['Consultanță', 'Soluții nZEB, materiale și detalii care țin de la proiect la șantier.'],
  ['Autorizare', 'Documentații complete pentru avize și autorizația de construire.'],
  ['Execuție', 'Detalii de execuție și urmărirea lucrării pe teren.'],
];

// Copie compactă a listei PROJECTS din pagina de portofoliu (pozele sunt din /public).
// Ideal: mută lista într-un fișier comun (ex. src/data/projects.ts) și importă-o în ambele pagini.
const PROJECTS: Proj[] = [
  { title: 'Vila Dutescu', place: 'Padina-Lăptici, Moroeni', area: '380 m²', status: 'Construit',
    images: ['/dutescu.png', '/dutescu2.png', '/dutescu3.png', '/dutescu4.png'] },
  { title: 'Biserică parohială, Parohia Poroinica I', place: 'Tețcoiu, Mătăsaru', area: '130 m²', status: 'În execuție',
    images: ['/biserica.png', '/biserica1.png', '/biserica2.png', '/biserica3.png', '/biserica4.png'] },
  { title: 'Locuință unifamilială contemporană P+1', place: 'Privat', area: '224 m²', status: 'Realizat',
    images: ['/barbu.png', '/barbu1.png', '/barbu2.png', '/barbu3.png', '/barbu4.png', '/barbu5.png'] },
  { title: 'Locuință P+1 cu garaj', place: 'Str. Înfrățirii, Târgoviște', area: '286,80 m²', status: 'Realizat',
    images: ['/dobra1.png', '/dobra2.png', '/dobra3.png', '/dobra4.png', '/dobra5.png'] },
  { title: 'Sediu firmă GEO-STING', place: 'Str. Petru Cercel, Târgoviște',
    images: ['/geo.png', '/geo1.png', '/geo2.png', '/geo3.png', '/geo41.jpg', '/geo5.jpg', '/geo6.jpg'] },
];

const PROJECT_SHEETS: Sheet[] = PROJECTS.map((p, k) => ({
  id: `w-${k}`,
  title: 'Lucrări',
  ms: Math.min(12000, Math.max(7000, p.images.length * 2400)),
  project: p,
}));

// Tot ce se încarcă înainte de pornirea prezentării.
const ASSETS: string[] = ['/plan.webp', '/design.webp', '/arhi4d.png', ...PROJECTS.flatMap((p) => p.images)];

// Galerie: pozele se schimbă singure, cu zoom lent.
function Gallery({ images, title }: { images: string[]; title: string }) {
  const [k, setK] = useState(0);
  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setK((v) => (v + 1) % images.length), 2400);
    return () => clearInterval(t);
  }, [images.length]);
  return (
    <div className="gal">
      {images.map((src, j) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt={j === k ? title : ''} className={j === k ? 'on' : ''} />
      ))}
      <div className="dots" aria-hidden="true">
        {images.map((src, j) => (
          <i key={src} className={j === k ? 'on' : ''} />
        ))}
      </div>
    </div>
  );
}

// Casa se desenează singură pe foaia de prezentare: [traseu, întârziere în secunde, cotă aurie]
const PATHS: [string, number, boolean][] = [
  ['M20 250H380', 0.7, false], ['M70 250V140H250V250', 1.0, false], ['M55 140L160 70L265 140', 1.5, false],
  ['M250 250V170H340V250', 1.9, false], ['M250 170H340', 2.0, false], ['M200 105V70H222V120', 2.3, false],
  ['M130 250V195H165V250', 2.2, false], ['M85 165H115V195H85Z', 2.4, false], ['M185 165H235V200H185Z', 2.5, false],
  ['M275 195H320V225H275Z', 2.6, false], ['M70 275H340', 2.9, true], ['M70 268V282', 3.0, true],
  ['M340 268V282', 3.0, true], ['M372 250V70', 3.1, true], ['M365 70H379', 3.2, true], ['M365 250H379', 3.2, true],
];

function Price({ value }: { value: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(value); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0 - 200) / 1400);
      setV(value * (1 - Math.pow(1 - Math.max(0, k), 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{v.toFixed(2)} lei</>;
}

export default function Kiosk() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hideCursor, setHideCursor] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [full, setFull] = useState(false);
  const [time, setTime] = useState('');
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(0);
  // Foile fixe, plus câte o foaie pentru fiecare produs activ din shop.
  const sheets = useMemo<Sheet[]>(() => {
    const head = SHEETS.filter((x) => x.id !== 'shop');
    const tail: Sheet[] = products.length
      ? products.map((p) => ({ id: `p-${p.id}`, title: 'Shop 3D', ms: 8000, product: p }))
      : SHEETS.filter((x) => x.id === 'shop');
    return [...head, ...PROJECT_SHEETS, ...tail];
  }, [products]);
  const n = sheets.length;
  const cur = i % n;
  const hold = paused || !ready;

  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);

  const toggleFull = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  }, []);

  useEffect(() => {
    const onChange = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Ține ecranul aprins (Screen Wake Lock API). Se reia când revii în pagină, la primul gest și din minut în minut.
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    let alive = true;
    const acquire = async () => {
      if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') return;
      if (lock && !lock.released) return;
      try {
        const l = await navigator.wakeLock.request('screen');
        if (alive) lock = l;
        else l.release();
      } catch {}
    };
    const onVis = () => { if (document.visibilityState === 'visible') acquire(); };
    acquire();
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pointerdown', acquire);
    window.addEventListener('keydown', acquire);
    const t = setInterval(acquire, 60000);
    return () => {
      alive = false;
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointerdown', acquire);
      window.removeEventListener('keydown', acquire);
      lock?.release().catch(() => {});
    };
  }, []);

  // Încarcă și decodează toate imaginile înainte să pornească rularea (maximum 25 de secunde).
  useEffect(() => {
    let alive = true;
    let done = 0;
    const timeout = setTimeout(() => alive && setReady(true), 25000);
    ASSETS.forEach((src) => {
      const im = new Image();
      im.src = src;
      const ok = () => {
        done += 1;
        if (!alive) return;
        setLoaded(done);
        if (done === ASSETS.length) { clearTimeout(timeout); setReady(true); }
      };
      (im.decode ? im.decode() : Promise.resolve()).then(ok, ok);
    });
    return () => { alive = false; clearTimeout(timeout); };
  }, []);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }));
    tick();
    const t = setInterval(tick, 15000);
    return () => clearInterval(t);
  }, []);

  // Produsele active din shop, reîmprospătate la 5 minute.
  useEffect(() => {
    const supabase = createClient();
    let alive = true;
    const load = async () => {
      const { data } = await supabase
        .from('products')
        .select('id, nume, categorie, descriere_scurta, descriere, pret, imagine_url')
        .eq('activ', true)
        .order('created_at', { ascending: false })
        .limit(6);
      if (!alive || !data) return;
      setProducts(data);
      data.forEach((p: any) => {
        if (!p.imagine_url) return;
        const im = new Image();
        im.src = p.imagine_url;
        im.decode().catch(() => {});
      });
    };
    load();
    const t = setInterval(load, 5 * 60 * 1000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  useEffect(() => {
    if (hold) return;
    const t = setTimeout(() => go(1), sheets[cur].ms);
    return () => clearTimeout(t);
  }, [cur, hold, go, sheets]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === ' ') { e.preventDefault(); setPaused((p) => !p); }
      else if (e.key.toLowerCase() === 'f') toggleFull();
    };
    let idle: ReturnType<typeof setTimeout> | undefined;
    const onMove = () => {
      setHideCursor(false);
      clearTimeout(idle);
      idle = setTimeout(() => setHideCursor(true), 2500);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousemove', onMove);
    onMove();
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousemove', onMove);
      clearTimeout(idle);
    };
  }, [go, toggleFull]);

  const s = sheets[cur];

  return (
    <main className={`k ${hideCursor ? 'nocursor' : ''}`} aria-label="Prezentare Proarh.4D">
      <style>{css}</style>

      <button className="fs" onClick={toggleFull}>
        {full ? 'Ieși din ecran complet' : 'Ecran complet'}
      </button>

      <div className={`boot${ready ? ' gone' : ''}`} aria-hidden={ready}>
        <strong>Arh. Bogdan Șotîngeanu</strong>
        <div className="bar"><i style={{ width: `${Math.round((loaded / ASSETS.length) * 100)}%` }} /></div>
        <span>Se încarcă imaginile, {loaded} din {ASSETS.length}</span>
      </div>

      <header className="top">
        <strong>Arh. Bogdan Șotîngeanu</strong>
        <span>Birou de proiectare și consultanță arhitecturală</span>
      </header>

      <button className="hit left" onClick={() => go(-1)} aria-label="Foaia anterioară" />
      <button className="hit right" onClick={() => go(1)} aria-label="Foaia următoare" />

      {ready ? (
      <section key={s.id} className={`sheet${s.project ? ' full' : ''}`} aria-live="polite">
{s.id === 'brand' && (
  <div className="sheet-brand" style={{ 
    display: 'flex', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    gap: '5rem', 
    height: '100%', 
    padding: '0 4rem',
    animation: 'fadeInUp 1s ease-out forwards'
  }}>
    {/* Definiție animație direct în stil inline (alternativ o poți pune în CSS-ul tău global) */}
    <style>{`
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes softZoom {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
    `}</style>

    {/* Textul în stânga */}
    <div style={{ flex: '1.2', textAlign: 'left' }}>
      <h1 style={{ fontSize: '4.5rem', fontWeight: 'bold', marginBottom: '1.5rem', lineHeight: '1.1', letterSpacing: '-0.02em' }}>
        Arhitectură & Design
      </h1>
      <p style={{ fontSize: '2rem', opacity: 0.8, lineHeight: '1.5', maxWidth: '500px' }}>
        Proiectare completă pentru construcții durabile.
      </p>
    </div>

    {/* Poza în dreapta */}
    <div className="brand-image-container" style={{ 
      flex: '1', 
      height: '65vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      animation: 'softZoom 1.2s ease-out forwards'
    }}>
      <img 
        src="/kiosk.png" 
        alt="Pro Arhi 4D" 
        style={{ 
          maxWidth: '100%', 
          maxHeight: '100%', 
          objectFit: 'contain', 
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)' 
        }} 
      />
    </div>
  </div>
)}




        {s.id === 'wipe' && (
          <div className="wipe">
            <div className="wipe-text">
              <h2>De la schiță la plan concret</h2>
              <p>Din liniile tehnice ale proiectului ajungem la randarea finală, înainte să se toarne prima fundație.</p>
            </div>
            <div className="stage">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/plan.webp" alt="Schiță tehnică" className="base" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/design.webp" alt="Randare 3D" className="top" />
              <i className="line" />
              <span className="tag t1">Schiță tehnică</span>
              <span className="tag t2">Randare 3D</span>
            </div>
          </div>
        )}

        {s.id === 'servicii' && (
          <div className="list">
            <h2>De la prima idee la autorizație</h2>
            <ol>
              {STEPS.map(([a, b], k) => (
                <li key={a} style={{ animationDelay: `${0.2 + 0.15 * k}s` }}>
                  <b>{k + 1}</b>
                  <strong>{a}</strong>
                  <span>{b}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {s.project && (
          <div className="work">
            <Gallery images={s.project.images} title={s.project.title} />
            <div className="cap">
              <h2>{s.project.title}</h2>
              <p>{s.project.place}</p>
              {(s.project.area || s.project.status) && (
                <p className="meta">{[s.project.area, s.project.status].filter(Boolean).join('   ')}</p>
              )}
            </div>
          </div>
        )}

        {s.product && (
          <div className="prod">
            <div className="pic">
              {s.product.imagine_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.product.imagine_url} alt={s.product.nume} />
              ) : (
                <span>Model 3D</span>
              )}
            </div>
            <div className="info">
              <p className="cat">{s.product.categorie || 'Digital'}</p>
              <h2>{s.product.nume}</h2>
              <p className="desc">{s.product.descriere_scurta || s.product.descriere}</p>
              <p className="price"><Price value={Number(s.product.pret) || 0} /></p>
              <div className="url">proarh4d.ro/shop</div>
            </div>
          </div>
        )}

        {s.id === 'shop' && (
          <div className="shop">
            <h2>Modele 3D și obiecte arhitecturale</h2>
            <p>Găsești modelele noastre în magazinul online.</p>
            <div className="url">proarh4d.ro/shop</div>
          </div>
        )}
      </section>
      ) : (
        <div />
      )}

      <div className="ticker" aria-hidden="true">
        <div>
          {'Proiectare rezidențială   Randări 3D   Consultanță nZEB   Autorizare   Execuție   Modele 3D în shop   '.repeat(2)}
        </div>
      </div>

      <footer className="block">
        <div className="who">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/arhi4d.png" alt="" width="28" height="28" />
          <b>Proarh.4D</b>
          <span>proarh4d.ro</span>
        </div>
        <div className="what">{s.title}</div>
        <div className="num">
          <b className="clock">{time}</b>
          Foaia {cur + 1} din {n}
          {paused ? ' · pauză' : ''}
        </div>
        <div className="bars" aria-hidden="true">
          {sheets.map((x, k) => (
            <div key={x.id} className={k < cur ? 'done' : ''}>
              {k === cur && (
                <u
                  key={`${cur}-${paused}`}
                  style={{ animationDuration: `${x.ms}ms`, animationPlayState: hold ? 'paused' : 'running' }}
                />
              )}
            </div>
          ))}
        </div>
      </footer>
    </main>
  );
}

const css = `
.k{--ink:#fbf9f4;--paper:#1a1a1a;--concrete:#5f5b53;--wood:#8f7125;--gold:#bfa054;
  position:fixed;inset:0;background:var(--ink);color:var(--paper);overflow:hidden;
  font-family:"DM Mono",ui-monospace,monospace;display:grid;grid-template-rows:auto 1fr auto auto;
  background-image:linear-gradient(rgba(26,26,26,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(26,26,26,.045) 1px,transparent 1px);
  background-size:6vmin 6vmin;animation:pan 24s linear infinite}
.k.nocursor{cursor:none}
.k h1,.k h2,.k p,.k ol,.k ul{margin:0;padding:0}
.fs{position:fixed;top:2vmin;right:2vmin;z-index:6;padding:.7em 1.2em;background:var(--ink);color:var(--paper);
  border:1px solid rgba(26,26,26,.5);font:inherit;font-size:clamp(.8rem,1.9vmin,1.2rem);cursor:pointer;transition:opacity .4s}
.fs:hover{border-color:var(--wood)}
.fs:focus-visible{outline:2px solid var(--wood);outline-offset:2px}
.k.nocursor .fs{opacity:0;pointer-events:none}
.hit{position:absolute;top:0;bottom:0;width:30%;z-index:3;background:none;border:0;cursor:inherit}
.hit.left{left:0}.hit.right{right:0}
.hit:focus-visible{outline:2px solid var(--wood);outline-offset:-4px}
.sheet{position:relative;padding:7vmin 8vmin;display:flex;min-height:0;overflow:hidden;animation:in .5s ease both}
@keyframes in{from{opacity:0}to{opacity:1}}

.brand{align-self:center}
.brand h1{font-weight:700;font-size:clamp(3rem,13vmin,10rem);line-height:.9;letter-spacing:-.04em;display:flex;flex-direction:column}
.brand h1 span:nth-child(2){padding-left:.5em}
.brand h1 span:nth-child(3){padding-left:1em}
.brand p{margin-top:5vmin;max-width:34ch;font-size:clamp(1rem,2.6vmin,2rem);color:var(--concrete);line-height:1.35}

.wipe{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.6fr);gap:6vmin;width:100%;align-items:center}
.wipe h2,.list h2,.shop h2{font-weight:700;letter-spacing:-.03em;line-height:1;font-size:clamp(1.8rem,6vmin,5rem);max-width:14ch}
.wipe-text p{margin-top:3vmin;color:var(--concrete);font-size:clamp(.95rem,2.2vmin,1.6rem);line-height:1.4;max-width:30ch}
.stage{position:relative;aspect-ratio:16/10;max-height:100%;width:100%;border:1px solid rgba(26,26,26,.35);overflow:hidden;background:#e6e1d5}
.stage img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.stage .top{clip-path:inset(0 100% 0 0);animation:reveal 5s cubic-bezier(.6,0,.3,1) .8s forwards}
.stage .line{position:absolute;top:0;bottom:0;left:0;width:2px;background:var(--wood);animation:slide 5s cubic-bezier(.6,0,.3,1) .8s forwards}
@keyframes reveal{to{clip-path:inset(0 0 0 0)}}
@keyframes slide{to{left:calc(100% - 2px)}}
.tag{position:absolute;bottom:2vmin;padding:.4em .8em;background:var(--ink);font-size:clamp(.75rem,1.8vmin,1.2rem)}
.t1{left:2vmin}.t2{right:2vmin}

.list{align-self:center;width:100%}
.list h2{max-width:20ch;margin-bottom:5vmin}
.list ol,.list ul{list-style:none;border-top:1px solid rgba(26,26,26,.35)}
.list li{display:grid;align-items:baseline;gap:3vmin;padding:2.4vmin 0;border-bottom:1px solid rgba(26,26,26,.35)}
.list ol li{grid-template-columns:4vmin minmax(0,.55fr) minmax(0,1.6fr);animation:in .6s ease both}
.list ul li{grid-template-columns:minmax(0,1.6fr) minmax(0,.6fr)}
.list b{color:var(--wood);font-weight:400;font-size:clamp(.9rem,2.4vmin,1.8rem)}
.list strong{font-weight:700;font-size:clamp(1.3rem,4.2vmin,3.4rem);letter-spacing:-.02em}
.list span{color:var(--concrete);font-size:clamp(.9rem,2.3vmin,1.7rem);line-height:1.35}
.list ul span{text-align:right}

.shop{align-self:center}
.shop p{margin-top:3vmin;color:var(--concrete);font-size:clamp(1rem,2.6vmin,2rem)}
.url{margin-top:7vmin;display:inline-block;padding:2.4vmin 3.6vmin;border:2px solid var(--wood);font-weight:700;letter-spacing:-.02em;font-size:clamp(1.6rem,7vmin,6rem)}

.block{position:relative;z-index:4;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:3vmin;
  padding:2vmin 4vmin 2.6vmin;border-top:1px solid rgba(26,26,26,.35);background:var(--ink);font-size:clamp(.75rem,1.9vmin,1.3rem)}
.who{display:flex;align-items:center;gap:1.2vmin}.who span{color:var(--concrete)}
.what{text-align:center}.num{text-align:right;color:var(--concrete)}
.bars{position:absolute;left:0;right:0;top:0;display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:3px;height:3px;transform:translateY(-100%)}
.bars div{background:rgba(26,26,26,.18)}.bars .done{background:var(--paper)}
.bars u{display:block;height:100%;background:var(--wood);transform-origin:left;animation:fill linear forwards}
@keyframes fill{from{transform:scaleX(0)}to{transform:scaleX(1)}}

.k h1,.k h2,.k .list strong{font-family:"Playfair Display",Georgia,serif;font-weight:500}
.prod{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:6vmin;width:100%;align-items:center}
.pic{aspect-ratio:4/3;max-height:100%;border:2px solid var(--paper);box-shadow:1.2vmin 1.2vmin 0 var(--gold);background:#efe9dc;overflow:hidden;display:grid;place-items:center;color:var(--concrete)}
.pic img{width:100%;height:100%;object-fit:cover}
.info h2{font-size:clamp(1.8rem,6.5vmin,5.5rem);line-height:1;letter-spacing:-.02em;max-width:14ch}
.info .cat{color:var(--wood);font-size:clamp(.8rem,1.9vmin,1.3rem);margin-bottom:2vmin}
.info .desc{margin-top:3vmin;color:var(--concrete);font-size:clamp(.95rem,2.3vmin,1.7rem);line-height:1.45;max-width:36ch;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.info .price{margin-top:4vmin;font-size:clamp(1.6rem,5.5vmin,4.5rem);font-weight:700}
.info .url{margin-top:4vmin;font-size:clamp(1rem,3vmin,2.4rem);padding:1.6vmin 2.4vmin}
.k::before{content:'';position:absolute;inset:-20%;pointer-events:none;background:radial-gradient(ellipse 40% 32% at 22% 30%,rgba(191,160,84,.17),transparent 70%);animation:drift 26s ease-in-out infinite alternate}
.brandwrap{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:4vmin;width:100%;align-items:center}
.brand h1 span{display:block;overflow:hidden;padding:.1em 0 .16em}
.brand h1 em{display:block;font-style:normal;transform:translateY(115%);animation:rise 1s cubic-bezier(.2,.8,.2,1) forwards}
.draw{width:100%;max-height:62vh;overflow:visible}
.draw path{stroke:var(--paper);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;animation:draw 1.1s ease forwards}
.draw path.g{stroke:var(--gold)}
.k .list li{position:relative;border-bottom:0;animation:in2 .7s ease both}
.list li::after{content:'';position:absolute;left:0;right:0;bottom:0;height:1px;background:var(--paper);opacity:.4;transform:scaleX(0);transform-origin:left;animation:grow .9s ease forwards;animation-delay:inherit}
.pic{animation:sh 1s ease .2s both}
.pic img{animation:kb 14s ease-out both}
.info>*{animation:up .8s ease both}
.info>:nth-child(1){animation-delay:.2s}.info>:nth-child(2){animation-delay:.35s}.info>:nth-child(3){animation-delay:.5s}
.info>:nth-child(4){animation-delay:.65s}.info>:nth-child(5){animation-delay:.8s}
.ticker{position:relative;z-index:4;overflow:hidden;white-space:nowrap;background:var(--ink);border-top:1px solid rgba(26,26,26,.35);padding:1.1vmin 0;font-size:clamp(.7rem,1.7vmin,1.1rem);color:var(--concrete)}
.ticker div{display:inline-block;padding-left:100%;animation:marq 60s linear infinite}
.clock{margin-right:2.4vmin;color:var(--paper)}
.top{position:relative;z-index:4;display:flex;align-items:baseline;gap:3vmin;padding:2.2vmin 4vmin;background:var(--ink);border-bottom:1px solid rgba(26,26,26,.35)}
.top strong{font-family:"Playfair Display",Georgia,serif;font-weight:500;font-size:clamp(1.1rem,3.4vmin,2.6rem);letter-spacing:-.01em}
.top span{color:var(--concrete);font-size:clamp(.7rem,1.8vmin,1.2rem)}
.boot{position:absolute;inset:0;z-index:7;display:grid;place-content:center;justify-items:center;gap:3vmin;background:var(--ink);transition:opacity .7s ease,visibility .7s}
.boot.gone{opacity:0;visibility:hidden}
.boot strong{font-family:"Playfair Display",Georgia,serif;font-weight:500;font-size:clamp(1.6rem,6vmin,4.5rem)}
.boot .bar{width:min(40vw,60vmin);height:2px;background:rgba(26,26,26,.2)}
.boot .bar i{display:block;height:100%;background:var(--paper);transition:width .3s ease}
.boot span{color:var(--concrete);font-size:clamp(.75rem,1.8vmin,1.2rem)}
.sheet.full{padding:0}
.work{position:absolute;inset:0}
.gal{position:absolute;inset:0;background:#e9e4d8}
.gal img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 1s ease}
.gal img.on{opacity:1;animation:kb2 2.8s ease-out both}
.dots{position:absolute;right:4vmin;bottom:5vmin;display:flex;gap:.9vmin;padding:1.2vmin 1.6vmin;background:rgba(26,26,26,.6)}
.dots i{width:3vmin;height:3px;background:rgba(255,255,255,.4)}
.dots i.on{background:#fff}
.cap{position:absolute;left:5vmin;bottom:5vmin;z-index:1;max-width:min(46ch,62vw);padding:3vmin 3.4vmin;background:var(--ink);
  border:2px solid var(--paper);box-shadow:1.2vmin 1.2vmin 0 var(--gold);animation:up .8s ease .3s both}
.cap h2{font-size:clamp(1.4rem,4.4vmin,3.6rem);line-height:1.05;letter-spacing:-.02em}
.cap p{margin-top:1.4vmin;color:var(--concrete);font-size:clamp(.85rem,2vmin,1.4rem)}
.cap .meta{color:var(--wood)}
@keyframes kb2{from{transform:scale(1.1)}}
@keyframes rise{to{transform:none}}
@keyframes draw{to{stroke-dashoffset:0}}
@keyframes curtain{to{transform:scaleX(0)}}
@keyframes in2{from{opacity:0;transform:translateX(-3vmin)}}
@keyframes grow{to{transform:scaleX(1)}}
@keyframes kb{from{transform:scale(1.16)}to{transform:scale(1)}}
@keyframes up{from{opacity:0;transform:translateY(2.5vmin)}}
@keyframes sh{from{box-shadow:0 0 0 var(--gold)}}
@keyframes marq{to{transform:translateX(-100%)}}
@keyframes drift{to{transform:translate(8%,10%)}}
@keyframes pan{to{background-position:6vmin 6vmin,6vmin 6vmin}}
@media (max-aspect-ratio:1/1){
  .wipe,.prod,.brandwrap{grid-template-columns:1fr;gap:4vmin}
  .draw{max-height:28vh}.wipe h2{max-width:none}
  .list ol li{grid-template-columns:5vmin 1fr}.list ol li span{grid-column:2}
  .block{grid-template-columns:1fr auto}
  .top span{display:none}.what{display:none}
}
@media (prefers-reduced-motion:reduce){
  .k,.k::before,.info>*,.pic,.pic img,.k .list li,.gal img.on,.cap{animation:none}
  .brand h1 em{animation:none;transform:none}
  .draw path{animation:none;stroke-dashoffset:0}
  .list li::after{animation:none;transform:none}
  .ticker div{animation:none;padding-left:0}
  .sheet,.list li{animation:none}
  .stage .top{animation:none;clip-path:inset(0 50% 0 0)}
  .stage .line{animation:none;left:50%}
}
`;