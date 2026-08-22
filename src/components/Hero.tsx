"use client";

import { useState, useRef } from 'react';
import Link from 'next/link';

export default function Hero() {
  // Păstrăm doar statul pentru controlul tranziției video-ului
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <section className="relative w-full h-screen bg-black text-white overflow-hidden select-none group/hero">
      
      {/* 1. BACKGROUND VIDEO STATIC (FĂRĂ TILT / ÎNCĂRCARE CPU) CU TRANZIȚIE LENTĂ */}
      <div className="absolute inset-0 w-full h-full bg-black"> 
        
        {/* Poster static stratificat dedesubt – se dizolvă lent (2.5 secunde) */}
        <div 
          className={`absolute inset-0 bg-cover bg-center transition-all duration-[2500ms] ease-in-out z-10 ${
            isVideoLoaded ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
          }`}
          style={{ backgroundImage: "url('/nimet.webp')" }}
        />

        {/* Instanța video WebM */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          src="/arhidesign.webm"
          // Setăm viteza redusă direct pe onCanPlay
          onCanPlay={() => {
            if (videoRef.current) videoRef.current.playbackRate = 1;
          }}
          // Pornim cross-fade-ul fluid doar când video-ul rulează stabil
          onPlaying={() => setIsVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2500ms] ease-in-out ${
            isVideoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        
        {/* Overlay discret întunecat pentru contrast maxim cu textul */}
        <div className="absolute inset-0 bg-black/30 z-11 pointer-events-none" />
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
        
        {/* TOP ROW: LOGO ȘI DATE BRAND */}
        <div className="w-full flex justify-between items-start pt-10 pb-6 border-b border-white/5">
          <div className="space-y-2 group cursor-default">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-[0.4em] text-white/60 uppercase block transition-colors duration-300 group-hover:text-white">
                ARH. Bogdan Șotîngeanu
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-mono tracking-[0.25em] text-white font-black uppercase">
                PROARH<span className="text-yellow-400">.4D</span>
              </div>
              <div className="text-[10px] font-mono tracking-wider text-neutral-400 italic font-medium max-w-xs sm:max-w-none leading-relaxed">
                birou de proiectare și consultanță arhitecturală
              </div>
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
          <div className="group lg:col-span-6 space-y-5 lg:max-w-md lg:justify-self-end relative px-6 lg:px-8 py-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all duration-500 hover:border-yellow-400/40 hover:shadow-[0_0_30px_rgba(234,179,8,0.15)] overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-white via-white/50 to-transparent group-hover:from-yellow-400 group-hover:via-amber-500 group-hover:to-transparent transition-all duration-500" />
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
              <span className="absolute inset-0 -z-10 rounded-lg bg-yellow-400/60 blur-md opacity-75 animate-pulse group-hover:blur-xl group-hover:bg-yellow-400 transition-all duration-300"></span>
              EXPLOREAZĂ PORTOFOLIU 
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-2">
                →
              </span>
            </Link>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-8 sm:min-w-[300px]" />
        </div>

      </div>
    </section>
  );
}
