"use client";

import { useState } from 'react';
import { ArrowUpRight, Maximize2 } from 'lucide-react';

export default function ManifestDesign() {
  const [proiectActiv, setProiectActiv] = useState<number | null>(null);

  const proiecte = [
    {
      id: 1,
      numar: "01",
      titlu: "Pavilionul Brutalism Cald",
      locatie: "Cluj-Napoca, RO",
      tip: "Arhitectură Rezidențială",
      imagine: "https://unsplash.com"
    },
    {
      id: 2,
      numar: "02",
      titlu: "Atelierul Monolit",
      locatie: "Ilfov, RO",
      tip: "Spațiu Comercial / Birouri",
      imagine: "https://unsplash.com"
    },
    {
      id: 3,
      numar: "03",
      titlu: "Rezidența Nordică",
      locatie: "Brașov, RO",
      tip: "Design Interior Complet",
      imagine: "https://unsplash.com"
    }
  ];

  return (
    <section className="bg-[#faf8f5] text-[#121212] py-32 px-6 border-t border-[#e5e0d8] relative overflow-hidden transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        
        {/* MANIFESTUL VIZUAL / FILOZOFIA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-32 items-start">
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-[#8c8275]"></span>
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#8c8275] uppercase font-bold">Filozofia Noastră</span>
            </div>
            <h3 className="text-sm font-mono tracking-widest uppercase font-bold text-[#121212]">MANIFEST VIZUAL</h3>
          </div>
          
          <div className="lg:col-span-8">
            <p className="text-3xl md:text-5xl font-extralight font-serif tracking-tight leading-tight text-[#121212] max-w-4xl">
              „Designul nu este doar despre cum arată un spațiu, ci despre cum îți <span className="italic font-normal text-[#6b6255]">măsoară timpul</span> și îți dictează starea.”
            </p>
            <div className="h-[1px] w-32 bg-[#121212] mt-8 mb-6" />
            <p className="text-xs text-[#7c7265] max-w-md leading-relaxed font-light tracking-wide">
              Fiecare volum pe care îl trasăm elimină zgomotul vizual. Lăsăm lumina naturală, betonul brut, lemnul cald și proporțiile geometrice perfecte să definească valoarea reală a unei construcții premium.
            </p>
          </div>
        </div>

        {/* INTERACTIVE EDITORIAL PORTFOLIO GRID */}
        <div className="space-y-4">
          <div className="flex justify-between items-end border-b border-[#e5e0d8] pb-4">
            <span className="text-[10px] font-mono text-[#8c8275] tracking-widest uppercase">Index Lucrări de Semnătură</span>
            <span className="text-[10px] font-mono text-[#8c8275] tracking-widest uppercase">Format [03 / EXP]</span>
          </div>

          <div className="flex flex-col">
            {proiecte.map((proiect, index) => (
              <div 
                key={proiect.id}
                onMouseEnter={() => setProiectActiv(index)}
                onMouseLeave={() => setProiectActiv(null)}
                className="border-b border-[#e5e0d8] py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center group cursor-pointer relative transition-all duration-300 hover:px-4"
              >
                {/* NUMĂR */}
                <div className="md:col-span-1 text-xs font-mono text-[#8c8275]">
                  {proiect.numar}
                </div>

                {/* TITLU ȘI TIP */}
                <div className="md:col-span-6 space-y-1">
                  <h4 className="text-xl md:text-2xl font-light font-serif tracking-tight group-hover:translate-x-2 transition-transform duration-500 ease-out text-[#121212]">
                    {proiect.titlu}
                  </h4>
                  <p className="text-[10px] font-mono text-[#8c8275] uppercase tracking-widest">
                    {proiect.tip}
                  </p>
                </div>

                {/* LOCAȚIE */}
                <div className="md:col-span-3 text-xs text-[#554d42] font-light tracking-wide">
                  {proiect.locatie}
                </div>

                {/* SĂGEATĂ LUX */}
                <div className="md:col-span-2 flex justify-end text-[#8c8275] group-hover:text-[#121212] transition-colors">
                  <ArrowUpRight size={18} className="group-hover:rotate-45 transition-transform duration-500" strokeWidth={1} />
                </div>

                {/* FLOATING HOVER CARD IMAGE (WOW VISUAL EFFECT) */}
                <div 
                  className={`absolute right-[15%] top-1/2 -translate-y-1/2 w-[320px] aspect-[4/5] z-30 pointer-events-none overflow-hidden border border-[#e5e0d8] shadow-[0_30px_70px_rgba(0,0,0,0.12)] transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
                    proiectActiv === index 
                      ? 'opacity-100 scale-100 translate-x-0' 
                      : 'opacity-0 scale-95 translate-x-4'
                  }`}
                >
                  <div 
                    className="w-full h-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                    style={{ backgroundImage: `url('${proiect.imagine}')` }}
                  />
                  <div className="absolute inset-0 bg-black/5" />
                  <div className="absolute bottom-4 left-4 text-[9px] font-mono uppercase bg-white/90 text-black px-2 py-1 tracking-widest backdrop-blur-sm flex items-center gap-1">
                    <Maximize2 size={8} /> Detalii Concept
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
