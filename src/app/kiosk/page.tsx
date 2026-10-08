'use client';
// Plasează fișierul în: src/app/kiosk/page.tsx  ->  proarh4d.ro/kiosk
// Produsele active din shop vin din Supabase (tabelul "products"), la fel ca în app/shop/page.
// Comenzi: săgeți sau click stânga/dreapta = schimbă foaia, Spațiu = pauză, F sau butonul = ecran complet.

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import QRCode from 'react-qr-code';

type Proj = { title: string; place: string; area?: string; status?: string; images: string[] };
type Sheet = { id: string; title: string; ms: number; product?: any; project?: Proj };

const PORTFOLIO_URL = 'https://proarh4d.ro/portofoliu';
const VIDEO_SRC = '/arhidesign.webm';
const VIDEO_MS = 10000; // cât stă videoul pe ecran (full screen); dacă e mai scurt, se repetă
const VIDEO_SECONDS = VIDEO_MS / 1000;
// Shop: o singură foaie cu produs în buclă. true = la fiecare buclă apare următorul produs; false = mereu cel mai nou.
const SHOP_ROTATE = true;
// Textul de pe foaia video (editează liber)
const VIDEO_CAPTION = { title: 'Vezi proiectul înainte să existe.', sub: 'Randare 3D · Proarh.4D' };

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

// Tot ce se încarcă înainte de pornirea prezentării (acum include și /kiosk.png).
const ASSETS: string[] = ['/plan.webp', '/design.webp', '/arhi4d.png', '/kiosk.png', ...PROJECTS.flatMap((p) => p.images)];
const PRELOAD_THREADS = 6;
const TICKER = 'Proiectare rezidențială   Randări 3D   Consultanță nZEB   Autorizare   Execuție   Modele 3D în shop   ';

/* ───────────── COMPONENTE (izolate, ca să nu se re-randeze toată pagina) ───────────── */

// Galerie: pozele se schimbă singure; se oprește când prezentarea e în pauză.
const Gallery = memo(function Gallery({ images, title, hold }: { images: string[]; title: string; hold: boolean }) {
  const [k, setK] = useState(0);
  useEffect(() => {
    if (images.length < 2 || hold) return;
    const t = setInterval(() => setK((v) => (v + 1) % images.length), 2400);
    return () => clearInterval(t);
  }, [images.length, hold]);
  return (
    <div className="gal">
      {images.map((src, j) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt={j === k ? title : ''} decoding="async" className={j === k ? 'on' : ''} />
      ))}
      <div className="dots" aria-hidden="true">
        {images.map((src, j) => (
          <i key={src} className={j === k ? 'on' : ''} />
        ))}
      </div>
    </div>
  );
});

// Prețul se animă direct în DOM (fără 60 de re-randări React pe secundă).
function Price({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fmt = (v: number) => `${v.toFixed(2)} lei`;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = fmt(value); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, Math.max(0, (t - t0 - 200) / 1400));
      el.textContent = fmt(value * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span ref={ref}>0.00 lei</span>;
}

// Ceasul are starea lui: nu mai re-randează toată pagina la fiecare actualizare.
function Clock() {
  const [t, setT] = useState('');
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }));
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);
  return <b className="clock">{t}</b>;
}

const QrBadge = memo(function QrBadge() {
  return (
    <div className="qr">
      <div className="qrbox">
        <QRCode size={93} value={PORTFOLIO_URL} level="H" />
      </div>
      <div className="qrtxt">
        <span>SCANEAZĂ QR</span>
        <span>Portofoliu</span>
      </div>
    </div>
  );
});

