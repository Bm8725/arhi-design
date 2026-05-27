'use client';

import React, { useState, useRef, useEffect } from 'react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
const TECH_PROJECTS = [
  {
    id: 1,
    title: "NEO-MORPH TOWER",
    concept: "Arhitectură Parametrică // Structură Fluidă",
    // Folosim o imagine panoramică/equirectangulară de rezoluție mare pentru simularea 3D View
    panorama: "https://unsplash.com",
    matrix: "https://unsplash.com"
  },
  {
    id: 2,
    title: "CYBER PAVILION",
    concept: "Sticlă Inteligentă // Structură Carbon",
    panorama: "https://unsplash.com",
    matrix: "https://unsplash.com"
  }
];

export default function ArchitectureCyberMatrix3D() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [mouseY, setMouseY] = useState(0.5);
  const [mouseX, setMouseX] = useState(0.5);
  
  // Stări pentru controlul panoramei 3D (Drag to View)
  const [isDragging, setIsDragging] = useState(false);
  const [panoramaOffset, setPanoramaOffset] = useState(0);
  const startXRef = useRef(0);
  
  const containerRef = useRef(null);
  const STRIPS_COUNT = 10;

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setMouseX(x);
    setMouseY(y);

    // Dacă utilizatorul trage cu mouse-ul, mutăm panorama pe orizontală
    if (isDragging) {
      const deltaX = e.clientX - startXRef.current;
      setPanoramaOffset((prev) => prev + deltaX * 0.1); // Viteza de rotație a panoramei
      startXRef.current = e.clientX;
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Resetăm fin poziția distorsiunii la părăsirea containerului, dar păstrăm unghiul panoramei
  const handleMouseLeave = () => {
    setMouseX(0.5);
    setMouseY(0.5);
    setIsDragging(false);
  };

  return (
    <section className="relative w-full min-h-screen bg-[#08080A] text-white py-24 px-6 md:p-12 lg:p-24 overflow-hidden select-none flex flex-col justify-between selection:bg-[#00F0FF] selection:text-black">
      <Navbar />
      {/* BACKGROUND GRID ELECTRIZANT */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#00F0FF_1px,transparent_1px),linear-gradient(to_bottom,#00F0FF_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      <div 
        className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#00F0FF]/10 rounded-full blur-[160px] pointer-events-none"
        style={{ transform: `translate(${mouseX * 30}px, ${mouseY * 30}px)` }}
      />

      {/* HEADER HIGH-TECH */}
      <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-8 gap-4">
        <div>
          <span className="text-[#00F0FF] text-[10px] font-mono tracking-[0.6em] uppercase block mb-2">
            // ARHI.CORE ENGINE_V4.5 // 3D_VIEW_MODE
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-500">
            PARAMETRIC <span className="font-light italic text-[#00F0FF] lowercase">mesh</span>
          </h1>
        </div>
        <div className="flex gap-12 text-xs font-mono text-neutral-400">
          <div>
            <p className="text-neutral-600">[ 3D_PAN_ANGLE ]</p>
            <p className="text-[#00F0FF]">{panoramaOffset.toFixed(1)}°</p>
          </div>
 
        </div>
      </div>

      {/* COMPONENTA CENTRALĂ */}
      <div className="relative z-10 my-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center w-full max-w-7xl mx-auto py-12">
        
        {/* PARTEA STÂNGA (7 Coloane): STRATURI ORIZONTALE INTERACTIVE 3D */}
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className={`lg:col-span-7 w-full aspect-[16/10] flex flex-col perspective-[2000px] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          {Array.from({ length: STRIPS_COUNT }).map((_, idx) => {
            const topPercent = (idx / STRIPS_COUNT) * 100;
            const heightPercent = 100 / STRIPS_COUNT;

            // Calcule matematice pentru distorsiunea parametrică pe unde orizontale
            const delayFactor = Math.abs((idx / STRIPS_COUNT) - mouseY);
            const rotateXCalculated = (mouseY - 0.5) * -35 + (delayFactor * 12);
            const rotateYCalculated = (mouseX - 0.5) * 15;
            const translateZCalculated = (mouseX - 0.5) * 60 * (1 - delayFactor);

            return (
              <div
                key={idx}
                className="relative w-full transition-transform duration-200 ease-out border-b border-[#08080A]"
                style={{
                  height: `${heightPercent}%`,
                  transform: `rotateX(${rotateXCalculated}deg) rotateY(${rotateYCalculated}deg) translateZ(${translateZCalculated}px)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* STRAT FOTO REAL CU EFECT PANORAMIC 3D (Poziția X a imaginii se schimbă la drag) */}
                <div 
                  className="absolute inset-0 bg-no-repeat opacity-85 transition-transform duration-100 ease-out"
                  style={{
                    backgroundImage: `url(${TECH_PROJECTS[activeIdx].panorama})`,
                    backgroundPosition: `${50 + panoramaOffset}% ${topPercent}%`, // Modifică dinamic axa X pentru simularea vizualizării 3D
                    backgroundSize: `160% ${STRIPS_COUNT * 100}%`,
                    backfaceVisibility: 'hidden',
                  }}
                />

                {/* STRAT MATRIX CAD CYAN */}
                <div 
                  className="absolute inset-0 bg-cover bg-no-repeat grayscale border-t border-[#00F0FF]/20 bg-[#0c121a]"
                  style={{
                    backgroundImage: `url(${TECH_PROJECTS[activeIdx].matrix})`,
                    backgroundPosition: `center ${topPercent}%`,
                    backgroundSize: `100% ${STRIPS_COUNT * 100}%`,
                    transform: 'rotateX(180deg)',
                    backfaceVisibility: 'hidden',
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* PARTEA DREAPTĂ (5 Coloane): METADATE */}
        <div className="lg:col-span-5 flex flex-col justify-center lg:pl-12">
          <div className="inline-block px-2.5 py-1 bg-[#00F0FF]/10 border border-[#00F0FF]/20 rounded text-[#00F0FF] font-mono text-[9px] tracking-widest uppercase mb-4 self-start">
            {TECH_PROJECTS[activeIdx].concept}
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-6 uppercase">
            {TECH_PROJECTS[activeIdx].title}
          </h2>
          <p className="text-neutral-400 text-xs md:text-sm font-light leading-relaxed mb-12 max-w-sm normal-case tracking-normal">
            Apasă și trage (Click & Drag) direct pe fâșiile machetei pentru a roti perspectiva panoramei la 360°. Mișcarea cursorului controlează valul parametric de sub suprafața volumetrică.
          </p>

          {/* SELECTOR DIGITAL */}
          <div className="flex flex-col gap-3">
            {TECH_PROJECTS.map((proj, index) => (
              <button
                key={proj.id}
                onClick={() => {
                  setActiveIdx(index);
                  setPanoramaOffset(0); // Resetăm unghiul panoramei la schimbarea proiectului
                }}
                className={`group flex items-center justify-between p-4 border rounded-xl transition-all duration-300 text-left focus:outline-none ${
                  activeIdx === index 
                    ? 'border-[#00F0FF] bg-[#00F0FF]/5 text-white' 
                    : 'border-white/5 bg-transparent text-neutral-500 hover:border-white/10 hover:text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`font-mono text-xs ${activeIdx === index ? 'text-[#39FF14]' : 'text-neutral-600'}`}>
                    // 0{proj.id}
                  </span>
                  <span className="text-xs font-bold tracking-widest uppercase">{proj.title}</span>
                </div>
                <span className={`font-mono text-[10px] transition-transform duration-300 ${activeIdx === index ? 'text-[#00F0FF] translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-50'}`}>
                  [VIEW_3D]
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* FOOTER TERMINAL */}
      <div className="relative z-10 w-full flex flex-col sm:flex-row justify-between items-center text-[9px] font-mono text-neutral-600 border-t border-white/5 pt-6 gap-2">
        <span className="animate-pulse text-[#39FF14]">[ PANORAMA_STREAM: STABLE ]</span>
        <span>DRAG TO PAN // SCROLL TO WEAVE // ARCHITECTS OF THE FUTURE © 2026</span>
      </div>

    </section>
  );
}
