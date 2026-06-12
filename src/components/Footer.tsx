"use client";

import Link from 'next/link';
import { ArrowUp, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  const scrolleazaSus = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full bg-[#0c0c0c] text-[#e0e0e0] border-t border-white/10 pt-24 pb-12 px-6 relative overflow-hidden font-sans">
      
      {/* Detalii de fundal ambiental - identice cu restul site-ului dark */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          
          {/* COLOANA 1: LOGO ȘI FILOSOFIE */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="text-xl font-light tracking-[0.3em] uppercase block text-white font-mono">
              Pro<span className="font-medium text-[#e2b36e] transition-colors duration-300">arh.4d</span>
            </Link>
            <p className="text-xs text-white/50 max-w-sm leading-relaxed font-light font-mono">
              Schițăm viitorul prin volume pure și materiale brute. Un studio dedicat arhitecturii rezidențiale de lux și designului interior atemporal.
            </p>
          </div>

          {/* COLOANA 2: NAVIGARE PREMIUM */}
          <div className="md:col-span-3 space-y-5">
            <h4 className="text-[9px] font-mono tracking-[0.3em] text-[#e2b36e] uppercase font-medium">Navigare</h4>
            <div className="flex flex-col gap-3 text-[10px] font-mono uppercase tracking-widest text-white/60">
              <Link href="/" className="hover:text-white hover:translate-x-1 transition-all duration-200 w-fit">Acasă</Link>
              <Link href="/portofoliu" className="hover:text-white hover:translate-x-1 transition-all duration-200 w-fit">Portofoliu</Link>
              <Link href="/noi" className="hover:text-white hover:translate-x-1 transition-all duration-200 w-fit">Despre noi</Link>
              <Link href="/privacy" className="hover:text-white hover:translate-x-1 transition-all duration-200 w-fit">Politica de confidențialitate</Link>
              <Link href="/gdpr" className="hover:text-white hover:translate-x-1 transition-all duration-200 w-fit">GDPR</Link>
            </div>
          </div>

          {/* COLOANA 3: DATE CONTACT ATELIER */}
          <div className="md:col-span-4 space-y-5">
            <h4 className="text-[9px] font-mono tracking-[0.3em] text-[#e2b36e] uppercase font-medium">Atelier Târgoviște</h4>
            <div className="space-y-4 text-xs font-mono text-white/60">
              <div className="flex items-start gap-3">
                <MapPin size={14} className="text-[#e2b36e] shrink-0 mt-0.5" strokeWidth={1.5} />
                <span className="text-white/70 leading-relaxed text-[11px]">Strada Arhitecților Nr. 24, Târgoviște</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={14} className="text-[#e2b36e] shrink-0" strokeWidth={1.5} />
                <Link href="tel:+40700000000" className="hover:text-white transition-colors text-[11px]">+40 7xx xxx xxx</Link>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={14} className="text-[#e2b36e] shrink-0" strokeWidth={1.5} />
                <Link href="mailto:office@arhi.design" className="hover:text-white transition-colors text-[11px]">office@arhi.design</Link>
              </div>
            </div>
          </div>

        </div>

        {/* ZONA INFERIOARĂ */}
        <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* TEXT COPYRIGHT CURAT */}
          <div className="text-[9px] font-mono text-white/40 tracking-[0.2em] uppercase text-center sm:text-left">
            © {new Date().getFullYear()} ProArhi.4D birou de arhitectură. All rights reserved.
          </div>

          {/* BUTON BACK TO TOP MINIMALIST */}
          <button 
            onClick={scrolleazaSus}
            className="group flex items-center gap-4 text-[9px] font-mono tracking-[0.3em] uppercase text-white/60 hover:text-white transition-colors focus:outline-none cursor-pointer"
          >
            <span>up</span>
            <span className="p-2.5 border border-white/10 bg-white/5 rounded-none group-hover:border-[#e2b36e] group-hover:-translate-y-1 transition-all duration-300">
              <ArrowUp size={12} className="text-[#e2b36e] group-hover:text-white transition-colors" strokeWidth={2} />
            </span>
          </button>

        </div>
      </div>
    </footer>
  );
}