// Foaia video: ecran complet (acoperă antetul și subsolul), 10 secunde, cu wipe, repere de cadru și cronometru.
const VideoSheet = memo(function VideoSheet({ ms, hold, onError }: { ms: number; hold: boolean; onError: () => void }) {
  const vRef = useRef<HTMLVideoElement>(null);
  const tcRef = useRef<HTMLSpanElement>(null);
  const holdRef = useRef(hold);
  holdRef.current = hold;

  // Pauza prezentării oprește și videoul
  useEffect(() => {
    const v = vRef.current;
    if (!v) return;
    if (hold) v.pause();
    else v.play().catch(() => {});
  }, [hold]);

  // Cronometrul numără cele 10 secunde ale foii (se oprește la pauză) și se scrie direct în DOM
  useEffect(() => {
    const el = tcRef.current;
    if (!el) return;
    const f = (t: number) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
    let t = 0;
    el.textContent = `${f(0)} / ${f(VIDEO_SECONDS)}`;
    const id = setInterval(() => {
      if (holdRef.current) return;
      t = Math.min(VIDEO_SECONDS, t + 0.25);
      el.textContent = `${f(t)} / ${f(VIDEO_SECONDS)}`;
    }, 250);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="vid">
      <div className="vmask">
        <div className="vcount">
          <div className="vzoom" style={{ animationDuration: `${ms}ms` }}>
            <video ref={vRef} src={VIDEO_SRC} autoPlay loop muted playsInline preload="auto" onError={onError} />
          </div>
        </div>
      </div>
      <div className="vshade" />
      <i className="mk a" /><i className="mk b" /><i className="mk c" /><i className="mk d" />
      <span className="vtag">{VIDEO_CAPTION.sub}</span>
      <div className="cap vcap">
        <h2>{VIDEO_CAPTION.title}</h2>
        <p className="meta">Prezentare video</p>
      </div>
      <div className="tc"><i /><span ref={tcRef}>00:00 / 00:10</span></div>
      <div className="vprog" aria-hidden="true">
        <u style={{ animationDuration: `${ms}ms`, animationPlayState: hold ? 'paused' : 'running' }} />
      </div>
    </div>
  );
});

const SheetBody = memo(function SheetBody({ s, hold, onVideoError }: { s: Sheet; hold: boolean; onVideoError: () => void }) {
  return (
    <>
      {s.id === 'video' && <VideoSheet ms={s.ms} hold={hold} onError={onVideoError} />}

      {s.id === 'brand' && (
        <div className="brand">
          <div className="brand-text">
            <h1>Formă. Funcție. Spațiu.</h1>
            <p>Proiectare completă pentru construcții durabile. www.proarh4d.ro</p>
          </div>
          <div className="brand-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/kiosk.png" alt="Proarh.4D" decoding="async" />
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
            <img src="/plan.webp" alt="Schiță tehnică" decoding="async" />
            <div className="mask">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/design.webp" alt="Randare 3D" decoding="async" />
            </div>
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
          <Gallery images={s.project.images} title={s.project.title} hold={hold} />
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
              <img src={s.product.imagine_url} alt={s.product.nume} decoding="async" />
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
    </>
  );
});

/* ───────────── PAGINA ───────────── */

export default function Kiosk() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hideCursor, setHideCursor] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [full, setFull] = useState(false);
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [tabVisible, setTabVisible] = useState(true);
  const [leaving, setLeaving] = useState<Sheet | null>(null);
  const [round, setRound] = useState(0); // câte bucle complete au trecut (alege produsul din shop)
  const [videoOk, setVideoOk] = useState(true);

  const keep = useRef<HTMLImageElement[]>([]); // ține imaginile decodate în memorie (fără re-decodare)
  const warmVideo = useRef<HTMLVideoElement | null>(null);
  const productSig = useRef('');
  const prevSheet = useRef<Sheet | null>(null);

  // Foile fixe, plus câte o foaie pentru fiecare produs activ din shop.
  const sheets = useMemo<Sheet[]>(() => {
    const base = SHEETS.filter((x) => x.id !== 'shop');
    const video: Sheet[] = videoOk ? [{ id: 'video', title: 'Prezentare video', ms: VIDEO_MS }] : [];
    const head = [...base.slice(0, 2), ...video, ...base.slice(2)];
    // Indiferent câte produse ai, în buclă intră UN singur produs.
    const featured = products.length ? products[SHOP_ROTATE ? round % products.length : 0] : null;
    const tail: Sheet[] = featured
      ? [{ id: `p-${featured.id}`, title: 'Shop 3D', ms: 8000, product: featured }]
      : SHEETS.filter((x) => x.id === 'shop');
    return [...head, ...PROJECT_SHEETS, ...tail];
  }, [products, videoOk, round]);
  const n = sheets.length;
  const cur = i % n;
  const s = sheets[cur];
  const sRef = useRef(s);
  sRef.current = s;
  const hold = paused || !ready || !tabVisible;

  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);
  const onVideoError = useCallback(() => setVideoOk(false), []);

  const toggleFull = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  }, []);

  useEffect(() => {
    const onChange = () => setFull(!!document.fullscreenElement);
    const onVis = () => setTabVisible(document.visibilityState === 'visible');
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('visibilitychange', onVis);
    };
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

  // Încarcă și decodează imaginile (6 odată, nu toate deodată) și așteaptă fonturile. Maximum 25 de secunde.
  useEffect(() => {
    let alive = true;
    let done = 0;
    const total = ASSETS.length + 2; // imagini + fonturi + video
    const timeout = setTimeout(() => alive && setReady(true), 25000);
    const finish = () => {
      done += 1;
      if (!alive) return;
      setLoaded(done);
      if (done >= total) { clearTimeout(timeout); setReady(true); }
    };
    const queue = [...ASSETS];
    const worker = async () => {
      while (alive) {
        const src = queue.shift();
        if (!src) return;
        await new Promise<void>((res) => {
          const im = new Image();
          im.decoding = 'async';
          keep.current.push(im);
          im.src = src;
          (im.decode ? im.decode() : Promise.resolve()).then(() => res(), () => res());
        });
        finish();
      }
    };
    for (let w = 0; w < PRELOAD_THREADS; w++) worker();
    (document.fonts?.ready ?? Promise.resolve()).then(finish, finish);

    // Videoul se descarcă din timp, ca să pornească instant când îi vine rândul.
    const vid = document.createElement('video');
    vid.preload = 'auto';
    vid.muted = true;
    vid.playsInline = true;
    warmVideo.current = vid;
    vid.addEventListener('loadeddata', () => {
      finish();
    }, { once: true });
    vid.addEventListener('error', () => { if (alive) setVideoOk(false); finish(); }, { once: true });
    vid.src = VIDEO_SRC;
    return () => { alive = false; clearTimeout(timeout); };
  }, []);

  // Produsele active din shop, reîmprospătate la 5 minute. Lista se schimbă doar dacă s-a modificat ceva.
  useEffect(() => {
    const supabase = createClient();
    let alive = true;
    const load = async () => {
      try {
        const { data } = await supabase
          .from('products')
          .select('id, nume, categorie, descriere_scurta, descriere, pret, imagine_url')
          .eq('activ', true)
          .order('created_at', { ascending: false })
          .limit(6);
        if (!alive || !data) return;
        const sig = JSON.stringify(data.map((p: any) => [p.id, p.nume, p.categorie, p.descriere_scurta, p.descriere, p.pret, p.imagine_url]));
        if (sig === productSig.current) return;
        productSig.current = sig;
        setProducts(data);
        data.forEach((p: any) => {
          if (!p.imagine_url) return;
          const im = new Image();
          im.decoding = 'async';
          keep.current.push(im);
          im.src = p.imagine_url;
          im.decode().catch(() => {});
        });
      } catch {
        /* fără rețea: rămân produsele deja încărcate */
      }
    };
    load();
    const t = setInterval(load, 5 * 60 * 1000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  // Când bucla se închide (revenim la prima foaie), la următoarea rundă apare alt produs.
  const lastCur = useRef(0);
  useEffect(() => {
    if (cur === 0 && lastCur.current !== 0) setRound((r) => r + 1);
    lastCur.current = cur;
  }, [cur]);

  // Tranziție lină: foaia veche rămâne ~0.45 s și se estompează, în timp ce cea nouă intră.
  useEffect(() => {
    const prev = prevSheet.current;
    prevSheet.current = sRef.current;
    if (!prev || prev.id === sRef.current.id) return;
    setLeaving(prev);
    const t = setTimeout(() => setLeaving(null), 450);
    return () => clearTimeout(t);
  }, [s.id]);

  // Plasă de siguranță: dacă bara de progres nu anunță sfârșitul (animationend), avansăm oricum.
  useEffect(() => {
    if (hold) return;
    const t = setTimeout(() => go(1), s.ms + 2000);
    return () => clearTimeout(t);
  }, [cur, hold, go, s.ms]);

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
    window.addEventListener('mousemove', onMove, { passive: true });
    onMove();
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousemove', onMove);
      clearTimeout(idle);
    };
  }, [go, toggleFull]);

  const visibleSheets = ready ? [leaving, s].filter((x): x is Sheet => !!x) : [];

  return (
    <main className={`k ${hideCursor ? 'nocursor' : ''}`} aria-label="Prezentare Proarh.4D">
      <style>{css}</style>

      <div className="bg" aria-hidden="true"><i className="grid" /><i className="glow" /></div>

      <button className="fs" onClick={toggleFull}>
        {full ? 'Ieși din ecran complet' : 'Ecran complet'}
      </button>

      <div className={`boot${ready ? ' gone' : ''}`} aria-hidden={ready}>
        <strong>Arh. Bogdan Șotîngeanu</strong>
        <div className="bar"><i style={{ width: `${Math.round((loaded / (ASSETS.length + 1)) * 100)}%` }} /></div>
        <span>Se încarcă imaginile, {Math.min(loaded, ASSETS.length)} din {ASSETS.length}</span>
      </div>

      <header className="top">
        <div className="id">
          <strong>Arh. Bogdan Șotîngeanu</strong>
          <span>Birou de proiectare și consultanță arhitecturală</span>
        </div>
        <QrBadge />
      </header>

      <button className="hit left" onClick={() => go(-1)} aria-label="Foaia anterioară" />
      <button className="hit right" onClick={() => go(1)} aria-label="Foaia următoare" />

      <div className="stagebox">
        {visibleSheets.map((x) => (
          <section
            key={x.id}
            className={`sheet${x.project || x.id === 'video' ? ' full' : ''}${x.id === 'video' ? ' vfull' : ''}${leaving && x.id === leaving.id ? ' out' : ''}`}
            aria-live={leaving && x.id === leaving.id ? undefined : 'polite'}
          >
            <SheetBody s={x} hold={hold} onVideoError={onVideoError} />
          </section>
        ))}
      </div>

      <div className="ticker" aria-hidden="true">
        <div className="track">
          <span>{TICKER.repeat(2)}</span>
          <span>{TICKER.repeat(2)}</span>
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
          <Clock />
          Foaia {cur + 1} din {n}
          {paused ? ' · pauză' : ''}
        </div>
        <div className="bars" aria-hidden="true">
          {sheets.map((x, k) => (
            <div key={x.id} className={k < cur ? 'done' : ''}>
              {k === cur && (
                <u
                  key={cur}
                  onAnimationEnd={() => go(1)}
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
  position:fixed;inset:0;background:var(--ink);color:var(--paper);overflow:hidden;contain:layout paint;
  font-family:"DM Mono",ui-monospace,monospace;display:grid;grid-template-rows:auto minmax(0,1fr) auto auto}
.k.nocursor{cursor:none}
.k h1,.k h2,.k p,.k ol{margin:0;padding:0}
.k h1,.k h2,.k .list strong,.k .top strong,.k .boot strong{font-family:"Playfair Display",Georgia,serif;font-weight:500}

/* Fundal: grila și lumina se mișcă DOAR prin transform (pe GPU), nu prin background-position */
.bg{position:absolute;inset:0;z-index:0;overflow:hidden;pointer-events:none}
.bg i{position:absolute;display:block;will-change:transform}
.bg .grid{inset:-6vmin;background-image:linear-gradient(rgba(26,26,26,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(26,26,26,.045) 1px,transparent 1px);
  background-size:6vmin 6vmin;animation:pan 24s linear infinite}
.bg .glow{inset:-20%;background:radial-gradient(ellipse 40% 32% at 22% 30%,rgba(191,160,84,.17),transparent 70%);animation:drift 26s ease-in-out infinite alternate}
@keyframes pan{to{transform:translate3d(6vmin,6vmin,0)}}
@keyframes drift{to{transform:translate3d(8%,10%,0)}}

.fs{position:fixed;top:2vmin;right:2vmin;z-index:6;padding:.7em 1.2em;background:var(--ink);color:var(--paper);
  border:1px solid rgba(26,26,26,.5);font:inherit;font-size:clamp(.8rem,1.9vmin,1.2rem);cursor:pointer;transition:opacity .4s}
.fs:hover{border-color:var(--wood)}
.fs:focus-visible{outline:2px solid var(--wood);outline-offset:2px}
.k.nocursor .fs{opacity:0;pointer-events:none}
.hit{position:absolute;top:0;bottom:0;width:30%;z-index:3;background:none;border:0;cursor:inherit}
.hit.left{left:0}.hit.right{right:0}
.hit:focus-visible{outline:2px solid var(--wood);outline-offset:-4px}

/* Antet */
.top{position:relative;z-index:4;display:flex;align-items:center;justify-content:space-between;gap:3vmin;
  padding:1.4vmin 4vmin;background:var(--ink);border-bottom:1px solid rgba(26,26,26,.35)}
.id{display:flex;flex-direction:column;gap:2px}
.id strong{font-size:clamp(1.1rem,3.4vmin,2.6rem);letter-spacing:-.01em}
.id span{color:var(--concrete);font-size:clamp(.7rem,1.8vmin,1.2rem)}
.qr{display:flex;align-items:center;gap:12px;background:#fff;padding:6px 12px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,.15)}
.qrbox{padding:6px;border-radius:6px;line-height:0;background:#fff}
.qrtxt{display:flex;flex-direction:column;text-align:left;line-height:1.2}
.qrtxt span:first-child{font-size:10px;font-weight:800;color:#111;letter-spacing:.5px}
.qrtxt span:last-child{font-size:12px;font-weight:600;color:#444}

/* Foi: tranziție cu suprapunere (veche iese, nouă intră) */
.stagebox{position:relative;display:grid;min-height:0}
.sheet{grid-area:1/1;position:relative;min-width:0;min-height:0;padding:7vmin 8vmin;display:flex;overflow:hidden;
  animation:in .5s ease .12s both}
.sheet.full{padding:0}
.sheet.out{animation:out .35s ease both;pointer-events:none}
.sheet.vfull{position:fixed;inset:0;z-index:5;pointer-events:none} /* video: peste antet, bandă și subsol */
@keyframes in{from{opacity:0}to{opacity:1}}
@keyframes out{from{opacity:1}to{opacity:0}}

/* Prezentare */
.brand{display:flex;align-items:center;justify-content:space-between;gap:5vmin;width:100%;min-height:0}
.brand-text{flex:1.2;min-width:0}
.brand h1{font-weight:700;font-size:clamp(2.4rem,9vmin,6.5rem);line-height:1.08;letter-spacing:-.02em;margin-bottom:3vmin;animation:up .9s ease .15s both}
.brand p{font-size:clamp(1rem,2.8vmin,2.2rem);line-height:1.5;max-width:22em;color:var(--concrete);animation:up .9s ease .35s both}
.brand-img{flex:1;min-width:0;height:100%;max-height:65vh;display:flex;justify-content:center;align-items:center;animation:zoomin 1.1s ease .2s both}
.brand-img img{max-width:100%;max-height:100%;object-fit:contain;border-radius:16px;box-shadow:0 20px 40px rgba(0,0,0,.15)}
@keyframes zoomin{from{opacity:0;transform:scale(.95)}}

/* De la schiță la randare: wipe doar cu transform (fără clip-path animat) */
.wipe{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.6fr);gap:6vmin;width:100%;align-items:center}
.wipe h2,.list h2,.shop h2{letter-spacing:-.03em;line-height:1;font-size:clamp(1.8rem,6vmin,5rem);max-width:14ch}
.wipe-text p{margin-top:3vmin;color:var(--concrete);font-size:clamp(.95rem,2.2vmin,1.6rem);line-height:1.4;max-width:30ch}
.stage{position:relative;aspect-ratio:16/10;max-height:100%;width:100%;border:1px solid rgba(26,26,26,.35);overflow:hidden;background:#e6e1d5}
.stage img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.stage .mask{position:absolute;inset:0;overflow:hidden;transform:translate3d(-100%,0,0);will-change:transform;
  animation:wipe 5s cubic-bezier(.6,0,.3,1) .8s forwards}
.stage .mask img{transform:translate3d(100%,0,0);will-change:transform;animation:wipe 5s cubic-bezier(.6,0,.3,1) .8s forwards}
.stage .mask::after{content:'';position:absolute;top:0;bottom:0;right:0;width:2px;background:var(--wood)}
@keyframes wipe{to{transform:translate3d(0,0,0)}}
.tag{position:absolute;bottom:2vmin;padding:.4em .8em;background:var(--ink);font-size:clamp(.75rem,1.8vmin,1.2rem)}
.t1{left:2vmin}.t2{right:2vmin}

/* Servicii */
.list{align-self:center;width:100%}
.list h2{max-width:20ch;margin-bottom:5vmin}
.list ol{list-style:none;border-top:1px solid rgba(26,26,26,.35)}
.list li{position:relative;display:grid;grid-template-columns:4vmin minmax(0,.55fr) minmax(0,1.6fr);align-items:baseline;gap:3vmin;
  padding:2.4vmin 0;animation:in2 .7s ease both}
.list li::after{content:'';position:absolute;left:0;right:0;bottom:0;height:1px;background:var(--paper);opacity:.4;
  transform:scaleX(0);transform-origin:left;animation:grow .9s ease forwards;animation-delay:inherit}
.list b{color:var(--wood);font-weight:400;font-size:clamp(.9rem,2.4vmin,1.8rem)}
.list strong{font-size:clamp(1.3rem,4.2vmin,3.4rem);letter-spacing:-.02em}
.list span{color:var(--concrete);font-size:clamp(.9rem,2.3vmin,1.7rem);line-height:1.35}
@keyframes in2{from{opacity:0;transform:translate3d(-3vmin,0,0)}}
@keyframes grow{to{transform:scaleX(1)}}

/* Shop */
.shop{align-self:center}
.shop p{margin-top:3vmin;color:var(--concrete);font-size:clamp(1rem,2.6vmin,2rem)}
.url{margin-top:7vmin;display:inline-block;padding:2.4vmin 3.6vmin;border:2px solid var(--wood);font-weight:700;letter-spacing:-.02em;font-size:clamp(1.6rem,7vmin,6rem)}
.prod{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:6vmin;width:100%;align-items:center}
.pic{aspect-ratio:4/3;max-height:100%;border:2px solid var(--paper);box-shadow:1.2vmin 1.2vmin 0 var(--gold);background:#efe9dc;overflow:hidden;
  display:grid;place-items:center;color:var(--concrete);animation:up .8s ease .2s both}
.pic img{width:100%;height:100%;object-fit:cover;animation:kb 14s ease-out both}
.info h2{font-size:clamp(1.8rem,6.5vmin,5.5rem);line-height:1;letter-spacing:-.02em;max-width:14ch}
.info .cat{color:var(--wood);font-size:clamp(.8rem,1.9vmin,1.3rem);margin-bottom:2vmin}
.info .desc{margin-top:3vmin;color:var(--concrete);font-size:clamp(.95rem,2.3vmin,1.7rem);line-height:1.45;max-width:36ch;
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.info .price{margin-top:4vmin;font-size:clamp(1.6rem,5.5vmin,4.5rem);font-weight:700;font-variant-numeric:tabular-nums}
.info .url{margin-top:4vmin;font-size:clamp(1rem,3vmin,2.4rem);padding:1.6vmin 2.4vmin}
.info>*{animation:up .8s ease both}
.info>:nth-child(1){animation-delay:.2s}.info>:nth-child(2){animation-delay:.35s}.info>:nth-child(3){animation-delay:.5s}
.info>:nth-child(4){animation-delay:.65s}.info>:nth-child(5){animation-delay:.8s}

/* Lucrări */
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

/* Foaia video */
.vid{position:absolute;inset:0}
.vmask{position:absolute;inset:0;overflow:hidden;transform:translate3d(-100%,0,0);will-change:transform;
  animation:wipe 1.6s cubic-bezier(.6,0,.3,1) .25s forwards}
.vmask::after{content:'';position:absolute;top:0;bottom:0;right:0;width:3px;background:var(--gold);animation:lineout .3s ease 1.85s forwards}
.vcount{position:absolute;inset:0;transform:translate3d(100%,0,0);will-change:transform;animation:wipe 1.6s cubic-bezier(.6,0,.3,1) .25s forwards}
.vzoom{position:absolute;inset:0;animation:kbv linear both}
.vzoom video{display:block;width:100%;height:100%;object-fit:cover;background:var(--paper)}
.vshade{position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(to top,rgba(26,26,26,.5),transparent 45%),linear-gradient(to bottom,rgba(26,26,26,.25),transparent 22%)}
.mk{position:absolute;width:4.5vmin;height:4.5vmin;border:0 solid rgba(251,249,244,.92);transform:scale(0);animation:mk .6s ease 1s forwards}
.mk.a{left:2.4vmin;top:2.4vmin;border-width:2px 0 0 2px;transform-origin:top left}
.mk.b{right:2.4vmin;top:2.4vmin;border-width:2px 2px 0 0;transform-origin:top right}
.mk.c{left:2.4vmin;bottom:2.4vmin;border-width:0 0 2px 2px;transform-origin:bottom left}
.mk.d{right:2.4vmin;bottom:2.4vmin;border-width:0 2px 2px 0;transform-origin:bottom right}
.vtag{position:absolute;left:5vmin;top:5vmin;z-index:1;padding:.5em 1em;background:var(--ink);border:1px solid var(--paper);
  font-size:clamp(.75rem,1.8vmin,1.2rem);animation:up .8s ease 1.2s both}
.vcap{animation-delay:1.5s}
.tc{position:absolute;right:4vmin;bottom:5vmin;z-index:1;display:flex;align-items:center;gap:1vmin;padding:1.2vmin 1.8vmin;
  background:var(--ink);border:1px solid var(--paper);font-size:clamp(.75rem,1.9vmin,1.3rem);font-variant-numeric:tabular-nums;animation:up .8s ease 1.8s both}
.tc i{width:1.1vmin;height:1.1vmin;border-radius:50%;background:var(--gold);animation:blink 1.6s ease-in-out infinite}
.vprog{position:absolute;left:0;right:0;bottom:0;height:3px;z-index:2;background:rgba(251,249,244,.25)}
.vprog u{display:block;height:100%;background:var(--gold);transform-origin:left;animation:fill linear forwards}
@keyframes kbv{from{transform:scale(1.08)}to{transform:scale(1)}}
@keyframes mk{to{transform:scale(1)}}
@keyframes lineout{to{opacity:0}}
@keyframes blink{50%{opacity:.25}}

/* Bandă și subsol */
.ticker{position:relative;z-index:4;overflow:hidden;white-space:nowrap;background:var(--ink);border-top:1px solid rgba(26,26,26,.35);
  padding:1.1vmin 0;font-size:clamp(.7rem,1.7vmin,1.1rem);color:var(--concrete)}
.ticker .track{display:flex;width:max-content;will-change:transform;animation:marq 70s linear infinite}
@keyframes marq{to{transform:translate3d(-50%,0,0)}}
.block{position:relative;z-index:4;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:3vmin;
  padding:2vmin 4vmin 2.6vmin;border-top:1px solid rgba(26,26,26,.35);background:var(--ink);font-size:clamp(.75rem,1.9vmin,1.3rem)}
.who{display:flex;align-items:center;gap:1.2vmin}.who span{color:var(--concrete)}
.what{text-align:center}.num{text-align:right;color:var(--concrete)}
.clock{margin-right:2.4vmin;color:var(--paper);font-variant-numeric:tabular-nums}
.bars{position:absolute;left:0;right:0;top:0;display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:3px;height:3px;transform:translateY(-100%)}
.bars div{background:rgba(26,26,26,.18)}.bars .done{background:var(--paper)}
.bars u{display:block;height:100%;background:var(--wood);transform-origin:left;animation:fill linear forwards}
@keyframes fill{from{transform:scaleX(0)}to{transform:scaleX(1)}}

/* Încărcare */
.boot{position:absolute;inset:0;z-index:7;display:grid;place-content:center;justify-items:center;gap:3vmin;background:var(--ink);
  transition:opacity .7s ease,visibility .7s}
.boot.gone{opacity:0;visibility:hidden}
.boot strong{font-size:clamp(1.6rem,6vmin,4.5rem)}
.boot .bar{width:min(40vw,60vmin);height:2px;background:rgba(26,26,26,.2)}
.boot .bar i{display:block;height:100%;background:var(--paper);transition:width .3s ease}
.boot span{color:var(--concrete);font-size:clamp(.75rem,1.8vmin,1.2rem)}

@keyframes kb{from{transform:scale(1.16)}to{transform:scale(1)}}
@keyframes kb2{from{transform:scale(1.1)}to{transform:scale(1)}}
@keyframes up{from{opacity:0;transform:translate3d(0,2.5vmin,0)}}

@media (max-aspect-ratio:1/1){
  .wipe,.prod{grid-template-columns:1fr;gap:4vmin}
  .brand{flex-direction:column;justify-content:center}.brand-img{max-height:40vh;width:100%}
  .wipe h2{max-width:none}
  .list li{grid-template-columns:5vmin 1fr}.list li span{grid-column:2}
  .block{grid-template-columns:1fr auto}
  .id span,.what{display:none}
}
@media (prefers-reduced-motion:reduce){
  .bg i,.info>*,.pic,.pic img,.list li,.gal img.on,.cap,.brand h1,.brand p,.brand-img{animation:none}
  .sheet{animation:none}.sheet.out{display:none}
  .list li::after{animation:none;transform:none}
  .ticker .track{animation:none}
  .stage .mask{animation:none;transform:translate3d(-50%,0,0)}
  .stage .mask img{animation:none;transform:translate3d(50%,0,0)}
  .vmask,.vcount{animation:none;transform:none}.vmask::after{display:none}
  .vzoom,.mk,.vtag,.vcap,.tc,.tc i{animation:none}.mk{transform:none}
}
`;