'use client';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Box, PenTool, FileCheck } from 'lucide-react';

// Încărcare dinamică pentru a preveni erorile de tip SSR (Server-Side Rendering) cu Three.js
const ModelViewer = dynamic(() => import('@/components/ModelViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] md:h-[560px] bg-white border border-black/10 rounded mt-8 flex items-center justify-center text-xs tracking-widest text-neutral-400 uppercase animate-pulse">
      Loading 3D model...
    </div>
  ),
});

/* ─────────────────────────────────────────────────────────────
   SERVICII — temă deschisă, layout mai mare pe desktop
   Scrii ideile aici, în array-ul SERVICES. Atât.
   ───────────────────────────────────────────────────────────── */

const SERVICES = [
  {
    icon: Box,
    title: "Randări 3D/4D & Vizualizare",
    text: "Randări 3D/4D de înaltă calitate pentru proiectele tale arhitecturale, cu detalii realiste și iluminare precisă.",
    showViewer: true, // Indicator pentru a randări modulul interactiv doar aici
  },
  {
    icon: PenTool,
    title: "Proiectare arhitecturală",
    text: "Oferim servicii complete de proiectare arhitecturală, de la concept la execuție, adaptate nevoilor și preferințelor tale.",
    showViewer: false,
  },
  {
    icon: FileCheck,
    title: "Consultanță & avize",
    text: "Asigurăm consultanță profesională și obținerea avizelor necesare pentru proiectele tale, facilitând procesul de autorizare.",
    showViewer: false,
  },
];

export default function ServiciiPage() {
  return (
    <main className="relative min-h-screen bg-[#faf7f2] text-[#2b2620] font-sans">
      <Navbar />

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="px-6 md:px-12 pt-24 md:pt-32 pb-10 md:pb-14 max-w-6xl mx-auto">
        <header className="border-b border-black/10 pb-8">
          <span className="text-xs tracking-[0.3em] uppercase font-light opacity-60">
            Servicii
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-wide uppercase mt-3">
            Ce facem
          </h1>
          <p className="text-sm md:text-base text-neutral-600 font-light mt-5 max-w-2xl leading-relaxed">
            De la conceptul vizual la documentația tehnică completă —
            trei servicii integrate, gândite să acopere tot parcursul
            unui proiect arhitectural.
          </p>
        </header>
      </section>

      {/* ── GRID SERVICII ──────────────────────────────────── */}
      <section className="px-6 md:px-12 pb-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black/10 border border-black/10">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-[#faf7f2] p-8 md:p-10 lg:p-12 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs tracking-widest text-amber-600 font-light">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Icon size={22} strokeWidth={1.25} className="text-amber-600" />
                </div>
                <h2 className="text-lg md:text-xl font-light uppercase tracking-wide leading-snug">
                  {s.title}
                </h2>
                <p className="text-sm text-neutral-600 font-light leading-relaxed mt-4 flex-1">
                  {s.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── VIEWER 3D — secțiune dedicată, full width, mai mare pe desktop ── */}
      <section className="px-6 md:px-12 pb-20 max-w-6xl mx-auto">
        <div className="border-t border-black/10 pt-12">
          <span className="text-xs tracking-[0.3em] uppercase font-light opacity-60">
            Interactiv
          </span>
          <h2 className="text-2xl md:text-4xl font-light tracking-wide uppercase mt-2 mb-2">
            Explorează modelul 3D
          </h2>
          <p className="text-sm text-neutral-600 font-light max-w-xl mb-2">
            Rotește, apropie și explorează o randare demonstrativă direct din browser.
          </p>
          <ModelViewer />
        </div>
      </section>

      {/* ── CTA PORTOFOLIU ─────────────────────────────────── */}
      <section className="px-6 md:px-12 pb-24 max-w-6xl mx-auto">
        <div className="border-t border-black/10 pt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h3 className="text-xl md:text-2xl font-light uppercase tracking-wide">
              Vrei să vezi proiecte finalizate?
            </h3>
            <p className="text-sm text-neutral-600 font-light mt-2 max-w-md">
              Răsfoiește portofoliul complet cu proiecte realizate de echipa noastră.
            </p>
          </div>

          <Link
            href="/portofoliu"
            className="group relative inline-flex items-center gap-3 border border-black/20 px-8 py-4 text-xs tracking-widest uppercase font-light overflow-hidden hover:border-amber-500 transition-colors duration-300 shrink-0 self-start sm:self-auto"
          >
            <span className="relative z-10 group-hover:text-black transition-colors duration-300">
              Vezi portofoliul
            </span>
            <span
              aria-hidden
              className="relative z-10 group-hover:text-black transition-all duration-300 group-hover:translate-x-1"
            >
              →
            </span>
            <span className="absolute inset-0 bg-amber-500 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
          </Link>
        </div>
      </section>

      <WhatsAppWidget />
      <Footer />
    </main>
  );
}