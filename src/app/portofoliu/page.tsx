"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppWidget from '@/components/WhatsAppWidget'
/* ─────────────────────────────────────────────────────────────

   ───────────────────────────────────────────────────────────── */
type Project = {
  id: string;
  title: string;
  category: string;
  year: string;
  location: string;
  area: string;
  status: string;
  cover: string;
  images: string[];
  description: string[];
};

const PROJECTS: Project[] = [
  {
    id: "proj-01",
    title: "Vila Dutescu",
    category: "Servicii/turism ",
    year: "2020",
    location: "Padina-Lăptici, com. Moroeni (DB), RO",
    area: "380 m²",
    status: "Construit",
    cover: "/design.png",
    images: [
      "/dutescu.png",
      "/dutescu2.png",
      "/dutescu3.png",
       "/dutescu4.png",
    ],
    description: [
      "Pensiune agroturistică de munte cu 5 camere, la 1.485 m altitudine, în zona Padina-Lăptici. Construită din bușteni rotunzi îmbinați prin chertare, peste un soclu din piatră naturală, cu acoperiș în pante mari din tablă fălțuită și frontoane vitrate spre peisaj.",
      "   Regim de înălțime: D+P+1+M • Ac demisol = 105,95 mp (Au 77,65 mp) • Ac parter = 103,15 mp (Au 79,10 mp) • Ac etaj = 103,15 mp (Au 79,10 mp), balcoane 19,05 mp • Ac mansardă = 40,80 mp (Au 25,55 mp) • A.C.D. total = 380,55 mp • Suprafațăcamere de cazare: 158,95 mp / 5 camere • Cote: demisol −2,80 • parter ±0,00 (1485,50) • etaj +2,80 • mansardă +5,60 • învelitoare +8,40 (1493,90) • Structură: diafragme din betonarmat la demisol, pereți din bușteni de lemntratatbiocid, fungicidșiignifug la P+1+M • Gradul III rezistență la foc • Faza: D.T.A.C. • Proiect nr. 39/V/2020 – Proiectearh 4D S.R.L., arh. Bogdan Șotîngeanu",
    ],
  },
  {
    id: "proj-02",
    title: "Centru training-P+1",
    category: "Comercial",
    year: "-",
    location: "Romania",
    area: " m²",
    status: "Construit",
    cover: "/centru_training.jpg",
    images: [
      "/centru.jpg",
      "/centru2.jpg",
      "/centru3.jpg",
      "/centru_training.jpg",
    ],
    description: ["Centru de training P+1, cu sală de curs cu tribună în trepte la parter și birouri la etaj. Volumetria combină un corp lung din panouri prefabricate de beton cu un volum de acces placat în cărămidă aparentă, deschis printr-un gol vitrat pe două niveluri care expune scara."],
  },
  {
    id: "proj-03",
    title: "Foișor hexagonal din lemn",
    category: "Personal",
    year: "2026",
    location: "Targoviste, RO",
    area: "12 m²",
    status: "realizat",
    cover: "/foisor1.png",
    images: ["/foisor1.png",
              "/foisor2.png",
              "/foisor3.png",
    ],
    description: ["Foișor hexagonal din lemn masiv, pe soclu și pardoseală din piatră, cu parapet mixt lemn-piatră, arce traforate între stâlpi și acoperiș înalt din șiță, animat de lucarne triunghiulare."],
  },
  {
    id: "proj-04",
    title: "Biserică parohială nouă – Parohia Poroinica I, în curs de execuție",
    category: "lacas de cult",
    year: "-",
    location: "sat Tețcoiu, com. Mătăsaru (DB)–",
    area: "130 m²",
    status: "realizat",
    cover: "/biserica.png",
    images: ["/biserica1.png",
              "/biserica2.png",
              "/biserica3.png",
              "/biserica4.png",
    ],
    description: ["Biserică ortodoxă nouă cu plan treflat și turlă octogonală pe naos (H max = 16,50 m), în tradiția arhitecturii muntenești: pridvor pe coloane, fațade albe cu arcaturi decorative, soclu din piatră. Amplasată în sat Tețcoiu, com. Mătăsaru, în zona de protecție a unui monument istoric din 1678, pe un teren amenajat cu alei, parcare și spațiu verde generos. Proiectearh 4D S.R.L., arh. Bogdan Șotîngeanu."],
  },

  {
    id: "proj-05",
    title: "Amenajare spații comerciale ",
    category: "comercial/futurist",
    year: "-",
    location: "corp C5, B-dul Unirii nr. 6-8, Târgoviște",
    area: "1.432,75m²",
    status: "realizat",
    cover: "/futurist.png",
    images: ["/futurist.png",
              "/futurist1.png",
              "/futurist2.png",
              "/futurist3.png",
    ],
    description: ["Conversia unei hale existente într-un spațiu comercial de 1.432,75 mp construiți, cu o sală liberă de peste 1.250 mp pe deschidere de 18,70 m. Fațada este reconfigurată contemporan – fațadă ventilată din lambriuri metalice, benzi vitrate continue și copertine metalice care marchează accesele – într-o cromatică galben, gri antracit și accente roșii."],
  },
  {
    id: "proj-05",
    title: "Locuinta P+M",
    category: "PRIVAT / REZIDENȚIAL",
    year: "2026",
    location: "Cartier Priseaca, Mun. Târgoviște, Crangului nr.6 G",
    area: "160 m²",
    status: "in curs de autorizare",
    cover: "/balcangiu.jpeg",
    images: ["/balcangiu.jpeg",
              "/balcangiu1.jpeg",
              "/balcangiu2.jpeg",
            
    ],
    description: [" Locuinta P+M aflata in curs de autorizare, aflata  in Cartier Priseaca, Mun. Târgoviște, Crangului nr.6 G, cu o suprafata construita de 160 m². Proiectearh 4D S.R.L., arh. Bogdan Șotîngeanu."],
  },

];

