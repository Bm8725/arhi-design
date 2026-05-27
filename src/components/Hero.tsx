"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Hero() {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  // Efect 3D pe bază de mouse tracking pentru imagine
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / 35; // Sensibilitate axa X
      const y = (e.clientY - innerHeight / 2) / 35; // Sensibilitate axa Y
      setRotate({ x: -y, y: x });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white pt-24 overflow-hidden select-none">
      
      {/* GRID DE FUNDAL DE LUX (Linii subtile de arhitectură) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-70" />

      {/* ELEMENT DECORATIV 3D ÎN DEGRADE */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10 py-12">
        
        {/* TEXT DE PREZENTARE (Stil Brutalist/Minimalist) */}
        <div className="space-y-8 lg:col-span-5 order-2 lg:order-1">
          <div className="inline-flex items-center gap-3">
            <span className="h-[1px] w-8 bg-neutral-600"></span>
            <span className="text-[10px] font-bold tracking-[0.3em] text-neutral-400 uppercase">
              Studio de Arhitectură Premium
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extralight tracking-tight leading-[1.1] text-neutral-100">
            Formă. <br />
            <span className="font-medium text-white italic">Funcție.</span> <br />
            Spațiu.
          </h1>

          <p className="text-neutral-400 max-w-sm text-sm leading-relaxed tracking-wide">
            Schițăm viitorul prin linii curate și materiale brute. Fiecare structură devine o semnătură vizuală atemporală.
          </p>

          <div className="pt-4 flex items-center gap-8">
            <Link 
              href="/portofoliu" 
              className="group relative inline-flex items-center gap-3 text-xs font-bold tracking-[0.2em] uppercase text-white py-2"
            >
              Explorează Portofoliul
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-2 text-neutral-400 group-hover:text-white">→</span>
              <span className="absolute bottom-0 left-0 w-12 h-[1px] bg-neutral-500 group-hover:w-full transition-all duration-300" />
            </Link>
          </div>
        </div>

        {/* PARALAXĂ 3D IMAGINE (arhi.jpg) */}
        <div className="lg:col-span-7 order-1 lg:order-2 flex justify-center lg:justify-end perspective-1000">
          <div 
            className="relative w-full max-w-[550px] aspect-[4/5] bg-neutral-900 overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] border border-neutral-800/50 transition-transform duration-200 ease-out"
            style={{
              transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.02, 1.02, 1.02)`,
              transformStyle: 'preserve-3d'
            }}
          >
            {/* IMAGINEA TA LOCALĂ */}
            <div 
              className="absolute inset-0 bg-[url('/arhi.jpg')] bg-cover bg-center transition-transform duration-700 ease-out hover:scale-105"
              style={{ transform: 'translateZ(20px)' }} // Împinge imaginea în plan 3D
            />
            
            {/* OVERLAY DE DESIGN PENTRU CONTRAST */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* ELEMENT ARHITECTURAL PE STRATUL 3D SUPERIOR */}
            <div 
              className="absolute bottom-6 left-6 text-left"
              style={{ transform: 'translateZ(40px)' }} // Împinge textul și mai în față
            >
              <span className="text-[10px] font-mono tracking-widest text-neutral-400 block mb-1">PROIECT_024</span>
              <h3 className="text-sm font-semibold tracking-wider uppercase text-white">Rezidența Monolit</h3>
            </div>

            {/* RAMĂ DE DESIGN FINĂ */}
            <div className="absolute inset-4 border border-white/10 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* NUMEROTARE FUNDAL STIL SCHIȚĂ */}
      <div className="absolute bottom-8 left-6 text-[10px] font-mono text-neutral-700 tracking-widest hidden md:block">
        LAT. 44.4268° N / LONG. 26.1025° E
      </div>
    </section>
  );
}
