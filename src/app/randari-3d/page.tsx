'use client';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Box, PenTool, FileCheck, ArrowUpRight } from 'lucide-react';

// Încărcare dinamică pentru a preveni erorile de tip SSR (Server-Side Rendering) cu Three.js
const ModelViewer = dynamic(() => import('@/components/ModelViewer'), {
  ssr: false,
  loading: () => <PremiumLoader />,
});

/* ─────────────────────────────────────────────────────────────
   SERVICII — redesign complet: bento grid, tipografie editorială,
   numere uriașe de fundal, marquee, blob-uri organice animate.
   ───────────────────────────────────────────────────────────── */

const SERVICES = [
  {
    icon: Box,
    title: "Randări 3D/4D",
    subtitle: "& Vizualizare",
    text: "Randări 3D/4D de înaltă calitate pentru proiectele tale arhitecturale, cu detalii realiste și iluminare precisă.",
    featured: true,
  },
  {
    icon: PenTool,
    title: "Proiectare",
    subtitle: "arhitecturală",
    text: "Servicii complete de proiectare, de la concept la execuție, adaptate nevoilor tale.",
    featured: false,
  },
  {
    icon: FileCheck,
    title: "Consultanță",
    subtitle: "& avize",
    text: "Consultanță profesională și obținerea avizelor necesare pentru autorizare.",
    featured: false,
  },
];

const MARQUEE_WORDS = [
  "RANDARE 3D/4D", "ARHITECTURĂ", "D.T.A.C.", "CONSULTANȚĂ", "VIZUALIZARE",
  "DESIGN ", "AUTORIZAȚII", "PROIECT TEHNIC", "VILE", "CASE","BLOCURI"
];

