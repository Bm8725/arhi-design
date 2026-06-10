"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

const SERVICII = [
  {
    id: "01",
    titlu: "Arhitectură Rezidențială",
    descriere: "Vile unicat și ansambluri premium orientate spre integrare organică în sit și volumetrică sculpturală.",
    imagine: "/arhi.jpg", 
    detaliu: "CONCEPT / AUTORIZARE / EXECUȚIE"
  },
  {
    id: "02",
    titlu: "Design Interior Premium",
    descriere: "Schițarea spațiilor interioare prin mobilier customizat, detalii riguroase și materiale brute atemporale.",
    imagine: "/interior.jpg",
    detaliu: "RANDĂRI 4K / DETALII TEHNICE"
  },
  {
    id: "03",
    titlu: "Proiectare Comercială",
    descriere: "Spații de birouri boutique și showroom-uri conceptuale care combină funcționalitatea cu estetica.",
    imagine: "/comercial.jpg",
    detaliu: "RETAIL / CORPORATE / URBANISM"
  }
];

export default function Hero() {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [indexCurent, setIndexCurent] = useState(0);

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
    setIndexCurent((prev) => (prev + 1) % SERVICII.length);
  };

  const anteriorServiciu = () => {
    setIndexCurent((prev) => (prev - 1 + SERVICII.length) % SERVICII.length);
  };

  return (
    <section className="relative w-full h-screen bg-black text-white overflow-hidden select-none group/hero">
      
      {/* 1. IMAGINEA FULL-SCREEN (LUMINOZITATE 100% - FĂRĂ FILTRU NEGRU) */}
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
              group-hover/hero:grayscale-0
              active:grayscale-0
              ${i === indexCurent ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-102 invisible'}`}
            style={{ backgroundImage: `url('${serviciu.imagine}')` }}
          />
        ))}
      </div>

      {/* GRILA TEHNICĂ ULTRA-DISCRETĂ PENTRU ASPECT DE SCHIȚĂ */}
      <div className="absolute inset-0 grid grid-cols-4 pointer-events-none z-10 opacity-10">
        <div className="border-r border-white/[0.1] h-full" />
        <div className="border-r border-white/[0.1] h-full" />
        <div className="border-r border-white/[0.1] h-full" />
        <div className="h-full" />
      </div>

      {/* 2. CONȚINUTUL PLUTITOR - DROP-SHADOW INTENS PENTRU LIZIBILITATE PE ALB/CULORI */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-12 lg:p-20 drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]">
        
        {/* TOP ROW: LOGO ȘI INDEX */}
        <div className="w-full flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-[0.4em] text-white/70 uppercase block">
              / STUDIO ARHITECTURĂ
            </span>
            <div className="text-xs font-mono tracking-widest text-white font-bold">
              ARHI.<span className="italic text-neutral-200">DESIGN</span>
            </div>
          </div>
          
          <div className="font-mono text-xs text-white/70 tracking-widest mt-1 font-bold">
            [{SERVICII[indexCurent].id}]
          </div>
        </div>

        {/* CENTER/MAIN ROW: TITLURI PESTE IMAGINEA CURATĂ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-end w-full my-auto">
          
          {/* SLOGAN STÂNGA */}
          <div className="lg:col-span-6 space-y-4">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-none text-white uppercase drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)]">
              Formă.<br />
              <span className="font-light text-white/80 italic lowercase">Funcție.</span><br />
              Spațiu.
            </h1>
          </div>

          {/* CASĂ TEXT DINAMICĂ DREAPTA */}
          <div className="lg:col-span-6 space-y-4 lg:max-w-md lg:justify-self-end border-l-2 border-white pl-6 lg:pl-8 py-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            <span className="text-[10px] font-mono tracking-widest text-white/90 uppercase block font-bold">
              {SERVICII[indexCurent].detaliu}
            </span>
            <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-white uppercase">
              {SERVICII[indexCurent].titlu}
            </h2>
            <p className="text-white font-medium text-xs sm:text-sm leading-relaxed tracking-wide opacity-95">
              {SERVICII[indexCurent].descriere}
            </p>
          </div>

        </div>

        {/* BOTTOM ROW: CONTROALE ȘI PORTOFOLIU */}
        <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 pt-4 border-t border-white/30 font-mono text-[11px] font-bold">
          
          {/* LINK PORTOFOLIU */}
          <div>
            <Link 
              href="/portofoliu" 
              className="group inline-flex items-center gap-4 text-[10px] font-mono tracking-[0.3em] uppercase text-white hover:scale-105 transition-transform"
            >
              EXPLOREAZĂ PORTOFOLIU
              <span className="transition-transform duration-300 group-hover:translate-x-2 text-white">→</span>
            </Link>
          </div>

          {/* CONTROALE NAVIGARE */}
          <div className="flex items-center justify-between sm:justify-end gap-8 sm:min-w-[300px]">
            <div className="text-white tracking-widest">
              <span className="text-white font-black">{SERVICII[indexCurent].id}</span> / 0{SERVICII.length}
            </div>

            <div className="flex items-center gap-6">
              <button 
                onClick={anteriorServiciu}
                className="text-white/80 hover:text-white transition-colors py-2 px-1 tracking-widest uppercase touch-manipulation"
              >
                PREV
              </button>
              <span className="text-white/40">|</span>
              <button 
                onClick={urmatorulServiciu}
                className="text-white/80 hover:text-white transition-colors py-2 px-1 tracking-widest uppercase touch-manipulation"
              >
                NEXT
              </button>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
