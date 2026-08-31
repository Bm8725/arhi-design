"use client";

import { useEffect, useRef, useState } from "react";
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
    cover: "/m1.jpeg",
    images: ["/m1.jpeg",
              "/futurist1.png",
              "/futurist2.png",
              "/futurist3.png",
              "/m2.jpeg",
    ],
    description: ["Conversia unei hale existente într-un spațiu comercial de 1.432,75 mp construiți, cu o sală liberă de peste 1.250 mp pe deschidere de 18,70 m. Fațada este reconfigurată contemporan – fațadă ventilată din lambriuri metalice, benzi vitrate continue și copertine metalice care marchează accesele – într-o cromatică galben, gri antracit și accente roșii."],
  },
  {
    id: "proj-06",
    title: "Locuinta P+M",
    category: "PRIVAT / REZIDENȚIAL",
    year: "2026",
    location: "Cartier Priseaca, Mun. Târgoviște, Crangului nr.6 G",
    area: "160 m²",
    status: "in curs de autorizare",
    cover: "/balcangiu.png",
    images: ["/balcangiu.png",
              "/balcangiu1.png",
              "/balcangiu2.png",
              "/balcangiu3.png",
              "/balcangiu4.png",
              "/balcangiu5.png",
            
    ],
    description: [" Locuinta P+M aflata in curs de autorizare, aflata  in Cartier Priseaca, Mun. Târgoviște, Crangului nr.6 G, cu o suprafata construita de 160 m² beneficiar fam. Balcangiu . Proiectearh 4D S.R.L., arh. Bogdan Șotîngeanu."],
  },

    {
    id: "proj-07",
    title: "Locuință unifamilială contemporană P+1 retras",
    category: "PRIVAT / REZIDENȚIAL",
    year: " ",
    location: " privat",
    area: "224 m²",
    status: "realizat",
    cover: "/barbu.png",
    images: ["/barbu.png",
              "/barbu1.png",
              "/barbu2.png",
              "/barbu3.png",
              "/barbu4.png",
              "/barbu5.png",
            
    ],
    description: [" Casăindividuală de dimensiunicompacte, organizată ca douăprismealbesuprapuse: un volum-parter generos, cu latura de circa 14,20 m, peste care se așază un etajretras pe toatelaturile, care eliberează o terasăamplă cu deck din lemn. Parterulconcentrează zona de zi, deschisăprinvitraje pe toatăînălțimeacătre o logieadâncă, protejată de consolaetajului — un spațiu exterior acoperit, utilizabilaproapetotanul. Etajul, mai intim, cuprinde dormitorul, baia și casa scării, iluminat printr-o bandă continuă de ferestre spre terasă.Expresia este deliberat redusă: tencuială albă, tâmplărie și atice în antracit, iar singurele accente calde sunt panourile din lamele de lemn care marchează intrarea și capetele logiei. Acoperișul terasă și golurile decupate net în volum susțin caracterul modernist al casei, în timp ce treptele largi din piatră și plantările dense o leagă firesc de grădină."],
  },

      {
    id: "proj-08",
    title: "Spații comerciale – Micro VI, zona Pieței Mercur, Târgoviște",
    category: "Comercial",
    year: " ",
    location: " Targoviste",
    area: "- m²",
    status: "realizat",
    cover: "/spa.png",
    images: ["/spa.png",
              "/spa1.png",
              "/spa2.png",
              "/spa3.png",
              "/spa4.png",
              "/spa5.png",
            
    ],
    description: [" Ansamblu de spații comerciale desfășurat pe orizontală, gândit ca o alternativă modernă la comerțul de cartier din zona Pieței Mercur. Unitățile sunt dispuse liniar, cu vitrine și accese proprii direct din parcarea de incintă, astfel încât fiecare chiriaș își păstrează identitatea și adresa, iar clienții ajung comod la orice spațiu fără circulații interioare comune.Fațadele sunt tratate unitar, într-un limbaj contemporan de tip retail-park: panouri prefabricate din beton în tonuri de gri deschis, cu textură orizontală fină, ritmate de accente verticale portocalii-cortenii și de volume albe care înrămează intrările vitrate. Alternanța dintre planuri pline și vitrine înalte dă scară umană unei fațade lungi, iar plantările din insulele parcării și fâșiile verzi perimetrale îmblânzesc suprafețele pavate. Amplasament: Târgoviște, cartier Micro VI, zona Pieței Mercur, jud. Dâmbovița • Funcțiune: spații comerciale de închiriat, cu accese individuale • Regim de înălțime: parter • Fațade: panouri prefabricate din beton texturat, accente din tablă perforată/corten, vitrine cu tâmplărie de aluminiu • Amenajări exterioare: parcare de incintă, alei pietonale, insule plantate și spații verzi perimetrale • Proiectearh 4D S.R.L., arh. Bogdan Șotîngeanu"],
  },

      {
    id: "proj-09",
    title: "Spații comerciale – Micro VI, zona Pieței Mercur, Târgoviște (variantă cromatică)",
    category: "Comercial/conceptual",
    year: "2026",
    location: " Targoviste",
    area: "- m²",
    status: "-",
    cover: "/spaa.png",
    images: ["/spaa.png",
              "/spaa1.png",
              "/spaa2.png",
              "/spaa3.png",
              "/spaa4.png",
              
            
    ],
    description: ["A doua variantă de fațadă pentru ansamblul comercial din Micro VI: aceleași unități parter cu accese individuale, îmbrăcate într-o compoziție de benzi orizontale galben, roșu, magenta și mov, tăiată de volumele albe ale intrărilor. Amplasament: Târgoviște, cartier Micro VI, zona Pieței Mercur, jud. Dâmbovița • Funcțiune: spații comerciale de închiriat, cu accese individuale • Regim de înălțime: parter • Fațade: panouri metalice/compozite în benzi orizontale colorate, portaluri de intrare din panouri albe, vitrine cu tâmplărie de aluminiu • Amenajări exterioare: parcare de incintă, alei pietonale, insule plantate și spații verzi perimetrale • Proiectearh 4D S.R.L., arh. Bogdan Șotîngeanu. "],
  },

      {
    id: "proj-10",
    title: "Ansamblu recreativ cu corp de cazare și cramă – Târgoviște",
    category: "Comercial/recreativ",
    year: "-",
    location: " Targoviste",
    area: "- m²",
    status: "-",
    cover: "/samy.png",
    images: ["/samy1.png",
              "/samy2.png",
              "/samy3.png",
              "/samy4.png",
             
              
            
    ],
    description: ["Ansamblu recreativ la marginea apei, format din sala de sport cu ferme metalice aparente și luminatoare zenitale, o anexă de întreținere și un corp de cazare cu cramă la demisol, cu acoperiș înalt din șiță și curte engleză din piatră de râu. Amplasament: Târgoviște, jud. Dâmbovița • Componență: corp sală de sport/fitness, anexă întreținere, corp de cazare cu cramă la demisol • Sala de sport: structură metalică cu ferme aparente, zidărie aparentă și pereți cortină, luminatoare curbe pe acoperiș, pardoseală sportivă din lemn cu marcaje • Corp cazare/cramă: acoperiș în pante mari cu învelitoare din șiță, placaje și structură din lemn, curte engleză cu ziduri din piatră de râu • Amenajări exterioare: parcare, alei pietonale din dale, gazon și plantări perimetrale • Proiectearh 4D S.R.L., arh. Bogdan Șotîngeanu."],
  },

        {
    id: "proj-11",
    title: "Locuință P+1 cu garaj – str. Înfrățirii, Târgoviște",
    category: "privat/rezidențial",
    year: "-",
    location: " Targoviste",
    area: "286,80  m²",
    status: "-",
    cover: "/dobra.png",
    images: ["/dobra1.png",
              "/dobra2.png",
              "/dobra3.png",
              "/dobra4.png",
              "/dobra5.png",
             
              
            
    ],
    description: ["Casă de familie cu 6 camere, organizată pe două niveluri clar diferențiate: un parter amplu, desfășurat pe orizontală, peste care se așază un etaj retras, mai compact, cu dormitoare. Parterul cuprinde zona de zi de 37 mp deschisăcătre un bovindouoctogonal care găzduiește locul de luat masa, bucătăria cu cămară, un dormitor cu baie proprie și o terasă acoperită de peste 25 mp. Etajul grupează două dormitoare mari cu dressing și o baiecomună. Expresia arhitecturală combină cărămida aparentă cu tencuiala decorativă și mizează pe registrul arcadelor: prin arc dau ritm fațadei, iar streașinile generoase, cu jgheaburi antracit, protejează zidăria. Învelitoarea din olane ceramice, în două registre suprapuse, întărește citirea etajului ca volum așezat peste corpul principal."],
  },

          {
    id: "proj-12",
    title: "Sediu firmă GEO-STING – str. Petru Cercel, Târgoviște",
    category: "privat/rezidențial",
    year: " ",
    location: " str. Petru Cercel nr. 22A, Târgoviște, jud. Dâmbovița ",
    area: "  m²",
    status: "-",
    cover: "/geo.png",
    images: ["/geo1.png",
              "/geo2.png",
              "/geo3.png",
              "/geo41.jpg",
              "/geo5.jpg",
              "/geo6.jpg",
             
              
            
    ],
    description: [" Modernizarea și supraetajarea unui magazin existent, transformat însediu de firmă P+2, cu birouri, sală de consiliu, sală de mese șisală de curs. Fațade din panouri compozite gri și roșu, ecranate cu jaluzele metalice, cu un trafor roșu în formă de grinzi cu zăbrele peste vitrajul ultimului nivel. Proiectrealizat. arh. Bogdan Șotîngeanu"],
  },


];

