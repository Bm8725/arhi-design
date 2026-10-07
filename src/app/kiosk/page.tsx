'use client';
// Plasează fișierul în: src/app/kiosk/page.tsx  ->  proarh4d.ro/kiosk
// Produsele active din shop vin din Supabase (tabelul "products"), la fel ca în app/shop/page.
// Imaginile /plan.webp și /design.webp sunt cele din folderul public al site-ului.
// Comenzi: săgeți sau click stânga/dreapta = schimbă foaia, Spațiu = pauză, F sau butonul = ecran complet.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Sheet = { id: string; title: string; ms: number; product?: any };

const SHEETS: Sheet[] = [
  { id: 'brand', title: 'Prezentare', ms: 8000 },
  { id: 'wipe', title: 'De la schiță la randare', ms: 10000 },
  { id: 'servicii', title: 'Servicii', ms: 9000 },
  { id: 'lucrari', title: 'Lucrări recente', ms: 9000 },
  { id: 'shop', title: 'Shop 3D', ms: 9000 },
];

const STEPS = [
  ['Concept', 'Schițe și randări 3D pentru case, vile și spații comerciale.'],
  ['Consultanță', 'Soluții nZEB, materiale și detalii care țin de la proiect la șantier.'],
  ['Autorizare', 'Documentații complete pentru avize și autorizația de construire.'],
  ['Execuție', 'Detalii de execuție și urmărirea lucrării pe teren.'],
];

const WORKS = [
  ['Sediu firmă GEO-STING', 'Târgoviște'],
  ['Spații comerciale Micro VI', 'Târgoviște'],
  ['NIMET, zona industrială', 'Dâmbovița'],
  ['Ansamblu recreativ cu cazare și cramă', 'Târgoviște'],
  ['Parohia Poroinica, în execuție', 'Mătăsaru'],
];

export default function Kiosk() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hideCursor, setHideCursor] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [full, setFull] = useState(false);
  // Foile fixe, plus câte o foaie pentru fiecare produs activ din shop.
  const sheets = useMemo<Sheet[]>(() => {
    const base = SHEETS.filter((x) => x.id !== 'shop' || products.length === 0);
    return [...base, ...products.map((p) => ({ id: `p-${p.id}`, title: 'Shop 3D', ms: 8000, product: p }))];
  }, [products]);
  const n = sheets.length;
  const cur = i % n;

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
      if (alive && data) setProducts(data);
    };
    load();
    const t = setInterval(load, 5 * 60 * 1000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => go(1), sheets[cur].ms);
    return () => clearTimeout(t);
  }, [cur, paused, go, sheets]);

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

      <button className="hit left" onClick={() => go(-1)} aria-label="Foaia anterioară" />
      <button className="hit right" onClick={() => go(1)} aria-label="Foaia următoare" />

      <section key={s.id} className="sheet" aria-live="polite">
        {s.id === 'brand' && (
          <div className="brand">
            <h1>
              <span>Formă.</span>
              <span>Funcție.</span>
              <span>Spațiu.</span>
            </h1>
            <p>Birou de proiectare și consultanță arhitecturală, Târgoviște, Dâmbovița.</p>
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
                <li key={a} style={{ animationDelay: `${0.15 * k}s` }}>
                  <b>{k + 1}</b>
                  <strong>{a}</strong>
                  <span>{b}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {s.id === 'lucrari' && (
          <div className="list">
            <h2>Lucrări sub semnătura noastră</h2>
            <ul>
              {WORKS.map(([a, b]) => (
                <li key={a}>
                  <strong>{a}</strong>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
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
              <p className="price">{Number(s.product.pret).toFixed(2)} lei</p>
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

      <footer className="block">
        <div className="who">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/arhi4d.png" alt="" width="28" height="28" />
          <b>Proarh.4D</b>
          <span>proarh4d.ro</span>
        </div>
        <div className="what">{s.title}</div>
        <div className="num">
          Foaia {cur + 1} din {n}
          {paused ? ' · pauză' : ''}
        </div>
        <div className="bars" aria-hidden="true">
          {sheets.map((x, k) => (
            <div key={x.id} className={k < cur ? 'done' : ''}>
              {k === cur && (
                <u
                  key={`${cur}-${paused}`}
                  style={{ animationDuration: `${x.ms}ms`, animationPlayState: paused ? 'paused' : 'running' }}
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
  font-family:"DM Mono",ui-monospace,monospace;display:grid;grid-template-rows:1fr auto;
  background-image:linear-gradient(rgba(26,26,26,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(26,26,26,.045) 1px,transparent 1px);
  background-size:6vmin 6vmin}
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
.sheet{position:relative;padding:7vmin 8vmin;display:flex;min-height:0;animation:in .5s ease both}
@keyframes in{from{opacity:0}to{opacity:1}}

.brand{align-self:center}
.brand h1{font-weight:700;font-size:clamp(3rem,15vmin,12rem);line-height:.9;letter-spacing:-.04em;display:flex;flex-direction:column}
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
@media (max-aspect-ratio:1/1){
  .wipe,.prod{grid-template-columns:1fr;gap:4vmin}.wipe h2{max-width:none}
  .list ol li{grid-template-columns:5vmin 1fr}.list ol li span{grid-column:2}
  .block{grid-template-columns:1fr auto}.what{display:none}
}
@media (prefers-reduced-motion:reduce){
  .sheet,.list li{animation:none}
  .stage .top{animation:none;clip-path:inset(0 50% 0 0)}
  .stage .line{animation:none;left:50%}
}
`;