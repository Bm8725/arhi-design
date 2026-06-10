"use client";

import Link from 'next/link';
import { ArrowUp, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  // Funcție fluidă pentru întoarcere sus (Scroll to top)
  const scrolleazaSus = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#faf8f5] text-[#121212] border-t border-[#e5e0d8] pt-20 pb-8 px-6 relative overflow-hidden transition-colors duration-500">
      
      {/* BRANDING ȘI GRID PRINCIPAL */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-[#e5e0d8]/60">
        
        {/* COLOANA 1: LOGO ȘI DESCRIERE (5 coloane pe desktop) */}
        <div className="md:col-span-5 space-y-6">
          <Link href="/" className="text-2xl font-light tracking-[0.25em] uppercase group">
            Pro<span className="font-semibold text-gray-400 group-hover:text-black transition-colors duration-300">arh.4d</span>
          </Link>
          <p className="text-xs text-[#7c7265] max-w-sm leading-relaxed font-light">
            Schițăm viitorul prin volume pure și materiale brute. Un studio dedicat arhitecturii rezidențiale de lux și designului interior atemporal.
          </p>
          {/* REȚELE SOCIALE */}
          <div className="flex items-center gap-4 pt-2">

          </div>
        </div>

        {/* COLOANA 2: LINKURI RAPIDE (3 coloane pe desktop) */}
        <div className="md:col-span-3 space-y-4">
          <h4 className="text-[10px] font-mono tracking-[0.25em] text-[#8c8275] uppercase font-bold">Navigare</h4>
          <div className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wider text-[#554d42]">
            <Link href="/" className="hover:text-black transition-colors w-fit">Acasă</Link>
            <Link href="/portofoliu" className="hover:text-black transition-colors w-fit">Portofoliu</Link>
            <Link href="/servicii" className="hover:text-black transition-colors w-fit">Despre noi</Link>
            <Link href="/404" className="hover:text-black transition-colors w-fit">Politica de confidențialitate</Link>
            <Link href="/404" className="hover:text-black transition-colors w-fit">GDPR</Link>
          </div>
        </div>

        {/* COLOANA 3: DATE CONTACT / STUDIO (4 coloane pe desktop) */}
        <div className="md:col-span-4 space-y-4">
          <h4 className="text-[10px] font-mono tracking-[0.25em] text-[#8c8275] uppercase font-bold">Atelier Targoviste</h4>
          <div className="space-y-3 text-xs font-light text-[#554d42]">
            <div className="flex items-center gap-3">
              <MapPin size={14} className="text-[#8c8275]" strokeWidth={1.5} />
              <span>Strada Arhitecților Nr. 24, Targoviste </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={14} className="text-[#8c8275]" strokeWidth={1.5} />
              <Link href="tel:+40700000000" className="hover:text-black transition-colors">+40 7xx xxx xxx</Link>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={14} className="text-[#8c8275]" strokeWidth={1.5} />
              <Link href="mailto:office@arhi.design" className="hover:text-black transition-colors">office@arhi.design</Link>
            </div>
          </div>
        </div>

      </div>

      {/* ZONA INFERIOARĂ: COPYRIGHT ȘI BACK TO TOP */}
      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* TEXT COPYRIGHT */}
        <div className="text-[10px] font-mono text-[#8c8275] tracking-widest uppercase text-center sm:text-left">
          © {new Date().getFullYear()} ProArhi.4D birou de arhitectura. All rights reserved.
        </div>

        {/* BUTON BACK TO TOP ANIMAT */}
        <button 
          onClick={scrolleazaSus}
          className="group flex items-center gap-3 text-[10px] font-mono tracking-widest uppercase text-[#554d42] hover:text-black transition-colors focus:outline-none cursor-pointer"
        >
          <span>up</span>
          <span className="p-2 border border-[#e5e0d8] group-hover:border-black group-hover:-translate-y-1 transition-all duration-300">
            <ArrowUp size={12} strokeWidth={2} />
          </span>
        </button>

      </div>
    </footer>
  );
}