function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.684 13.342a3 3 0 100-2.684m0 2.684a3 3 0 100-2.684m0 2.684 6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  );
}

export default function PortofoliuPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [closing, setClosing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [fsClosing, setFsClosing] = useState(false);

  // swipe (mobil)
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const active = PROJECTS.find((p) => p.id === activeId) ?? null;

  const openProject = (id: string) => {
    setImgIndex(0);
    setActiveId(id);
    setClosing(false);
    setFullscreen(false);
  };

  const closeProject = () => {
    setClosing(true);
    window.setTimeout(() => {
      setActiveId(null);
      setClosing(false);
      setFullscreen(false);
    }, 260);
  };

  const openFullscreen = () => {
    setFsClosing(false);
    setFullscreen(true);
  };

  const closeFullscreen = () => {
    setFsClosing(true);
    window.setTimeout(() => {
      setFullscreen(false);
      setFsClosing(false);
    }, 220);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!active || active.images.length <= 1) return;
    const delta = touchStartX.current - touchEndX.current;
    const threshold = 40; // px minim ca să conteze drept swipe

    if (delta > threshold) {
      // swipe la stânga -> imaginea următoare
      setImgIndex((i) => (i + 1) % active.images.length);
    } else if (delta < -threshold) {
      // swipe la dreapta -> imaginea anterioară
      setImgIndex(
        (i) => (i - 1 + active.images.length) % active.images.length,
      );
    }
  };

  //////// share handler //////
  const shareProject = async (
    p: Project,
    e: React.MouseEvent<HTMLButtonElement>,
    feedbackKey: string,
  ) => {
    e.stopPropagation();

    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}#${p.id}`
        : "";

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        let filesToShare: File[] | undefined;

        try {
          const res = await fetch(p.cover);
          const blob = await res.blob();
          const file = new File(
            [blob],
            `${p.id}.${(blob.type.split("/")[1] || "jpg")}`,
            { type: blob.type || "image/jpeg" },
          );
          if (
            typeof navigator.canShare === "function" &&
            navigator.canShare({ files: [file] })
          ) {
            filesToShare = [file];
          }
        } catch {
          // thumbnail couldn't be fetched/shared as a file — fall back to link-only share
        }

        await navigator.share({
          title: p.title,
          text: `${p.title} — ${p.category}\nBirou de arhitectură arh. Bogdan Șotîngeanu — proarh.4D`,
          url: shareUrl,
          ...(filesToShare ? { files: filesToShare } : {}),
        });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedId(feedbackKey);
        window.setTimeout(() => setCopiedId(null), 1600);
      }
    } catch {
      // user cancelled the share sheet or it failed silently — nothing to do
    }
  };

  // ESC pentru închidere + lock scroll cât timp popup-ul e deschis
  useEffect(() => {
    if (!active) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (fullscreen) closeFullscreen();
        else closeProject();
      }
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
  }, [active, fullscreen]);

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

              <button
                onClick={(e) => shareProject(p, e, p.id)}
                aria-label={`Distribuie ${p.title}`}
                className="absolute top-4 right-4 z-20 h-9 w-9 flex items-center justify-center border border-white/20 text-white/70 bg-black/40 opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:border-amber-500 hover:text-amber-500 transition-all duration-300"
              >
                <ShareIcon />
              </button>
              {copiedId === p.id && (
                <span className="absolute top-4 right-14 z-20 text-[10px] tracking-widest uppercase bg-black/70 border border-amber-500/40 text-amber-500 px-2 py-1">
                  Link copiat
                </span>
              )}

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
            className={`fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 lg:p-10 transition-opacity duration-500 ${
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
              className={`relative z-10 w-full h-full md:w-[92vw] md:h-[90vh] lg:w-[88vw] lg:h-[88vh] max-w-[1600px] bg-[#161616] border border-white/10 overflow-y-auto md:overflow-hidden grid grid-cols-1 md:grid-cols-2 transition-all duration-500 ease-out ${
                closing
                  ? "opacity-0 scale-95 translate-y-4"
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

              <button
                onClick={(e) => shareProject(active, e, "modal")}
                aria-label={`Distribuie ${active.title}`}
                className="absolute top-4 right-16 md:top-6 md:right-20 z-20 h-10 w-10 flex items-center justify-center border border-white/20 text-white/70 hover:border-amber-500 hover:text-amber-500 transition-all duration-300 bg-black/40"
              >
                <ShareIcon />
              </button>
              {copiedId === "modal" && (
                <span className="absolute top-4 right-28 md:top-6 md:right-32 z-20 text-[10px] tracking-widest uppercase bg-black/70 border border-amber-500/40 text-amber-500 px-2 py-1">
                  Link copiat
                </span>
              )}

              {/* Imagine principală + navigare */}
              <div
                className="relative bg-black h-[42vh] sm:h-[48vh] md:h-full md:aspect-auto shrink-0 group/img cursor-zoom-in"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={openFullscreen}
              >
                <Image
                  key={imgIndex}
                  src={active.images[imgIndex]}
                  alt={`${active.title} — imagine ${imgIndex + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain transition-opacity duration-500"
                  priority
                />

                <span className="pointer-events-none absolute bottom-4 right-4 z-10 h-9 w-9 flex items-center justify-center border border-white/20 bg-black/50 text-white/80 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                  </svg>
                </span>

                {active.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setImgIndex(
                          (i) =>
                            (i - 1 + active.images.length) %
                            active.images.length,
                        );
                      }}
                      aria-label="Imaginea anterioară"
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center border border-white/20 text-white/70 hover:border-amber-500 hover:text-amber-500 transition-colors bg-black/40"
                    >
                      ‹
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setImgIndex((i) => (i + 1) % active.images.length);
                      }}
                      aria-label="Imaginea următoare"
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center border border-white/20 text-white/70 hover:border-amber-500 hover:text-amber-500 transition-colors bg-black/40"
                    >
                      ›
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {active.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setImgIndex(idx);
                          }}
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
              <div className="relative p-6 sm:p-8 md:p-12 lg:p-16 md:overflow-y-auto flex flex-col">
                <span className="text-xs tracking-[0.3em] uppercase opacity-50">
                  {active.category}
                </span>
                <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light uppercase tracking-wide mt-3">
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

        {/* FULLSCREEN VIEWER — click pe imagine, scroll smooth, desktop + mobile */}
        {active && fullscreen && (
          <div
            className={`fixed inset-0 z-[70] bg-black transition-opacity duration-300 ${
              fsClosing ? "opacity-0" : "opacity-100"
            }`}
            onClick={closeFullscreen}
          >
            <div
              className="h-full w-full overflow-y-auto overscroll-contain [scroll-behavior:smooth]"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className={`relative min-h-full w-full flex items-center justify-center p-0 sm:p-6 transition-all duration-300 ease-out ${
                  fsClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative w-full h-[100dvh] sm:h-[92vh]">
                  <Image
                    key={imgIndex}
                    src={active.images[imgIndex]}
                    alt={`${active.title} — imagine ${imgIndex + 1}`}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                closeFullscreen();
              }}
              aria-label="Închide imaginea"
              className="fixed top-4 right-4 md:top-6 md:right-6 z-20 h-10 w-10 flex items-center justify-center border border-white/20 text-white/80 hover:border-white hover:text-white hover:rotate-90 transition-all duration-300 bg-black/50"
            >
              ✕
            </button>

            {active.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImgIndex(
                      (i) => (i - 1 + active.images.length) % active.images.length,
                    );
                  }}
                  aria-label="Imaginea anterioară"
                  className="fixed left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 flex items-center justify-center border border-white/20 text-white/80 hover:border-amber-500 hover:text-amber-500 transition-colors bg-black/50"
                >
                  ‹
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImgIndex((i) => (i + 1) % active.images.length);
                  }}
                  aria-label="Imaginea următoare"
                  className="fixed right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 flex items-center justify-center border border-white/20 text-white/80 hover:border-amber-500 hover:text-amber-500 transition-colors bg-black/50"
                >
                  ›
                </button>
                <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {active.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setImgIndex(idx);
                      }}
                      aria-label={`Imaginea ${idx + 1}`}
                      className={`h-[3px] transition-all duration-300 ${
                        idx === imgIndex ? "w-6 bg-amber-500" : "w-3 bg-white/30 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>
    <WhatsAppWidget />
      <Footer />
    </main>
  );
}