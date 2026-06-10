"use client";

import { useEffect, useState, TouchEvent } from 'react';
import Link from 'next/link';

const SERVICII = [
  {
    id: "01",
    titlu: "Arhitectură Rezidențială",
    descriere: "Vile unicat, locuințe colective și ansambluri premium. Optimizare volumetrică sculpturală, integrare organică în sit și studii de însorire pentru spații luminate perfect.",
    imagine: "/arhi.jpg", 
    detaliu: "CONCEPT / VOLUMETRIE / PREZENTARE 3D"
  },
  {
    id: "02",
    titlu: "Urbanism & Avize (CU, DTAC)",
    descriere: "Preluăm complet birocrația. Analiză Certificat de Urbanism, elaborare documentații PUD/PUZ, obținere avize utilități (MDRAP, Mediu, ISU) și întocmire proiect pentru Autorizația de Construire.",
    imagine: "/avize.jpg", 
    detaliu: "BIROCRAȚIE / AVIZE / AUTORIZAȚIE"
  },
  {
    id: "03",
    titlu: "Proiectare Tehnică (PTh)",
    descriere: "Planșe de execuție de precizie chirurgicală. Detalii tehnice pentru structura de rezistență (beton, metal, lemn) și planuri coordonate de instalații (termice, sanitare, electrice, HVAC).",
    imagine: "/tehnic.jpg",
    detaliu: "DETALII EXECUȚIE / STRUCTURĂ / INSTALAȚII"
  },
  {
    id: "04",
    titlu: "Design Interior Premium",
    descriere: "Schițarea spațiilor interioare prin ergonomie avansată. Stereotomii de marmură/ceramică, design de mobilier customizat, planuri de iluminat arhitectural și liste complete de achiziții.",
    imagine: "/interior.jpg",
    detaliu: "RANDĂRI 4K / DETALII TEHNICE INTERIOR"
  },
  {
    id: "05",
    titlu: "Management & Asistență Șantier",
    descriere: "Urmărire de șantier prin vizite periodice ale arhitectului. Verificarea respectării proiectului de către constructori, asistență la faze determinante și consultanță la recepția finală a lucrărilor.",
    imagine: "/comercial.jpg",
    detaliu: "MANAGEMENT / SUPRAVEGHERE / TURN-KEY"
  }
];

