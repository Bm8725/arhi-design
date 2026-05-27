import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <main className="relative min-h-screen bg-[#121212] text-[#E5E5E5] flex flex-col justify-between p-6 md:p-12 font-sans overflow-hidden">
      <Navbar />
      {/* Linii de ghidare / Grid arhitectural pe fundal */}
      <div className="absolute inset-0 grid grid-cols-4 pointer-events-none opacity-5">
        <div className="border-r border-white h-full"></div>
        <div className="border-r border-white h-full"></div>
        <div className="border-r border-white h-full"></div>
        <div></div>
      </div>

      {/* Header - Identitate minimalistă */}
      <header className="z-10 flex justify-between items-center border-b border-white/10 pb-4">
        <span className="text-xs tracking-[0.3em] uppercase font-light">Eroare de Structură</span>
        <span className="text-xs opacity-50">[ cod_404 ]</span>
      </header>

      {/* Corpul Principal - Compoziție Asimetrică */}
      <div className="z-10 my-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-end pt-12 pb-24">
        {/* Numărul Brutalist */}
        <h1 className="col-span-1 md:col-span-6 text-[22vw] leading-none font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/5 select-none">
          404
        </h1>

        {/* Textul și Conceptul */}
        <div className="col-span-1 md:col-span-6 max-w-md space-y-6 md:pb-6">
          <div className="h-[1px] w-12 bg-amber-500"></div> {/* Accent de culoare */}
          <h2 className="text-2xl md:text-3xl font-light tracking-wide uppercase">
            Spațiu Inexistent
          </h2>
          <p className="text-sm text-neutral-400 leading-relaxed font-light">
            Planul geometric a eșuat. Coordonatele introduse caută o secțiune din proiect care nu a fost turnată sau a fost demolată definitiv.
          </p>
          
          <div>
            <Link 
              href="/" 
              className="inline-block border border-white/20 hover:border-white text-xs uppercase tracking-widest px-6 py-4 transition-all duration-300 bg-transparent hover:bg-white hover:text-black"
            >
              Revenire la planul principal
            </Link>
          </div>
        </div>
      </div>

    <Footer />
    </main>

  );
}
