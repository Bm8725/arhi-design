'use client';

import React, { useState, useRef, MouseEvent } from 'react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

interface SpaceDesign {
  id: number;
  title: string;
  category: string;
  year: string;
  image: string;
}

const DESIGNS: SpaceDesign[] = [
  {
    id: 1,
    title: "Living Obsidian",
    category: "Brutalism Luxos",
    year: "2026",
    image: "https://unsplash.com"
  },
  {
    id: 2,
    title: "Dune Penthouse",
    category: "Minimalist Organic",
    year: "2025",
    image: "https://unsplash.com"
  },
  {
    id: 3,
    title: "Elysian Kitchen",
    category: "Neo-Clasic Marmorat",
    year: "2026",
    image: "https://unsplash.com"
  }
];

export default function InteriorWoowHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const box = containerRef.current.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    
    setRotateX(-y / 35);
    setRotateY(x / 35);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div className="w-full bg-[#0d0d0d] text-white">
      {/* 1. NAVBAR - Plasat în fluxul normal global */}
      <Navbar />

      {/* 2. HERO SECTION */}
      <section className="relative w-full min-h-[calc(100vh-76px)] overflow-hidden flex items-center p-6 md:p-12 selection:bg-amber-500 selection:text-black">
        
        {/* Background dinamic cu reflexie difuză */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div 
            className="absolute -top-[40%] -left-[20%] w-[80vw] h-[80vw] bg-amber-500/10 rounded-full blur-[150px] transition-all duration-1000"
            style={{ transform: `translate(${rotateY * 2}px, ${rotateX * 2}px)` }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#0d0d0d_80%)]" />
        </div>

        {/* ZONA CENTRALĂ (RESPONSIVE) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full max-w-7xl mx-auto py-12">
          
          {/* TEXT STÂNGA */}
          <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col justify-center h-full">
            <div className="overflow-hidden mb-2">
              <span className="text-amber-400 text-xs font-mono tracking-wider block animate-fade-in">
                {DESIGNS[activeIndex].category} — {DESIGNS[activeIndex].year}
              </span>
            </div>
            
            <div className="h-[70px] md:h-[120px] overflow-hidden mb-4 md:mb-6">
              <h2 className="text-4xl md:text-6xl font-extralight tracking-tight leading-none uppercase">
                {DESIGNS[activeIndex].title}
              </h2>
            </div>

            <p className="text-neutral-400 text-sm md:text-base max-w-sm font-light leading-relaxed mb-8">
              Redefinim spațiile rezidențiale prin linii arhitecturale sculpturale, materiale brute și o geometrie impecabilă a luminii absolute.
            </p>

            {/* Navigație minimalista sub text */}
            <div className="flex items-center gap-4">
              {DESIGNS.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setActiveIndex(idx)}
                  className="group flex flex-col py-2 focus:outline-none"
                >
                  <div className={`h-[2px] transition-all duration-500 ease-out ${activeIndex === idx ? 'w-12 bg-amber-500' : 'w-6 bg-neutral-700 group-hover:bg-neutral-500'}`} />
                  <span className={`text-[10px] font-mono mt-1 transition-opacity ${activeIndex === idx ? 'text-white opacity-100' : 'text-neutral-500 opacity-50'}`}>
                    0{item.id}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* CARD 3D DREAPTA */}
          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="lg:col-span-7 order-1 lg:order-2 flex justify-center lg:justify-end items-center perspective-[1000px] w-full"
          >
            <div
              className="relative w-full aspect-[4/5] sm:w-[400px] md:w-[450px] lg:w-[480px] bg-neutral-900 rounded-2xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] transition-transform duration-200 ease-out border border-white/5"
              style={{
                transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`,
                transformStyle: 'preserve-3d'
              }}
            >
              {DESIGNS.map((design, idx) => (
                <div
                  key={design.id}
                  className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${activeIndex === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
                  style={{ backgroundImage: `url(${design.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                </div>
              ))}

              <div 
                className="absolute bottom-8 left-8 transition-transform duration-300 pointer-events-none"
            style={{ 
              transform: `translateX(${rotateY * -1}px) translateY(${rotateX * -1}px) translateZ(50px)`
            }}

              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-amber-400 mb-1 font-semibold">Concept Premium</p>
                <p className="text-xl font-light tracking-wide">Spații Cu Caracter.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. FOOTER - Scos în afara secțiunii de hero pentru o ierarhie corectă */}
      <Footer />
    </div>
  );
}
