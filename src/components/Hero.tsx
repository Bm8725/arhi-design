"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

export default function Hero() {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);

  // Efect pentru mișcarea 3D pe mouse
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

  // Efect pentru încetinirea vitezei video-ului
  useEffect(() => {
    if (videoRef.current) {
      // 1.0 = viteză normală | 0.75 = mai încet | 0.5 = jumătate din viteză
      videoRef.current.playbackRate = 0.25; 
    }
  }, []);

  return (
    <section className="relative w-full h-screen bg-black text-white overflow-hidden select-none group/hero">
      
      {/* 1. BACKGROUND VIDEO MP4 FULL-SCREEN CU EFECT 3D TILT - VITEZĂ REDUSĂ */}
      <div 
        className="absolute inset-0 w-full h-full transition-transform duration-700 ease-out"
        style={{
          transform: `scale(1.02) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: 'preserve-3d'
        }}
      > 
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          src="/arhidesign.mp4"
          className="absolute inset-0 w-full h-full object-cover"
        />
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
        
{/* TOP ROW: LOGO ȘI CĂUTARE */}
<div className="w-full flex justify-between items-start pt-10 pb-6 border-b border-white/5">
  <div className="space-y-2 group cursor-default">
    {/* Numele arhitectului cu un indicator minimalist */}
    <div className="flex items-center gap-2">

      <span className="text-[10px] font-mono tracking-[0.4em] text-white/60 uppercase block transition-colors duration-300 group-hover:text-white">
        ARH. BOGDAN SOTANGEANU
      </span>
    </div>

    {/* Brand-ul principal structurat curat */}
    <div className="space-y-1">
      <div className="text-sm font-mono tracking-[0.25em] text-white font-black uppercase">
        PROARH<span className="text-yellow-400">.4D</span>
      </div>
      <div className="text-[10px] font-mono tracking-wider text-neutral-400 italic font-medium max-w-xs sm:max-w-none leading-relaxed">
        birou de proiectare și consultanță arhitecturală
      </div>
    </div>
  </div>
  
  {/* Aici poți plasa componenta de căutare sau meniul în dreapta */}
</div>


        {/* CENTER/MAIN ROW: TITLURI PESTE VIDEO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-end w-full my-auto">
          
          {/* SLOGAN STÂNGA */}
          <div className="lg:col-span-6 space-y-4">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-none text-white uppercase drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)]">
              Formă.<br />
              <span className="font-light text-white/80 italic lowercase">Funcție.</span><br />
              Spațiu.
            </h1>
          </div>

{/* CASĂ TEXT DREAPTA FIXĂ PENTRU REZIDENȚIAL / PREMIUM */}
<div className="group lg:col-span-6 space-y-5 lg:max-w-md lg:justify-self-end relative px-6 lg:px-8 py-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all duration-500 hover:border-yellow-400/40 hover:shadow-[0_0_30px_rgba(234,179,8,0.15)] overflow-hidden">
  
  {/* Linie decorativă stânga cu gradient animat */}
  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-white via-white/50 to-transparent group-hover:from-yellow-400 group-hover:via-amber-500 group-hover:to-transparent transition-all duration-500" />

  {/* Efect discret de lumină ambientală (Glow) în fundal la hover */}
  <div className="absolute -inset-px bg-gradient-to-r from-yellow-500/0 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl -z-10" />

  <div className="space-y-2">
    <span className="text-[10px] font-mono tracking-[0.25em] text-yellow-400 uppercase block font-bold transition-colors duration-300">
      CONCEPT / CONSULTANȚĂ / AUTORIZARE / EXECUȚIE
    </span>
    
    <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-white uppercase leading-tight transition-transform duration-500 group-hover:translate-x-1">
      Arhitectură Rezidențială <span className="text-yellow-400">.</span>
    </h2>
  </div>

  <p className="text-white/90 font-normal text-xs sm:text-sm leading-relaxed tracking-wide transition-all duration-500 group-hover:text-white">
    Case și vile unicat, ansambluri premium și spații interioare arhitecturale configurate prin detalii riguroase și materiale moderne.
  </p>
</div>


        </div>

        {/* BOTTOM ROW: CONTROALE ȘI PORTOFOLIU */}
        <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 pt-4 border-t border-white/30 font-mono text-[11px] font-bold">
          
        <div>
          <Link 
            href="/portofoliu" 
            className="group relative inline-flex items-center gap-4 px-6 py-3 rounded-lg bg-yellow-400 text-[14px] font-mono font-bold tracking-[0.3em] uppercase text-black transition-all duration-300 hover:scale-105 hover:bg-yellow-300"
          >
            {/* Efectul de blur din spate (Glow animat) */}
            <span className="absolute inset-0 -z-10 rounded-lg bg-yellow-400/60 blur-md opacity-75 animate-pulse group-hover:blur-xl group-hover:bg-yellow-400 transition-all duration-300"></span>
            
            EXPLOREAZĂ PORTOFOLIU 
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-2">
              →
            </span>
          </Link>
        </div>


          {/* INDICAȚIE MEDIA ÎN LOC DE CONTROALE DE SLIDER */}
          <div className="flex items-center justify-between sm:justify-end gap-8 sm:min-w-[300px]">

          </div>

        </div>

      </div>

    </section>
  );
}
