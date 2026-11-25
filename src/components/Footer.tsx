"use client";

import Link from 'next/link';

const VisaIcon = () => (
  <svg viewBox="0 0 48 32" className="h-5 w-auto" aria-label="Visa" role="img">
    <rect width="48" height="32" rx="4" fill="currentColor" fillOpacity="0.08" />
    <text
      x="24"
      y="21"
      textAnchor="middle"
      fontSize="14"
      fontWeight="700"
      fontStyle="italic"
      fontFamily="Arial, sans-serif"
      fill="currentColor"
    >
      VISA
    </text>
  </svg>
);

const MastercardIcon = () => (
  <svg viewBox="0 0 48 32" className="h-5 w-auto" aria-label="Mastercard" role="img">
    <rect width="48" height="32" rx="4" fill="currentColor" fillOpacity="0.08" />
    <circle cx="19" cy="16" r="9" fill="#eb001b" fillOpacity="0.85" />
    <circle cx="29" cy="16" r="9" fill="#f79e1b" fillOpacity="0.85" />
  </svg>
);

const StripeIcon = () => (
  <svg viewBox="0 0 48 32" className="h-5 w-auto" aria-label="Stripe" role="img">
    <rect width="48" height="32" rx="4" fill="currentColor" fillOpacity="0.08" />
    <text
      x="24"
      y="21"
      textAnchor="middle"
      fontSize="12"
      fontWeight="700"
      fontFamily="Arial, sans-serif"
      fill="currentColor"
    >
      stripe
    </text>
  </svg>
);

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
              <span>PRO<span className="text-[#e2b36e] font-normal">ARH.4D</span></span>
            </Link>
            <p className="text-[10px] text-white/30 tracking-wider uppercase max-w-xs leading-relaxed font-light">
              Birou arhitectura. nZEB. Proiectare 3D. Consultanta. Complet digital.
            </p>
          </div>

          {/* LINK-URI RADICAL DE MINIMALISTE + ANPC / SOL */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-x-12 gap-y-6">
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-[10px] uppercase tracking-[0.2em] text-white/40">
              <Link href="/noi" className="hover:text-white transition-colors duration-300">Despre Noi</Link>
              <Link href="/kiosk" className="hover:text-white transition-colors duration-300">kiosk mode</Link>
              <Link href="/termeni-conditii" className="hover:text-white transition-colors duration-300">Termeni si Conditii</Link>
              <Link href="/politica-confidentialitate" className="hover:text-white transition-colors duration-300">Confidentialitate</Link>
              <Link href="/politica-cookie" className="hover:text-white transition-colors duration-300">Cookie</Link>
            </div>

            {/* Container Secundar pentru Legalitate și Plăți Securizate */}
            <div className="flex flex-col items-start sm:items-end gap-2 pt-2 lg:pt-0">
              {/* Imagini ANPC și SOL integrate discret */}
              <div className="flex items-center gap-3">
                <a 
                  href="https://anpc.ro" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="opacity-40 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300"
                >
                  <img 
                    src="/anpc.webp" 
                    alt="ANPC" 
                    className="h-7 w-auto object-contain"
                  />
                </a>
                <a 
                  href="https://europa.eu" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="opacity-40 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300"
                >
                  <img 
                    src="/anpc.png" 
                    alt="SOL" 
                    className="h-7 w-auto object-contain"
                  />
                </a>
              </div>

              {/* Metode de plată */}
              <div className="flex items-center gap-2 text-white/30">
                <div className="opacity-40 hover:opacity-100 transition-opacity duration-300">
                  <VisaIcon />
                </div>
                <div className="opacity-40 hover:opacity-100 transition-opacity duration-300">
                  <MastercardIcon />
                </div>
                <div className="opacity-40 hover:opacity-100 transition-opacity duration-300">
                  <StripeIcon />
                </div>
                <span className="text-[8px] text-white/20 uppercase tracking-[0.2em] whitespace-nowrap ml-1">
                  SECURE CHECKOUT
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* LINIE GEOMETRICĂ DISCRETĂ */}
        <div className="w-full h-[1px] bg-gradient-to-r from-white/[0.06] via-white/[0.02] to-transparent" />

        {/* RÂNDUL INFERIOR: COPYRIGHT ȘI BUTON DE SCROLL */}
        <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.25em] text-white/30">
          
          <div>
            © {new Date().getFullYear()} PROARH4D.RO. ALL RIGHTS RESERVED.
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