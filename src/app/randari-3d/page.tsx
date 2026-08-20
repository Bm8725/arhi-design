
'use client';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Încărcare dinamică pentru a preveni erorile de tip SSR (Server-Side Rendering) cu Three.js
const ModelViewer = dynamic(() => import('@/components/ModelViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[350px] md:h-[450px] bg-zinc-900/50 border border-white/5 rounded mt-6 flex items-center justify-center text-xs tracking-widest text-neutral-500 uppercase animate-pulse">
      Loading 3D model...
    </div>
  ),
});

/* ─────────────────────────────────────────────────────────────
   SERVICII — versiune simplă
   Scrii ideile aici, în array-ul SERVICES. Atât.
   ───────────────────────────────────────────────────────────── */

const SERVICES = [
  {
    title: "Randări 3D/4D & Vizualizare",
    text: "Randări 3D/4D de înaltă calitate pentru proiectele tale arhitecturale, cu detalii realiste și iluminare precisă.",
    showViewer: true, // Indicator pentru a randări modulul interactiv doar aici
  },
  {
    title: "Proiectare arhitecturală",
    text: "Oferim servicii complete de proiectare arhitecturală, de la concept la execuție, adaptate nevoilor și preferințelor tale.",
    showViewer: false,
  },
  {
    title: "Consultanță & avize",
    text: "Asigurăm consultanță profesională și obținerea avizelor necesare pentru proiectele tale, facilitând procesul de autorizare.",
    showViewer: false,
  },
];

export default function ServiciiPage() {
  return (
    <main className="relative min-h-screen bg-[#121212] text-[#E5E5E5] font-sans">
      <Navbar />

      <section className="px-6 md:px-12 py-20 max-w-4xl mx-auto">
        <header className="border-b border-white/10 pb-6 mb-12">
          <span className="text-xs tracking-[0.3em] uppercase font-light opacity-60">
            Servicii
          </span>
          <h1 className="text-3xl md:text-5xl font-light tracking-wide uppercase mt-2">
            Ce facem
          </h1>
        </header>

        <div className="space-y-12">
          {SERVICES.map((s, i) => (
            <div key={i} className="border-l border-white/10 pl-6">
              <span className="text-xs tracking-widest text-amber-500 font-light">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="text-xl md:text-2xl font-light uppercase tracking-wide mt-2">
                {s.title}
              </h2>
              <p className="text-sm text-neutral-400 font-light leading-relaxed mt-3">
                {s.text}
              </p>
              
              {/* Afișează componenta 3D sub primul serviciu */}
              {s.showViewer && <ModelViewer />}
            </div>
          ))}

          {/* Butonul de Portofoliu mutat în afara flex-ului de elemente de listă pentru o structură corectă */}
          <div className="pt-4">
            <Link
              href="/portofoliu"
              className="group relative inline-flex items-center gap-3 mt-4 border border-white/20 px-8 py-4 text-xs tracking-widest uppercase font-light overflow-hidden hover:border-amber-500 transition-colors duration-300"
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
        </div>
      </section>


      <Footer />
    </main>
  );
}
