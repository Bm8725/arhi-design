"use client";

import Link from 'next/link';

export default function Footer() {
  const scrolleazaSus = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full bg-[#0c0c0c] border-t border-white/[0.04] pt-16 pb-10 px-8 relative z-10 font-mono select-none">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* RÂNDUL PRINCIPAL: REZUMAT ȘI NAVIGARE FINĂ */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          
          {/* BRANDING ȘI ABORDARE */}
          <div className="space-y-3">
            <Link href="/" className="text-sm font-light tracking-[0.35em] text-white uppercase flex items-center gap-3">
              <img 
                src="/arhi4d.png" 
                alt="Logo" 
                className="h-6 w-auto object-contain grayscale" 
              />
              <span>PRO<span className="text-[#e2b36e] font-normal">ARH.4D</span>.ro</span>
            </Link>
            <p className="text-[10px] text-white/30 tracking-wider uppercase max-w-xs leading-relaxed font-light">
              Birou arhitectura. nZEB. Proiectare 3D. Consultanta. Complet digital.
            </p>
          </div>


          {/* LINK-URI RADICAL DE MINIMALISTE */}
<div className="flex flex-wrap gap-x-8 gap-y-3 text-[10px] uppercase tracking-[0.2em] text-white/40">
  <Link href="/noi" className="hover:text-white transition-colors duration-300">Despre Noi</Link>
  <Link href="/termeni-conditii" className="hover:text-white transition-colors duration-300">Termeni si Conditii</Link>
  <Link href="/politica-confidentialitate" className="hover:text-white transition-colors duration-300">Confidentialitate</Link>
  <Link href="/politica-cookie" className="hover:text-white transition-colors duration-300">Cookie</Link>
</div>
        </div>

        {/* LINIE GEOMETRICĂ DISCRETĂ */}
        <div className="w-full h-[1px] bg-gradient-to-r from-white/[0.06] via-white/[0.02] to-transparent" />

        {/* RÂNDUL INFERIOR: COPYRIGHT ȘI BUTON DE SCROLL */}
        <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.25em] text-white/30">
          
          <div>
            © {new Date().getFullYear()} PROARH.4D. ALL RIGHTS RESERVED.
          </div>

          {/* BUTON BACK TO TOP INTEGRIZAT FIN ÎN DESIGN */}
          <button 
            onClick={scrolleazaSus}
            className="group flex items-center gap-2 hover:text-[#e2b36e] transition-colors duration-300 cursor-pointer focus:outline-none"
          >
            <span>UP</span>
            <span className="w-8 h-[1px] bg-white/20 group-hover:bg-[#e2b36e] transition-colors duration-300" />
          </button>

        </div>

      </div>
    </footer>
  );
}