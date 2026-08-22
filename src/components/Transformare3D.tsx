"use client";

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { Eye, MoveHorizontal } from 'lucide-react';

const IMG_AFTER  = '/design.webp';
const IMG_BEFORE = '/plan.webp';

export default function Transformare3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const percentage = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    
    // Modifică direct variabila CSS nativă pentru clip-path și poziția barieră
    containerRef.current.style.setProperty('--slider-pos', `${percentage}%`);
    
    // Actualizează dinamic clasa de vizibilitate a textelor în funcție de procentaj
    const labelBefore = containerRef.current.querySelector('.t3-lbl-before') as HTMLElement;
    const labelAfter = containerRef.current.querySelector('.t3-lbl-after') as HTMLElement;
    
    if (labelBefore) labelBefore.style.opacity = percentage > 15 ? '1' : '0';
    if (labelAfter) labelAfter.style.opacity = percentage < 85 ? '1' : '0';

    // Actualizează procentajul textual din subsol
    const percentEl = containerRef.current.parentElement?.querySelector('.t3-percent-raw');
    if (percentEl) {
      percentEl.textContent = `${Math.round(percentage)}% / ${Math.round(100 - percentage)}%`;
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      updatePosition(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      if (e.touches.length > 0) updatePosition(e.touches[0].clientX);
    };

    const handleMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  return (
    <section className="bg-black py-24 px-6 md:px-10 border-t border-[#111] font-mono select-none">
      <div className="max-w-[1200px] mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row gap-6 mb-14 md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3.5">
              <span className="h-[1px] w-7 bg-[#333]" />
              <span className="text-[9px] tracking-[0.32em] uppercase text-[#444]">Concept vs Realitate</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-light text-white tracking-tight leading-tight">
              De la schiță la <em className="not-italic text-[#888]">plan concret</em>
            </h2>
          </div>
          <p className="text-[11px] text-[#444] leading-relaxed max-w-[280px] tracking-wide">
            Trage cursorul pentru a vedea transformarea de la liniile tehnice CAD la randarea 3D finală.
          </p>
        </div>

        {/* CONTAINER REPARAT CU IMAGINI PRE-ÎNCĂRCATE */}
        <div
          ref={containerRef}
          className="relative w-full h-[420px] md:h-[620px] overflow-hidden cursor-ew-resize border border-[#1a1a1a] bg-black"
          style={{ '--slider-pos': '50%' } as React.CSSProperties}
          onMouseDown={(e) => {
            isDragging.current = true;
            updatePosition(e.clientX);
          }}
          onTouchStart={(e) => {
            isDragging.current = true;
            if (e.touches.length > 0) updatePosition(e.touches[0].clientX);
          }}
        >
          {/* DRUMUL DREAPTA: Image Next.js cu prioritate înaltă ca fundal de bază */}
          <div className="absolute inset-0 brightness-[0.85] z-1">
            <Image 
              src={IMG_AFTER} 
              alt="Randare 3D" 
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover object-center"
            />
          </div>

          {/* DRUMUL STÂNGA: Planul tehnic tăiat prin clip-path */}
          <div
            className="absolute inset-0 grayscale-[0.3] brightness-90 z-2 will-change-[clip-path]"
            style={{
              clipPath: 'polygon(0 0, var(--slider-pos) 0, var(--slider-pos) 100%, 0 100%)',
            }}
          >
            <Image 
              src={IMG_BEFORE} 
              alt="Schiță Tehnică CAD" 
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover object-center"
            />
          </div>

          {/* CLASE CURATE PENTRU LABELS PENTRU EVITAREA EROAREI CSS */}
          <div className="t3-lbl-before absolute bottom-5 left-5 text-[9px] tracking-[0.28em] uppercase pointer-events-none z-10 px-3.5 py-1.5 backdrop-blur-md bg-white/5 border border-white/10 text-white transition-opacity duration-300 opacity-100">
            Schiță Tehnică
          </div>
          
          <div className="t3-lbl-after absolute bottom-5 right-5 text-[9px] tracking-[0.28em] uppercase pointer-events-none z-10 px-3.5 py-1.5 backdrop-blur-md bg-black/50 border border-[#222] text-[#666] transition-opacity duration-300 opacity-100">
            Randare 3D
          </div>

          {/* DIVIDER LINE */}
          <div 
            className="absolute top-0 bottom-0 w-[1px] bg-white z-20 pointer-events-none will-change-[left]" 
            style={{ left: 'var(--slider-pos)' }}
          >
            <div className="absolute left-1/2 -translate-x-1/2 w-[1px] h-5 bg-white/50 top-0" />
            <div className="absolute left-1/2 -translate-x-1/2 w-[1px] h-5 bg-white/50 bottom-0" />
            
            {/* HANDLE BUTTON */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.6)] transition-transform duration-150 cursor-ew-resize z-21">
              <MoveHorizontal size={16} strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-5 flex justify-between items-center text-[#2e2e2e]">
          <div className="flex items-center gap-2 text-[9px] tracking-widest uppercase">
            <Eye size={11} />
            <span>Drag to compare</span>
          </div>
          <div className="t3-percent-raw text-[9px] tracking-widest tabular-nums">50% / 50%</div>
        </div>

      </div>
    </section>
  );
}
