"use client";

import { useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, Maximize2 } from 'lucide-react';
import Link from 'next/link';

export default function ManifestDesign() {
  const [proiectActiv, setProiectActiv] = useState<number | null>(null);

  const proiecte = [
    {
      id: 1,
      numar: "01",
      titlu: "Centru training clădire P+1",
      locatie: "Romania",
      tip: "Arhitectură Rezidențială",
      imagine: "/centru_training.jpg"
    },
    {
      id: 2,
      numar: "02",
      titlu: "NIMET, zona industriala",
      locatie: "Dambovita, Romania",
      tip: "Spațiu administrativ / Birouri",
      imagine: "/nimet.png"
    },
    {
      id: 3,
      numar: "03",
      titlu: " Parohia Poroinica",
      locatie: "sat Tețcoiu, com. Mătăsaru (Dambovita), RO– în curs de execuție",
      tip: "Lacas de Cult",
      imagine: "/biserica.png"
    },
        {
      id: 4,
      numar: "04",
      titlu: " Locuință unifamilială contemporană P+1",
      locatie: "Romania",
      tip: "Locuință unifamilială",
      imagine: "/barbu.png"
    },
            {
      id: 5,
      numar: "05",
      titlu: " Spații comerciale – Micro VI",
      locatie: "Targoviste, Romania",
      tip: "Spații comerciale",
      imagine: "/spa.png"
    },

                {
      id: 6,
      numar: "06",
      titlu: " Ansamblu recreativ cu corp de cazare și cramă – Târgoviște",
      locatie: "Targoviste, Romania",
      tip: "Servicii publice",
      imagine: "/samy.png"
    }
  ];

  return (
    <section className="bg-[#faf8f5] text-[#121212] py-16 sm:py-20 md:py-32 px-4 sm:px-6 border-t border-[#e5e0d8] relative transition-colors duration-500">
      <div className="max-w-7xl mx-auto">

        {/* MANIFESTUL VIZUAL / FILOZOFIA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-16 mb-16 sm:mb-20 md:mb-32 items-start">
          <div className="lg:col-span-4 space-y-2 lg:space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-[#8c8275]"></span>
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#8c8275] uppercase font-bold">Filozofia Noastră</span>
            </div>
            <h3 className="text-sm font-mono tracking-widest uppercase font-bold text-[#121212]">MANIFEST VIZUAL</h3>
          </div>

          <div className="lg:col-span-8">
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-extralight font-serif tracking-tight leading-tight text-[#121212] max-w-4xl">
              „Designul nu este doar despre cum arată un spațiu, ci despre comment îți <span className="italic font-normal text-[#6b6255]">măsoară timpul</span> și îți dictează starea.”
            </p>
            <div className="h-[1px] w-24 sm:w-32 bg-[#121212] mt-5 sm:mt-6 md:mt-8 mb-4 md:mb-6" />
            <p className="text-xs text-[#7c7265] max-w-md leading-relaxed font-light tracking-wide">
              Fiecare volum pe care îl trasăm elimină zgomotul vizual. Lăsăm lumina naturală, betonul brut, lemnul cald și proporțiile geometrice perfecte să definească valoarea reală a unei construcții premium.
            </p>
          </div>
        </div>

        {/* INTERACTIVE EDITORIAL PORTFOLIO GRID */}
        <div className="space-y-4">
          <div className="flex justify-between items-end border-b border-[#e5e0d8] pb-4">
            <span className="text-[10px] font-mono text-[#8c8275] tracking-widest uppercase">Lucrari sub semnatura </span>
            <span className="text-[10px] font-mono text-[#8c8275] tracking-widest uppercase hidden sm:inline">Format [03 / EXP]</span>
          </div>

          <div className="flex flex-col">
            {proiecte.map((proiect, index) => (
              <Link
                href="/portofoliu"
                key={proiect.id}
                onMouseEnter={() => setProiectActiv(index)}
                onMouseLeave={() => setProiectActiv(null)}
                className={`border-b border-[#e5e0d8] group relative block transition-colors duration-300 hover:bg-[#f5f1ea]/40 active:bg-[#f5f1ea]/60 ${
                  proiectActiv === index ? "z-40" : "z-0"
                }`}
              >
                {/* ───────── MOBILE / TABLET CARD (< md) ───────── */}
                <div className="md:hidden py-6 px-1">
                  <div className="relative w-full aspect-[16/10] overflow-hidden rounded-xl border border-[#e5e0d8] shadow-sm">
                    <Image
                      src={proiect.imagine}
                      alt={proiect.titlu}
                      fill
                      sizes="100vw"
                      className="object-cover object-center transition-transform duration-700 ease-out group-active:scale-105"
                    />
                    <span className="absolute top-3 left-3 text-[10px] font-mono tracking-widest text-white bg-black/50 backdrop-blur-sm px-2 py-1">
                      {proiect.numar}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <p className="text-[10px] font-mono text-[#8c8275] uppercase tracking-widest">
                      {proiect.tip}
                    </p>
                    <h4 className="text-lg font-light font-serif tracking-tight text-[#121212] leading-snug">
                      {proiect.titlu}
                    </h4>
                    <p className="text-xs text-[#554d42] font-light tracking-wide">
                      {proiect.locatie}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-[#121212]">
                    <span>Vezi proiectul</span>
                    <ArrowUpRight
                      size={14}
                      strokeWidth={1.5}
                      className="transition-transform duration-300 group-active:translate-x-0.5 group-active:-translate-y-0.5"
                    />
                  </div>
                </div>

                {/* ───────── DESKTOP EDITORIAL ROW (md+) ───────── */}
                <div className="hidden md:grid grid-cols-12 gap-6 items-center py-8 md:group-hover:px-4 transition-[padding] duration-300">
                  {/* NUMĂR */}
                  <div className="col-span-1 text-xs font-mono text-[#8c8275] tabular-nums">
                    {proiect.numar}
                  </div>

                  {/* TITLU ȘI TIP */}
                  <div className="col-span-5 lg:col-span-6 space-y-1 min-w-0">
                    <h4 className="text-xl lg:text-2xl font-light font-serif tracking-tight text-[#121212] truncate group-hover:translate-x-2 transition-transform duration-500 ease-out">
                      {proiect.titlu}
                    </h4>
                    <p className="text-[10px] font-mono text-[#8c8275] uppercase tracking-widest">
                      {proiect.tip}
                    </p>
                  </div>

                  {/* LOCAȚIE */}
                  <div className="col-span-4 lg:col-span-3 text-xs text-[#554d42] font-light tracking-wide leading-relaxed">
                    {proiect.locatie}
                  </div>

                  {/* SĂGEATĂ */}
                  <div className="col-span-2 flex justify-end text-[#8c8275] group-hover:text-[#121212] transition-colors">
                    <ArrowUpRight
                      size={18}
                      strokeWidth={1}
                      className="group-hover:rotate-45 transition-transform duration-500"
                    />
                  </div>
                </div>

                {/* FLOATING HOVER CARD IMAGE (desktop only) */}
                <div
                  className={`hidden md:block absolute right-[4%] lg:right-[8%] xl:right-[12%] top-1/2 -translate-y-1/2 w-[220px] lg:w-[280px] xl:w-[320px] aspect-[4/5] z-30 pointer-events-none overflow-hidden border border-[#e5e0d8] shadow-[0_30px_70px_rgba(0,0,0,0.12)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    proiectActiv === index
                      ? 'opacity-100 scale-100 translate-x-0'
                      : 'opacity-0 scale-95 translate-x-4'
                  }`}
                >
                  <div className="w-full h-full relative transition-transform duration-700 ease-out group-hover:scale-105">
                    <Image
                      src={proiect.imagine}
                      alt={proiect.titlu}
                      fill
                      sizes="(min-width: 1280px) 320px, (min-width: 1024px) 280px, 220px"
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/5" />
                  <div className="absolute bottom-4 left-4 text-[9px] font-mono uppercase bg-white/90 text-black px-2 py-1 tracking-widest backdrop-blur-sm flex items-center gap-1">
                    <Maximize2 size={8} /> Detalii Concept
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}