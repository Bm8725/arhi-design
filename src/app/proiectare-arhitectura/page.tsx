"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import Link from 'next/link';

const FAZE = [
  {
    n: "01",
    cod: "D.T.A.C.",
    title: "Documentație pentru autorizarea construirii",
    text: "Piesele scrise și desenate necesare obținerii autorizației de construire, depuse la primărie.",
  },
  {
    n: "02",
    cod: "D.T.O.E.",
    title: "Documentație pentru organizarea execuției",
    text: "Documentația tehnică pentru organizarea lucrărilor de construcție, corelată cu D.T.A.C.",
  },
  {
    n: "03",
    cod: "P.T.",
    title: "Proiect tehnic de execuție",
    text: "Detalierea tehnică completă a soluțiilor de arhitectură, structură și instalații pentru execuția lucrării.",
  },
  {
    n: "04",
    cod: "D.D.E.",
    title: "Detalii de execuție",
    text: "Detalii tehnice punctuale, la scară mare, pentru execuția corectă pe șantier.",
  },
];

const INCLUDE = [
  "Ridicare topografică & studiu de teren",
  "Concept arhitectural & randări 3D",
  "Plan de situație & încadrare în zonă",
  "Planuri, fațade și secțiuni la toate fazele",
  "Corelare cu proiectanții de structură și instalații",
  "Asistență tehnică pe parcursul autorizării",
];

export default function ProiectareArhitecturaPage() {
  return (
    <main className="relative min-h-screen bg-[#121212] text-[#E5E5E5] font-sans overflow-hidden">
      <Navbar />

      {/* ── BACKGROUND GRID DECORATIV FILTRAT EXTINS ANIMAL LIN ── */}
      <div className="absolute inset-0 grid grid-cols-4 pointer-events-none opacity-[0.03] z-0 h-full">
        <div className="border-r border-white h-full" />
        <div className="border-r border-white h-full" />
        <div className="border-r border-white h-full" />
        <div className="h-full" />
      </div>

      {/* ── HERO CU INTRODUCERE FLUIDĂ ── */}
      <section className="relative px-6 md:px-12 pt-32 pb-16 z-10 max-w-7xl mx-auto">
        <header className="border-b border-white/5 pb-12 relative group/hero">
          
          {/* Linie decorativă animată de deasupra */}
          <div className="w-12 h-[1px] bg-amber-500 mb-6 transition-all duration-700 group-hover/hero:w-24" />
          
          <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-amber-500/80 block">
            SERVICII DE EXCELENȚĂ
          </span>
          
          <h1 className="text-4xl md:text-6xl font-extralight tracking-tight uppercase mt-3 max-w-4xl text-white leading-tight">
            Proiectare <span className="font-normal text-amber-500">arhitecturală</span>
          </h1>
          
          <p className="text-sm md:text-base text-neutral-400 font-light mt-6 max-w-2xl leading-relaxed tracking-wide">
            De la conceptul inițial la proiectul tehnic de execuție — întocmim documentația completă necesară autorizării și construirii, cu respectarea reglementărilor în vigoare.
          </p>
        </header>
      </section>

      {/* ── FAZELE PROIECTULUI CU DETALII INTERACTIVE (HOVER EFFECT) ── */}
      <section className="relative px-6 md:px-12 pb-24 z-10 max-w-7xl mx-auto">
        <div className="mb-12">
          <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-neutral-500 block">
            ETAPE RIGUROASE
          </span>
          <h2 className="text-xl md:text-2xl font-light tracking-wider uppercase mt-2 text-white">
            Fazele documentației tehnice
          </h2>
        </div>

        {/* Grila de faze optimizată cu efecte hover strălucitoare discrete */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5 rounded-xl overflow-hidden shadow-2xl">
          {FAZE.map((f) => (
            <div 
              key={f.n} 
              className="bg-[#141414] p-8 relative group transition-all duration-500 hover:bg-[#1a1a1a] flex flex-col justify-between min-h-[280px]"
            >
              {/* Indicator de accent în colțul de sus la hover */}
              <div className="absolute top-0 left-0 w-0 h-[2px] bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500 group-hover:w-full" />
              
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono tracking-widest text-amber-500/60 group-hover:text-amber-500 transition-colors font-bold">
                    {f.n}
                  </span>
                  <span className="text-[9px] font-mono text-neutral-600 bg-neutral-900 border border-white/5 px-2 py-0.5 rounded uppercase tracking-wider">
                    Fază Activă
                  </span>
                </div>
                
                <h3 className="text-2xl font-light tracking-wide text-white mt-6 group-hover:text-amber-500 transition-colors duration-300">
                  {f.cod}
                </h3>
                
                <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 mt-1 mb-4 leading-normal">
                  {f.title}
                </p>
              </div>

              <p className="text-xs md:text-sm text-neutral-400 font-light leading-relaxed tracking-wide transition-colors group-hover:text-neutral-300">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CE INCLUDE SERVICIUL - EDITORIAL LAYOUT ── */}
      <section className="relative px-6 md:px-12 pb-32 z-10 max-w-7xl mx-auto">
        <div className="border-t border-white/5 pt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Partea stângă fixă/titlu */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-neutral-500 block">
              DETALII SPECIFICE
            </span>
            <h2 className="text-xl md:text-3xl font-light tracking-wider uppercase text-white leading-tight">
              Ce include <br />
              <span className="font-normal text-amber-500">serviciul complet</span>
            </h2>
            <p className="text-xs text-neutral-500 font-light leading-relaxed max-w-xs tracking-wide">
              Fiecare fază include verificări riguroase și asistență completă pe parcursul avizărilor pentru a garanta succesul autorizării.
            </p>
          </div>

          {/* Partea dreaptă: Lista interactivă */}
          <div className="lg:col-span-8 w-full">
            <ul className="flex flex-col">
              {INCLUDE.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-6 border-b border-white/5 py-4 text-xs md:text-sm text-neutral-300 font-light group/item cursor-default transition-all duration-300 hover:bg-white/[0.01] hover:px-2"
                >
                  <span className="text-amber-500 font-mono text-xs font-bold tracking-widest transition-transform duration-300 group-hover/item:translate-x-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 transition-colors duration-300 group-hover/item:text-white tracking-wide">
                    {item}
                  </span>
                  
                  {/* Indicator discret la final de rând */}
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-800 group-hover/item:bg-amber-500 transition-colors duration-300" />
                </li>
              ))}
            </ul>

            {/* BUTON DE CTA PREMIUM - STRATIFICAT CU GLOW ȘI CSS SLIDE */}
            <div className="mt-12">
              <Link
                href="/portofoliu"
                className="group relative inline-flex items-center gap-4 border border-white/10 rounded-lg px-8 py-4 text-xs font-mono tracking-[0.25em] uppercase font-medium overflow-hidden transition-all duration-300 hover:border-amber-500 shadow-xl"
              >
                <span className="relative z-10 text-white group-hover:text-black transition-colors duration-300">
                  Vezi portofoliul
                </span>
                <span className="relative z-10 text-amber-500 group-hover:text-black transition-all duration-300 group-hover:translate-x-1">
                  →
                </span>
                {/* Stratul de background portocaliu care glisează fin din stânga */}
                <span className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      <WhatsAppWidget />
      <Footer />
    </main>
  );
}
