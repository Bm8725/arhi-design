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
        <div className="w-full flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-[0.4em] text-white/70 uppercase block">
              / STUDIO ARHITECTURĂ
            </span>
            <div className="text-xs font-mono tracking-widest text-white font-bold">
              ARHI.<span className="italic text-neutral-200">DESIGN</span>
            </div>
          </div>
          

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
          <div className="lg:col-span-6 space-y-4 lg:max-w-md lg:justify-self-end border-l-2 border-white pl-6 lg:pl-8 py-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            <span className="text-[10px] font-mono tracking-widest text-white/90 uppercase block font-bold">
              CONCEPT / AUTORIZARE / EXECUȚIE
            </span>
            <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-white uppercase">
              Arhitectură Rezidențială & proiectare.
            </h2>
            <p className="text-white font-medium text-xs sm:text-sm leading-relaxed tracking-wide opacity-95">
              Case si Vile unicat, ansambluri premium și spații interioare
               arhitecturale configurate prin detalii riguroase și materiale moderne.
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

          {/* INDICAȚIE MEDIA ÎN LOC DE CONTROALE DE SLIDER */}
          <div className="flex items-center justify-between sm:justify-end gap-8 sm:min-w-[300px]">

          </div>

        </div>

      </div>

    </section>
  );
}
