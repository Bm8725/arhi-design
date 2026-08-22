import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import Link from 'next/link';
/* ─────────────────────────────────────────────────────────────
   PROIECTARE ARHITECTURALĂ — pagină de detaliu serviciu
   Păstrează limbajul vizual al site-ului: #121212, grid decorativ,
   accente amber-500, uppercase/tracking-wide/font-light.
   ───────────────────────────────────────────────────────────── */

   
const FAZE = [
  {
    n: "01",
    cod: "D.T.A.C.",
    title: "Documentație pentru autorizarea construirii",
    text: "Piesele scrise și desenate necesare obținerii autorizației de construire, depuse la primărie.",
  },
  {
    n: "02",
    cod: "D.T.O.E.",
    title: "Documentație pentru organizarea execuției",
    text: "Documentația tehnică pentru organizarea lucrărilor de construcție, corelată cu D.T.A.C.",
  },
  {
    n: "03",
    cod: "P.T.",
    title: "Proiect tehnic de execuție",
    text: "Detalierea tehnică completă a soluțiilor de arhitectură, structură și instalații pentru execuția lucrării.",
  },
  {
    n: "04",
    cod: "D.D.E.",
    title: "Detalii de execuție",
    text: "Detalii tehnice punctuale, la scară mare, pentru execuția corectă pe șantier.",
  },
];

const INCLUDE = [
  "Ridicare topografică & studiu de teren",
  "Concept arhitectural & randări 3D",
  "Plan de situație & încadrare în zonă",
  "Planuri, fațade și secțiuni la toate fazele",
  "Corelare cu proiectanții de structură și instalații",
  "Asistență tehnică pe parcursul autorizării",
];

export default function ProiectareArhitecturaPage() {
  return (
    <main className="relative min-h-screen bg-[#121212] text-[#E5E5E5] font-sans overflow-hidden">
      <Navbar />

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative px-6 md:px-12 pt-20 pb-14">
        <div className="absolute inset-0 grid grid-cols-4 pointer-events-none opacity-5">
          <div className="border-r border-white h-full" />
          <div className="border-r border-white h-full" />
          <div className="border-r border-white h-full" />
          <div />
        </div>

        <header className="relative z-10 border-b border-white/10 pb-6">
          <span className="text-xs tracking-[0.3em] uppercase font-light opacity-60">
            Servicii
          </span>
          <h1 className="text-3xl md:text-5xl font-light tracking-wide uppercase mt-2 max-w-3xl">
            Proiectare arhitecturală
          </h1>
          <p className="text-sm md:text-base text-neutral-400 font-light mt-5 max-w-2xl leading-relaxed">
            De la conceptul inițial la proiectul tehnic de execuție —
            întocmim documentația completă necesară autorizării și
            construirii, cu respectarea reglementărilor în vigoare.
          </p>
        </header>
      </section>

      {/* ── FAZELE PROIECTULUI ─────────────────────────────── */}
      <section className="relative px-6 md:px-12 pb-20">
        <div className="relative z-10">
          <span className="text-xs tracking-[0.3em] uppercase font-light opacity-60">
            Etape
          </span>
          <h2 className="text-2xl md:text-3xl font-light tracking-wide uppercase mt-2 mb-12">
            Fazele documentației
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
            {FAZE.map((f) => (
              <div key={f.n} className="bg-[#121212] p-6 md:p-8">
                <span className="text-xs tracking-widest text-amber-500 font-light">
                  {f.n}
                </span>
                <h3 className="text-lg font-light tracking-wide mt-3">
                  {f.cod}
                </h3>
                <p className="text-xs uppercase tracking-widest opacity-50 mt-1 mb-4">
                  {f.title}
                </p>
                <p className="text-sm text-neutral-400 font-light leading-relaxed">
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CE INCLUDE ─────────────────────────────────────── */}
      <section className="relative px-6 md:px-12 pb-24">
        <div className="relative z-10 border-t border-white/10 pt-14 max-w-3xl">
          <span className="text-xs tracking-[0.3em] uppercase font-light opacity-60">
            Ce include
          </span>
          <h2 className="text-2xl md:text-3xl font-light tracking-wide uppercase mt-2 mb-10">
            Serviciul de proiectare
          </h2>

          <ul className="space-y-4">
            {INCLUDE.map((item, i) => (
              <li
                key={i}
                className="flex items-baseline gap-4 border-b border-white/10 pb-4 text-sm text-neutral-300 font-light"
              >
                <span className="text-amber-500 text-xs tracking-widest">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

              <Link
          href="/portofoliu"
          className="group relative inline-flex items-center gap-3 mt-10 border border-white/20 px-8 py-4 text-xs tracking-widest uppercase font-light overflow-hidden hover:border-amber-500 transition-colors duration-300"
        >
          <span className="relative z-10 group-hover:text-black transition-colors duration-300">
            Vezi portofoliul
          </span>
          <span
            aria-hidden
            className="relative z-10 group-hover:text-black transition-all duration-300 group-hover:translate-x-1"
          >
            →
          </span>
          <span className="absolute inset-0 bg-amber-500 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
        </Link>

      </section>

      <WhatsAppWidget />
      <Footer />
    </main>
  );
}