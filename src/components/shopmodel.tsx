'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Produs {
  id: string;
  nume: string;
  pret: number;
  pret_vechi: number | null;
  categorie: string | null;
  imagine_url: string | null;
  activ: boolean;
  featured: boolean;
  created_at: string;
}

export default function ShopShowcase() {
  const supabase = createClient();
  const [produse, setProduse] = useState<Produs[]>([]);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Bucket-ul 'products' e PRIVAT, deci un URL public direct nu funcționează
  // niciodată, indiferent cum e scris. Extragem calea reală a fișierului din
  // interiorul bucket-ului (ce e salvat, greșit, ca URL public în DB) și
  // generăm un URL semnat, temporar, valabil pentru afișare.
  const extractStoragePath = (rawUrl: string | null, bucket: string): string | null => {
    if (!rawUrl) return null;
    const marker = `/object/public/${bucket}/`;
    const idx = rawUrl.indexOf(marker);
    if (idx === -1) return null;
    return rawUrl.substring(idx + marker.length);
  };

  useEffect(() => {
    async function fetchProduse() {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, nume, pret, pret_vechi, categorie, imagine_url, activ, featured, created_at')
        .eq('activ', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) console.error('Eroare la fetch produse:', error);
      if (data) setProduse(data);
      setLoading(false);
    }
    fetchProduse();
  }, [supabase]);

  // Generăm URL-uri semnate pentru toate produsele cu imagine, din bucket-ul privat
  useEffect(() => {
    if (produse.length === 0) return;

    async function genereazaUrlSemnate() {
      const rezultate = await Promise.all(
        produse.map(async (produs) => {
          const path = extractStoragePath(produs.imagine_url, 'products');
          if (!path) return [produs.id, null] as const;

          const { data, error } = await supabase.storage
            .from('products')
            .createSignedUrl(path, 3600); // valabil 1 oră

          if (error) {
            console.error('Eroare la generarea URL-ului semnat pentru', produs.nume, '\nCale încercată:', path, '\nEroare:', error.message);
            return [produs.id, null] as const;
          }

          return [produs.id, data?.signedUrl ?? null] as const;
        })
      );

      const map: Record<string, string> = {};
      for (const [id, url] of rezultate) {
        if (url) map[id] = url;
      }
      setSignedUrls(map);
    }

    genereazaUrlSemnate();
  }, [produse, supabase]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="bg-[#faf8f5] text-[#121212] py-16 sm:py-20 md:py-28 px-4 sm:px-6 border-t border-[#e5e0d8] relative overflow-hidden">
      <style>{`
        @keyframes shopFadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shopFloatSlow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
        }
        .shop-anim-fadeup { animation: shopFadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .shop-anim-float { animation: shopFloatSlow 5s ease-in-out infinite; }
      `}</style>
      <div className="max-w-7xl mx-auto">

        {/* HEADER SECȚIUNE */}
        <div className="shop-anim-fadeup flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
          <div className="space-y-2 lg:space-y-3">
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-[#8c8275]" />
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#8c8275] uppercase font-bold">Digital shop arhitectural model</span>
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extralight font-serif tracking-tight text-[#121212]">
              Models 3D &amp; <span className="italic font-normal text-[#6b6255]">objects</span> arhitectural
            </h3>
          </div>

          <Link
            href="/shop"
            className="group inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-[#121212] border-b border-[#121212] pb-1 w-fit hover:text-[#6b6255] hover:border-[#6b6255] transition-colors duration-300"
          >
            Go to shop
            <ArrowUpRight size={14} strokeWidth={1.5} className="group-hover:rotate-45 transition-transform duration-300" />
          </Link>
        </div>

        {/* CARUSEL ORIZONTAL / STARE GOALĂ */}
        {!loading && produse.length === 0 ? (
          <div className="shop-anim-fadeup flex flex-col items-center justify-center text-center py-16 sm:py-20 border border-dashed border-[#e5e0d8] rounded-2xl">
            <svg
              width="56"
              height="56"
              viewBox="0 0 56 56"
              fill="none"
              className="shop-anim-float mb-5 text-[#bfa054]"
            >
              <path d="M28 6 L48 17 V39 L28 50 L8 39 V17 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M8 17 L28 28 L48 17" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M28 28 V50" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            <h4 className="font-serif text-lg sm:text-xl text-[#121212] mb-2">
              Prapair <em className="italic text-[#6b6255]">new model.</em>
            </h4>
            <p className="text-xs text-[#8c8275] font-light tracking-wide max-w-xs leading-relaxed">
              Sorry! At this momemnt do not publish any model in the shop. Please check back later for new 3D models and digital products.
            </p>
          </div>
        ) : (
        <div className="relative">
          {/* Săgeți de navigare — doar desktop */}
          <button
            onClick={() => scroll('left')}
            aria-label="Derulează la stânga"
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-[#faf8f5] border border-[#e5e0d8] items-center justify-center text-[#8c8275] hover:text-[#121212] hover:border-[#121212] transition-colors duration-300 shadow-sm"
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Derulează la dreapta"
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-[#faf8f5] border border-[#e5e0d8] items-center justify-center text-[#8c8275] hover:text-[#121212] hover:border-[#121212] transition-colors duration-300 shadow-sm"
          >
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>

          {/* Măști de fade pe margini, ca să se simtă că mai e conținut de derulat */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-16 bg-gradient-to-r from-[#faf8f5] to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-16 bg-gradient-to-l from-[#faf8f5] to-transparent z-10" />

          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="shrink-0 snap-start w-[220px] sm:w-[260px] animate-pulse"
                  >
                    <div className="aspect-[4/5] rounded-xl border border-[#e5e0d8] bg-[#f0ece3]" />
                    <div className="mt-3 h-3 w-3/4 bg-[#f0ece3] rounded" />
                    <div className="mt-2 h-3 w-1/2 bg-[#f0ece3] rounded" />
                  </div>
                ))
              : produse.map((produs, index) => {
                  const pretAfisat = Number(produs.pret) === 0 ? 'Gratuit' : `${Number(produs.pret).toFixed(2)} RON`;
                  const areReducere = produs.pret_vechi != null && Number(produs.pret_vechi) > Number(produs.pret);
                  const imagineUrl = signedUrls[produs.id] ?? null;

                  return (
                    <Link
                      key={produs.id}
                      href="/shop"
                      className="shop-anim-fadeup group shrink-0 snap-start w-[220px] sm:w-[260px]"
                      style={{ animationDelay: `${index * 70}ms` }}
                    >
                      <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-[#e5e0d8] bg-[#f5f1ea] shadow-sm transition-shadow duration-300 group-hover:shadow-[0_20px_45px_rgba(0,0,0,0.1)]">
                        {imagineUrl ? (
                          <img
                            src={imagineUrl}
                            alt={produs.nume}
                            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                            onError={(e) => {
                              console.error('IMAGINE EȘUATĂ pentru', produs.nume, '\nURL încercat:', imagineUrl, '\nURL brut din DB:', produs.imagine_url);
                            }}
                            onLoad={() => console.log('Imagine OK:', produs.nume, imagineUrl)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-mono uppercase tracking-widest text-[#8c8275]">
                            No preview
                          </div>
                        )}

                        {produs.featured && (
                          <span className="absolute top-3 left-3 text-[9px] font-mono tracking-widest text-black bg-amber-400/95 backdrop-blur-sm px-2 py-1">
                            RECOMANDED
                          </span>
                        )}

                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent px-3 pt-6 pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-white flex items-center gap-1">
                            See on the shop <ArrowUpRight size={12} />
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 space-y-0.5">
                        <p className="text-[9px] font-mono text-[#8c8275] uppercase tracking-widest">
                          {produs.categorie || 'Model 3D'}
                        </p>
                        <h4 className="text-sm font-serif font-light text-[#121212] truncate">
                          {produs.nume}
                        </h4>
                        <p className="text-xs font-mono text-[#554d42] flex items-center gap-1.5">
                          {areReducere && (
                            <span className="line-through text-[#a89f92]">{Number(produs.pret_vechi).toFixed(2)}</span>
                          )}
                          {pretAfisat}
                        </p>
                      </div>
                    </Link>
                  );
                })}
          </div>
        </div>
        )}

      </div>
    </section>
  );
}