export default function Hero() {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [indexCurent, setIndexCurent] = useState(0);
  const [animatieCheie, setAnimatieCheie] = useState(0);
  
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 1024) return;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / 90; 
      const y = (e.clientY - innerHeight / 2) / 90; 
      setRotate({ x: -y, y: x });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const urmatorulServiciu = () => {
    setAnimatieCheie(prev => prev + 1);
    setIndexCurent((prev) => (prev + 1) % SERVICII.length);
  };

  const anteriorServiciu = () => {
    setAnimatieCheie(prev => prev + 1);
    setIndexCurent((prev) => (prev - 1 + SERVICII.length) % SERVICII.length);
  };

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.targetTouches.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches.clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distanta = touchStart - touchEnd;
    const esteSwipeSuficient = Math.abs(distanta) > 50;

    if (esteSwipeSuficient) {
      if (distanta > 0) {
        urmatorulServiciu();
      } else {
        anteriorServiciu();
      }
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <section 
      className="relative w-full h-screen bg-black text-white overflow-hidden select-none group/hero"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      
      {/* 1. IMAGINI FUNDAL */}
      <div 
        className="absolute inset-0 w-full h-full transition-transform duration-700 ease-out"
        style={{
          transform: `scale(1.02) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {SERVICII.map((serviciu, i) => (
          <div
            key={serviciu.id}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out
              grayscale contrast-115 brightness-100
              lg:group-hover/hero:grayscale-0 
              active:grayscale-0 active:scale-[1.03]
              ${i === indexCurent ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-102 invisible'}`}
            style={{ backgroundImage: `url('${serviciu.imagine}')` }}
          />
        ))}
      </div>

      {/* REPERE MOBIL */}
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 lg:hidden pointer-events-none opacity-40 font-mono text-[9px] tracking-[0.3em] uppercase bg-black/50 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
        &larr; Swipe stânga/dreapta sau ține apăsat &rarr;
      </div>

      {/* RASTER SCHIȚĂ */}
      <div className="absolute inset-0 grid grid-cols-4 pointer-events-none z-10 opacity-10">
        <div className="border-r border-white/[0.1] h-full" />
        <div className="border-r border-white/[0.1] h-full" />
        <div className="border-r border-white/[0.1] h-full" />
        <div className="h-full" />
      </div>

      {/* 2. CONȚINUT TEXT */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-12 lg:p-20 drop-shadow-[0_4px_20px_rgba(0,0,0,1)]">
        
        {/* TOP PANEL */}
        <div className="w-full flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-[0.4em] text-white/90 uppercase block font-bold">
              / SERVICII INTEGRALE ARCHITECTURE
            </span>
            <div className="text-xs font-mono tracking-widest text-white font-bold">
              ARHI.<span className="italic text-neutral-200">DESIGN</span>
            </div>
          </div>
          
          <div className="font-mono text-xs text-white/90 tracking-widest mt-1 font-black">
            [{SERVICII[indexCurent].id} / 0{SERVICII.length}]
          </div>
        </div>

        {/* CENTER PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-end w-full my-auto">
          
          <div className="lg:col-span-5 space-y-4">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-none text-white uppercase drop-shadow-[0_8px_20px_rgba(0,0,0,1)]">
              Formă.<br />
              <span className="font-light text-white/90 italic lowercase">Funcție.</span><br />
              Spațiu.
            </h1>
          </div>

          <div 
            key={animatieCheie} 
            className="lg:col-span-7 space-y-4 lg:max-w-xl lg:justify-self-end border-l-2 border-white pl-6 lg:pl-8 py-2 drop-shadow-[0_4px_12px_rgba(0,0,0,1)] animate-[blurIn_0.5s_ease-out_forwards]"
          >
            <span className="text-[10px] font-mono tracking-widest text-white uppercase block font-black bg-white/10 inline-block px-2 py-0.5 backdrop-blur-sm rounded">
              {SERVICII[indexCurent].detaliu}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase leading-tight">
              {SERVICII[indexCurent].titlu}
            </h2>
            <p className="text-white font-medium text-xs sm:text-sm leading-relaxed tracking-wide opacity-100 max-w-lg">
              {SERVICII[indexCurent].descriere}
            </p>
          </div>

        </div>

        {/* BOTTOM PANEL */}
        <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 pt-4 border-t border-white/40 font-mono text-[11px] font-bold">
          
          <div>
            <Link 
              href="/portofoliu" 
              className="group inline-flex items-center gap-4 text-[10px] font-mono tracking-[0.3em] uppercase text-white hover:scale-105 transition-transform"
            >
              VEZI PORTOFOLIU PROIECTE
              <span className="transition-transform duration-300 group-hover:translate-x-2 text-white">&rarr;</span>
            </Link>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-8 sm:min-w-[320px]">
            <div className="flex-1 h-[2px] bg-white/20 relative w-20 hidden md:block">
              <div 
                className="absolute top-0 left-0 h-full bg-white transition-all duration-500"
                style={{ width: `${((indexCurent + 1) / SERVICII.length) * 100}%` }}
              />
            </div>

            <div className="flex items-center gap-6">
              <button 
                onClick={anteriorServiciu}
                className="text-white hover:text-neutral-300 transition-colors py-2 px-1 tracking-widest uppercase touch-manipulation"
              >
                PREV
              </button>
              <span className="text-white/40">|</span>
              <button 
                onClick={urmatorulServiciu}
                className="text-white hover:text-neutral-300 transition-colors py-2 px-1 tracking-widest uppercase touch-manipulation"
              >
                NEXT
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* REPARARE ÎNCĂRCARE CSS ÎN NEXT.JS (FĂRĂ ERORI DE BULIDING) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blurIn {
          from { filter: blur(16px); transform: translateY(10px); opacity: 0; }
          to { filter: blur(0); transform: translateY(0); opacity: 1; }
        }
      `}} />

    </section>
  );
}
