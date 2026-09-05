'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronDown, Share2, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface ProiectRecent {
  id: string;
  titlu: string;
  beneficiar: string | null;
  locatie: string | null;
  tip: string | null;
  descriere: string | null;
  imagini: string[] | null;
  activ: boolean;
  created_at: string;
}

export default function ProiecteRecentePage() {
  const supabase = createClient();
  const [proiecte, setProiecte] = useState<ProiectRecent[]>([]);
  const [loading, setLoading] = useState(true);
  const [proiectHover, setProiectHover] = useState<number | null>(null);
  const [proiectExtins, setProiectExtins] = useState<string | null>(null);
  const [copiat, setCopiat] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProiecte() {
      setLoading(true);
      const { data, error } = await supabase
        .from('proiecte_recente')
        .select('*')
        .eq('activ', true)
        .order('created_at', { ascending: false });

      if (error) console.error('Eroare la fetch proiecte:', error);
      if (data) setProiecte(data);
      setLoading(false);
    }
    fetchProiecte();
  }, [supabase]);

  function handleShare(e: React.MouseEvent, proiect: ProiectRecent) {
    e.stopPropagation();
    e.preventDefault();
    const url = `${window.location.origin}${window.location.pathname}?proiect=${proiect.id}`;

    if (navigator.share) {
      navigator.share({ title: proiect.titlu, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopiat(proiect.id);
      setTimeout(() => setCopiat(null), 1500);
    }
  }

  return (
    <>
      <Navbar />

      <section className="bg-[#0a0a0a] text-white pt-28 sm:pt-32 md:pt-40 pb-16 sm:pb-20 md:pb-32 px-4 sm:px-6 relative min-h-screen">
        <div className="max-w-7xl mx-auto">

          {/* MANIFEST VIZUAL — introducere */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-16 mb-16 sm:mb-20 md:mb-32 items-start">
            <div className="lg:col-span-4 space-y-2 lg:space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-[1px] w-8 bg-neutral-600" />
                <span className="text-[10px] font-mono tracking-[0.25em] text-neutral-500 uppercase font-bold">Actualizat constant</span>
              </div>
              <h3 className="text-sm font-mono tracking-widest uppercase font-bold text-white">CELE MAI NOI PROIECTE</h3>
            </div>

            <div className="lg:col-span-8">
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-extralight font-serif tracking-tight leading-tight text-white max-w-4xl">
                „Fiecare proiect finalizat este <span className="italic font-normal text-[#bfa054]">dovada vie</span> a felului în care lucrăm.”
              </p>
              <div className="h-[1px] w-24 sm:w-32 bg-white/20 mt-5 sm:mt-6 md:mt-8 mb-4 md:mb-6" />
              <p className="text-xs text-neutral-500 max-w-md leading-relaxed font-light tracking-wide">
                O selecție live a celor mai recente lucrări livrate de biroul Bogdan Sotingeanu, alături de beneficiarii care ne-au ales.
              </p>
            </div>
          </div>

          {/* LISTĂ PROIECTE */}
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-white/10 pb-4">
              <span className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase">Proiecte recente</span>
              <span className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase hidden sm:inline">
                {proiecte.length.toString().padStart(2, '0')} rezultate
              </span>
            </div>

            {loading ? (
              <div className="py-24 text-center">
                <div className="w-6 h-6 border-2 border-white/10 border-t-[#bfa054] rounded-full mx-auto mb-4 animate-spin" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Se încarcă proiectele...</p>
              </div>
            ) : proiecte.length === 0 ? (
              <p className="py-24 text-center text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                Niciun proiect publicat momentan.
              </p>
            ) : (
              <div className="flex flex-col">
                {proiecte.map((proiect, index) => {
                  const numar = (index + 1).toString().padStart(2, '0');
                  const imagini = proiect.imagini ?? [];
                  const coperta = imagini[0] ?? null;
                  const extins = proiectExtins === proiect.id;

                  return (
                    <div
                      key={proiect.id}
                      className={`border-b border-white/10 group relative transition-colors duration-300 hover:bg-white/[0.02] ${
                        proiectHover === index ? 'z-40' : 'z-0'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setProiectExtins(extins ? null : proiect.id)}
                        onMouseEnter={() => setProiectHover(index)}
                        onMouseLeave={() => setProiectHover(null)}
                        className="w-full text-left"
                      >
                        {/* ───────── MOBILE / TABLET CARD (< md) ───────── */}
                        <div className="md:hidden py-6 px-1">
                          <div className="relative w-full aspect-[16/10] overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                            {coperta ? (
                              <img
                                src={coperta}
                                alt={proiect.titlu}
                                className="w-full h-full object-cover object-center"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] font-mono uppercase tracking-widest text-neutral-600">
                                Fără previzualizare
                              </div>
                            )}
                            <span className="absolute top-3 left-3 text-[10px] font-mono tracking-widest text-white bg-black/60 backdrop-blur-sm px-2 py-1">
                              {numar}
                            </span>
                            {imagini.length > 1 && (
                              <span className="absolute top-3 right-3 text-[9px] font-mono tracking-widest text-black bg-[#bfa054]/95 backdrop-blur-sm px-2 py-1">
                                +{imagini.length - 1} poze
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleShare(e, proiect)}
                              className="absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center bg-black/60 backdrop-blur-sm border border-white/10 text-white active:bg-[#bfa054] active:text-black transition-colors duration-300"
                              title="Distribuie proiectul"
                            >
                              {copiat === proiect.id ? <Check size={14} /> : <Share2 size={14} />}
                            </button>
                          </div>

                          <div className="mt-4 space-y-1.5">
                            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                              {proiect.tip || 'Arhitectură'}
                            </p>
                            <h4 className="text-lg font-light font-serif tracking-tight text-white leading-snug">
                              {proiect.titlu}
                            </h4>
                            {proiect.locatie && (
                              <p className="text-xs text-neutral-400 font-light tracking-wide">{proiect.locatie}</p>
                            )}
                            {proiect.beneficiar && (
                              <p className="text-[10px] font-mono text-neutral-500 tracking-wide">
                                Beneficiar: {proiect.beneficiar}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* ───────── DESKTOP EDITORIAL ROW (md+) ───────── */}
                        <div className="hidden md:grid grid-cols-12 gap-6 items-center py-8 md:group-hover:px-4 transition-[padding] duration-300">
                          <div className="col-span-1 text-xs font-mono text-neutral-500 tabular-nums">
                            {numar}
                          </div>

                          <div className="col-span-5 lg:col-span-6 space-y-1 min-w-0">
                            <h4 className="text-xl lg:text-2xl font-light font-serif tracking-tight text-white truncate group-hover:translate-x-2 transition-transform duration-500 ease-out">
                              {proiect.titlu}
                            </h4>
                            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                              {proiect.tip || 'Arhitectură'}
                              {proiect.beneficiar && <span className="ml-2">· {proiect.beneficiar}</span>}
                              {imagini.length > 1 && <span className="ml-2 text-[#bfa054]">· {imagini.length} poze</span>}
                            </p>
                          </div>

                          <div className="col-span-4 lg:col-span-3 text-xs text-neutral-400 font-light tracking-wide leading-relaxed">
                            {proiect.locatie || '—'}
                          </div>

                          <div className="col-span-2 flex justify-end text-neutral-500 group-hover:text-white transition-colors">
                            <ChevronDown
                              size={18}
                              strokeWidth={1.5}
                              className={`transition-transform duration-500 ${extins ? 'rotate-180' : ''}`}
                            />
                          </div>
                        </div>
                      </button>

                      {/* FLOATING HOVER CARD IMAGE (desktop only) — doar cât nu e extins */}
                      {!extins && (
                        <div
                          className={`hidden md:block absolute right-[4%] lg:right-[8%] xl:right-[12%] top-1/2 -translate-y-1/2 w-[220px] lg:w-[280px] xl:w-[320px] aspect-[4/5] z-30 overflow-hidden border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.5)] bg-white/[0.03] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                            proiectHover === index
                              ? 'opacity-100 scale-100 translate-x-0'
                              : 'opacity-0 scale-95 translate-x-4 pointer-events-none'
                          }`}
                        >
                          <div className="w-full h-full relative group/preview">
                            {coperta ? (
                              <img
                                src={coperta}
                                alt={proiect.titlu}
                                className="w-full h-full object-cover object-center grayscale group-hover/preview:grayscale-0 transition-all duration-700 ease-out"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] font-mono uppercase tracking-widest text-neutral-600">
                                Fără previzualizare
                              </div>
                            )}
                          </div>
                          <div className="absolute inset-0 bg-black/10 pointer-events-none" />

                          {imagini.length > 1 && (
                            <span className="absolute bottom-4 left-4 text-[9px] font-mono uppercase bg-[#bfa054]/95 text-black px-2 py-1 tracking-widest">
                              +{imagini.length - 1} poze — click pentru galerie
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={(e) => handleShare(e, proiect)}
                            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-black/60 backdrop-blur-sm border border-white/10 text-white hover:bg-[#bfa054] hover:text-black transition-colors duration-300"
                            title="Distribuie proiectul"
                          >
                            {copiat === proiect.id ? <Check size={14} /> : <Share2 size={14} />}
                          </button>
                        </div>
                      )}

                      {/* GALERIE EXTINSĂ — toate pozele + descrierea, la click */}
                      {extins && (
                        <div className="pb-8 px-1 md:px-0 animate-in fade-in duration-300">
                          {proiect.descriere && (
                            <p className="text-sm text-neutral-300 font-light leading-relaxed max-w-2xl mb-6">
                              {proiect.descriere}
                            </p>
                          )}
                          {imagini.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                              {imagini.map((src, i) => (
                                <div
                                  key={src + i}
                                  className="relative aspect-[4/5] rounded-lg overflow-hidden border border-white/10 bg-white/[0.03]"
                                >
                                  <img src={src} alt={`${proiect.titlu} — poza ${i + 1}`} className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-600">
                              Niciun poze disponibile pentru acest proiect.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}