export default function ServiciiPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  return (
    <main className="relative min-h-screen bg-[#faf7f2] text-[#211c15] overflow-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,500;1,400&family=DM+Mono:wght@300;400;500&display=swap');
        .ss-serif { font-family: 'Playfair Display', serif; }
        .ss-mono { font-family: 'DM Mono', monospace; }
      `}</style>

      <style jsx>{`
        @keyframes ss-float-1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(50px,40px) scale(1.08); }
          66% { transform: translate(-30px,70px) scale(0.94); }
        }
        @keyframes ss-float-2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-60px,-40px) scale(1.12); }
        }
        .ss-blob { position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none; }
        .ss-blob-1 { width: 480px; height: 480px; top: -140px; left: -120px; background: radial-gradient(circle, rgba(226,179,110,0.35) 0%, transparent 70%); animation: ss-float-1 24s ease-in-out infinite; }
        .ss-blob-2 { width: 380px; height: 380px; top: 20%; right: -100px; background: radial-gradient(circle, rgba(150,190,170,0.28) 0%, transparent 70%); animation: ss-float-2 28s ease-in-out infinite; }

        .ss-word { display: inline-block; overflow: hidden; }
        .ss-word span { display: inline-block; transform: translateY(110%); transition: transform 0.8s cubic-bezier(0.16,1,0.3,1); }
        .ss-word.in span { transform: translateY(0); }

        .ss-marquee-track { display: flex; width: max-content; animation: ss-marquee 32s linear infinite; }
        @keyframes ss-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        .ss-bignum { font-size: clamp(90px, 16vw, 220px); line-height: 0.8; }

        .ss-card { transition: transform 0.5s cubic-bezier(0.16,1,0.3,1), box-shadow 0.5s ease; }
        .ss-card:hover { transform: translateY(-6px); box-shadow: 0 24px 60px rgba(33,28,21,0.10); }
      `}</style>

      <Navbar />

      {/* ── fundal organic ── */}
      <div className="ss-blob ss-blob-1" />
      <div className="ss-blob ss-blob-2" />

      {/* ── HERO EDITORIAL ─────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 pt-28 md:pt-40 pb-16 max-w-6xl mx-auto">
        <span className="ss-mono text-[10px] tracking-[0.4em] uppercase opacity-50">
          Birou arhitectura · Servicii · Arh. Bogdan Șotîngeanu
        </span>

        <h1 className="ss-serif font-light leading-[0.95] tracking-tight mt-5 text-[13vw] sm:text-[9vw] md:text-[6.4vw] lg:text-[88px]">
          {["Ce", "facem,"].map((w, i) => (
            <span key={i} className={`ss-word ${mounted ? 'in' : ''} mr-4`} style={{ transitionDelay: `${i * 90}ms` }}>
              <span>{w}</span>
            </span>
          ))}
          <br />
          <span className="italic text-amber-600">
            {["cum", "facem ?"].map((w, i) => (
              <span key={i} className={`ss-word ${mounted ? 'in' : ''} mr-4`} style={{ transitionDelay: `${(i + 2) * 90}ms` }}>
                <span>{w}</span>
              </span>
            ))}
          </span>
        </h1>

        <p
          className="ss-mono text-sm md:text-base text-neutral-600 font-light mt-8 max-w-lg leading-relaxed transition-all duration-700"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)', transitionDelay: '420ms' }}
        >
          De la primul concept vizual până la
          ultima ștampilă de autorizare — gândite să acopere tot
          parcursul unui proiect arhitectural.
        </p>
      </section>

      {/* ── MARQUEE ────────────────────────────────────────── */}
      <section className="relative z-10 border-y border-black/10 py-4 overflow-hidden bg-white/40">
        <div className="ss-marquee-track">
          {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
            <span key={i} className="ss-mono text-xs tracking-[0.3em] uppercase text-neutral-500 px-6 flex items-center gap-6 shrink-0">
              {w} <span className="text-amber-500">✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* ── BENTO GRID SERVICII ────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 py-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className={`ss-card relative bg-white border border-black/10 rounded-2xl p-8 md:p-10 overflow-hidden ${
                  s.featured ? 'md:col-span-2 md:min-h-[280px]' : 'md:min-h-[280px]'
                }`}
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.7s ease ${480 + i * 120}ms, transform 0.7s ease ${480 + i * 120}ms`,
                }}
              >
                {/* numeral uriaș de fundal */}
                <span className="ss-serif ss-bignum absolute -bottom-4 -right-2 text-black/[0.04] select-none pointer-events-none">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-full bg-amber-50 border border-amber-500/25 flex items-center justify-center">
                      <Icon size={18} strokeWidth={1.4} className="text-amber-600" />
                    </div>
                    <ArrowUpRight size={18} className="text-neutral-300" />
                  </div>

                  <h2 className="ss-serif text-2xl md:text-3xl font-light leading-tight mt-6">
                    {s.title}<br />
                    <span className="italic text-amber-600">{s.subtitle}</span>
                  </h2>

                  <p className="ss-mono text-sm text-neutral-600 font-light leading-relaxed mt-4 max-w-md">
                    {s.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── VIEWER 3D ──────────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 pb-24 max-w-6xl mx-auto">
        <div
          className="border-t border-black/10 pt-14 transition-all duration-700 ease-out"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(24px)', transitionDelay: '760ms' }}
        >
          <span className="ss-mono text-[10px] tracking-[0.4em] uppercase opacity-50">
            Interactiv
          </span>
          <h2 className="ss-serif text-3xl md:text-5xl font-light tracking-tight mt-2 mb-2">
            Explorează <span className="italic text-amber-600">modelul 3D</span>
          </h2>
          <p className="ss-mono text-sm text-neutral-600 font-light max-w-md mb-6">
            Rotește, apropie și explorează o randare demonstrativă direct din browser.
          </p>
          <div className="rounded-2xl overflow-hidden border border-black/10">
            <ModelViewer />
          </div>
        </div>
      </section>

      {/* ── CTA PORTOFOLIU ─────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 pb-28 max-w-6xl mx-auto">
        <div className="relative bg-[#211c15] text-[#faf7f2] rounded-3xl px-8 py-14 md:px-16 md:py-20 overflow-hidden">
          <div className="ss-blob" style={{ width: 320, height: 320, top: -100, right: -80, background: 'radial-gradient(circle, rgba(226,179,110,0.35) 0%, transparent 70%)' }} />
          <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <span className="ss-mono text-[10px] tracking-[0.4em] uppercase opacity-50">Portofoliu</span>
              <h3 className="ss-serif text-3xl md:text-5xl font-light leading-tight mt-3 max-w-md">
                Vrei să vezi <span className="italic text-amber-400">proiecte finalizate?</span>
              </h3>
            </div>

            <Link
              href="/portofoliu"
              className="group relative inline-flex items-center gap-3 bg-amber-500 text-black px-8 py-4 rounded-full text-xs tracking-widest uppercase font-medium shrink-0 self-start md:self-auto transition-transform duration-300 hover:scale-[1.04] active:scale-95"
            >
              <span>Vezi portofoliul</span>
              <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </section>

      <WhatsAppWidget />
      <Footer />
    </main>
  );
}

// ── Loader premium: cub wireframe rotativ 3D (CSS pur), glow amber, scan-line ──
function PremiumLoader() {
  return (
    <div className="relative w-full h-[320px] md:h-[560px] bg-[#0d0d0d] overflow-hidden flex items-center justify-center">
      <style jsx>{`
        .scene { perspective: 900px; }
        .cube {
          width: 90px;
          height: 90px;
          position: relative;
          transform-style: preserve-3d;
          animation: cube-spin 7s linear infinite;
        }
        .face {
          position: absolute;
          width: 90px;
          height: 90px;
          border: 1px solid rgba(226,179,110,0.55);
          background: rgba(226,179,110,0.035);
          box-shadow: 0 0 24px rgba(226,179,110,0.18) inset;
        }
        .face.front  { transform: translateZ(45px); }
        .face.back   { transform: translateZ(-45px) rotateY(180deg); }
        .face.right  { transform: rotateY(90deg) translateZ(45px); }
        .face.left   { transform: rotateY(-90deg) translateZ(45px); }
        .face.top    { transform: rotateX(90deg) translateZ(45px); }
        .face.bottom { transform: rotateX(-90deg) translateZ(45px); }
        @keyframes cube-spin {
          from { transform: rotateX(-28deg) rotateY(0deg); }
          to   { transform: rotateX(-28deg) rotateY(360deg); }
        }
        .scan-line {
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(226,179,110,0.9), transparent);
          animation: scan-move 2.6s ease-in-out infinite;
        }
        @keyframes scan-move {
          0%   { top: 8%; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 92%; opacity: 0; }
        }
        .loader-text {
          letter-spacing: 0.35em;
          animation: text-pulse 1.8s ease-in-out infinite;
        }
        @keyframes text-pulse {
          0%, 100% { opacity: 0.35; }
          50%      { opacity: 0.9; }
        }
        .glow-orb {
          position: absolute;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(226,179,110,0.14) 0%, transparent 70%);
          animation: orb-pulse 3.5s ease-in-out infinite;
        }
        @keyframes orb-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50%      { transform: scale(1.15); opacity: 1; }
        }
      `}</style>

      <div className="glow-orb" />
      <div className="scan-line" />

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="scene">
          <div className="cube">
            <div className="face front" />
            <div className="face back" />
            <div className="face right" />
            <div className="face left" />
            <div className="face top" />
            <div className="face bottom" />
          </div>
        </div>
        <span className="loader-text text-[10px] uppercase text-amber-500 font-light">
          Se încarcă modelul 3D
        </span>
      </div>
    </div>
  );
}