export default function PortofoliuPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [closing, setClosing] = useState(false);

  const active = PROJECTS.find((p) => p.id === activeId) ?? null;

  const openProject = (id: string) => {
    setImgIndex(0);
    setActiveId(id);
    setClosing(false);
  };

  const closeProject = () => {
    setClosing(true);
    window.setTimeout(() => {
      setActiveId(null);
      setClosing(false);
    }, 260);
  };

  // ESC pentru închidere + lock scroll cât timp popup-ul e deschis
  useEffect(() => {
    if (!active) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeProject();
      if (e.key === "ArrowRight")
        setImgIndex((i) => (i + 1) % active.images.length);
      if (e.key === "ArrowLeft")
        setImgIndex(
          (i) => (i - 1 + active.images.length) % active.images.length,
        );
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  return (
    <main className="relative min-h-screen bg-[#121212] text-[#E5E5E5] font-sans overflow-hidden">
      <Navbar />

      <section className="relative px-6 md:px-12 py-20">
        {/* Grid decorativ de fundal — coerent cu restul site-ului */}
        <div className="absolute inset-0 grid grid-cols-4 pointer-events-none opacity-5">
          <div className="border-r border-white h-full" />
          <div className="border-r border-white h-full" />
          <div className="border-r border-white h-full" />
          <div />
        </div>

        <header className="relative z-10 flex items-end justify-between border-b border-white/10 pb-6 mb-14">
          <div>
            <span className="text-xs tracking-[0.3em] uppercase font-light opacity-60">
              Portofoliu
            </span>
            <h2 className="text-3xl md:text-5xl font-light tracking-wide uppercase mt-2">
              Proiecte Proarh.4D
            </h2>
          </div>
          <span className="hidden md:block text-xs opacity-40 tracking-widest">
            [ {String(PROJECTS.length).padStart(2, "0")} lucrări ]
          </span>
        </header>

        {/* Grid de proiecte */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
          {PROJECTS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => openProject(p.id)}
              className="group relative bg-[#121212] text-left aspect-[4/5] overflow-hidden focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500"
            >
              <Image
                src={p.cover}
                alt={p.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover opacity-70 grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

              <span className="absolute top-5 left-5 text-[11px] tracking-widest opacity-50">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <div className="h-[1px] w-8 bg-amber-500 mb-3 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
                <h3 className="text-lg md:text-xl font-light uppercase tracking-wide">
                  {p.title}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 tracking-wide">
                  {p.category} — {p.year}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* POPUP / MODAL — reveal premium */}
        {active && (
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 transition-opacity duration-300 ${
              closing ? "opacity-0" : "opacity-100"
            }`}
          >
            {/* backdrop */}
            <div
              onClick={closeProject}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* panel */}
            <div
              className={`relative z-10 w-full max-w-6xl max-h-[90vh] bg-[#161616] border border-white/10 overflow-hidden grid grid-cols-1 md:grid-cols-2 transition-all duration-300 ease-out ${
                closing
                  ? "opacity-0 scale-[0.98] translate-y-2"
                  : "opacity-100 scale-100 translate-y-0"
              }`}
            >
              <button
                onClick={closeProject}
                aria-label="Închide"
                className="absolute top-4 right-4 md:top-6 md:right-6 z-20 h-10 w-10 flex items-center justify-center border border-white/20 text-white/70 hover:border-white hover:text-white hover:rotate-90 transition-all duration-300 bg-black/40"
              >
                ✕
              </button>

              {/* Imagine principală + navigare */}
              <div className="relative bg-black aspect-[4/5] md:aspect-auto md:h-full">
                <Image
                  key={imgIndex}
                  src={active.images[imgIndex]}
                  alt={`${active.title} — imagine ${imgIndex + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-opacity duration-500"
                  priority
                />

                {active.images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setImgIndex(
                          (i) =>
                            (i - 1 + active.images.length) %
                            active.images.length,
                        )
                      }
                      aria-label="Imaginea anterioară"
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center border border-white/20 text-white/70 hover:border-amber-500 hover:text-amber-500 transition-colors bg-black/40"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() =>
                        setImgIndex((i) => (i + 1) % active.images.length)
                      }
                      aria-label="Imaginea următoare"
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center border border-white/20 text-white/70 hover:border-amber-500 hover:text-amber-500 transition-colors bg-black/40"
                    >
                      ›
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {active.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setImgIndex(idx)}
                          aria-label={`Imaginea ${idx + 1}`}
                          className={`h-[3px] transition-all duration-300 ${
                            idx === imgIndex
                              ? "w-6 bg-amber-500"
                              : "w-3 bg-white/30 hover:bg-white/60"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Detalii proiect */}
              <div className="relative p-8 md:p-12 overflow-y-auto flex flex-col">
                <span className="text-xs tracking-[0.3em] uppercase opacity-50">
                  {active.category}
                </span>
                <h3 className="text-3xl md:text-4xl font-light uppercase tracking-wide mt-3">
                  {active.title}
                </h3>
                <div className="h-[1px] w-12 bg-amber-500 my-6" />

                <dl className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs mb-8">
                  <div>
                    <dt className="opacity-40 tracking-widest uppercase mb-1">
                      An
                    </dt>
                    <dd className="text-neutral-200 font-light">
                      {active.year}
                    </dd>
                  </div>
                  <div>
                    <dt className="opacity-40 tracking-widest uppercase mb-1">
                      Locație
                    </dt>
                    <dd className="text-neutral-200 font-light">
                      {active.location}
                    </dd>
                  </div>
                  <div>
                    <dt className="opacity-40 tracking-widest uppercase mb-1">
                      Suprafață
                    </dt>
                    <dd className="text-neutral-200 font-light">
                      {active.area}
                    </dd>
                  </div>
                  <div>
                    <dt className="opacity-40 tracking-widest uppercase mb-1">
                      Status
                    </dt>
                    <dd className="text-neutral-200 font-light">
                      {active.status}
                    </dd>
                  </div>
                </dl>

                <div className="space-y-4">
                  {active.description.map((paragraph, idx) => (
                    <p
                      key={idx}
                      className="text-sm text-neutral-400 leading-relaxed font-light"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    <WhatsAppWidget />
      <Footer />
    </main>
  );
}