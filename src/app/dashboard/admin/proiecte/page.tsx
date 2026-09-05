'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Pencil, Trash2, Eye, EyeOff, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ProiectRecent {
  id: string;
  titlu: string;
  beneficiar: string | null;
  locatie: string | null;
  tip: string | null;
  imagini: string[] | null;
  activ: boolean;
  created_at: string;
}

export default function AdminProiecteList() {
  const supabase = createClient();
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [autorizat, setAutorizat] = useState(false);
  const [proiecte, setProiecte] = useState<ProiectRecent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stergere, setStergere] = useState<string | null>(null);

  useEffect(() => {
    async function verificaSiIncarca() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', session.user.id)
        .single();

      const rolPermis = profile?.rol === 'superadmin' || profile?.rol === 'angajat';
      setAutorizat(rolPermis);
      setCheckingAuth(false);

      if (!rolPermis) {
        router.push('/dashboard/client');
        return;
      }

      await fetchProiecte();
    }
    verificaSiIncarca();
  }, [router, supabase]);

  async function fetchProiecte() {
    setLoading(true);
    const { data, error } = await supabase
      .from('proiecte_recente')
      .select('id, titlu, beneficiar, locatie, tip, imagini, activ, created_at')
      .order('created_at', { ascending: false });

    if (error) console.error('Eroare la fetch proiecte:', error);
    if (data) setProiecte(data);
    setLoading(false);
  }

  const toggleActiv = async (proiect: ProiectRecent) => {
    const prevState = proiecte;
    setProiecte((prev) => prev.map((p) => (p.id === proiect.id ? { ...p, activ: !p.activ } : p)));

    const { error } = await supabase
      .from('proiecte_recente')
      .update({ activ: !proiect.activ })
      .eq('id', proiect.id);

    if (error) {
      console.error('Eroare la schimbarea statusului:', error);
      setProiecte(prevState);
      alert('Nu s-a putut schimba statusul proiectului.');
    }
  };

  const stergeProiect = async (id: string) => {
    if (!confirm('Ștergi definitiv acest proiect? Nu poate fi recuperat.')) return;

    setStergere(id);
    const { error } = await supabase.from('proiecte_recente').delete().eq('id', id);
    setStergere(null);

    if (error) {
      console.error('Eroare la ștergere:', error);
      alert('Nu s-a putut șterge proiectul.');
      return;
    }
    setProiecte((prev) => prev.filter((p) => p.id !== id));
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">Se verifică accesul...</p>
      </div>
    );
  }

  if (!autorizat) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-4 sm:px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="text-[10px] font-mono tracking-[0.25em] text-neutral-500 uppercase font-bold block mb-2">
              Admin · Proiecte
            </span>
            <h1 className="text-3xl font-serif font-extralight tracking-tight text-white">
              Toate <em className="italic text-[#bfa054]">proiectele.</em>
            </h1>
          </div>
          <Link
            href="/dashboard/admin/proiecte-noi"
            className="inline-flex items-center gap-2 bg-white text-black px-4 py-2.5 text-[11px] font-mono uppercase tracking-widest hover:bg-[#bfa054] transition-colors"
          >
            <Plus size={14} /> Proiect nou
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-6 h-6 border-2 border-white/10 border-t-[#bfa054] rounded-full mx-auto mb-4 animate-spin" />
            <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Se încarcă...</p>
          </div>
        ) : proiecte.length === 0 ? (
          <p className="py-24 text-center text-[10px] font-mono uppercase tracking-widest text-neutral-500">
            Niciun proiect adăugat încă.
          </p>
        ) : (
          <div className="flex flex-col border-t border-white/10">
            {proiecte.map((proiect) => (
              <div
                key={proiect.id}
                className="flex items-center gap-4 py-4 border-b border-white/10 group"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 bg-white/[0.03] shrink-0">
                  {proiect.imagini && proiect.imagini.length > 0 ? (
                    <img src={proiect.imagini[0]} alt={proiect.titlu} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] font-mono text-neutral-600 uppercase">
                      Fără poze
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-serif text-white truncate">{proiect.titlu}</h4>
                    {!proiect.activ && (
                      <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 border border-white/10 px-1.5 py-0.5 shrink-0">
                        Ascuns
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest truncate">
                    {proiect.tip || 'Arhitectură'}
                    {proiect.locatie && <span> · {proiect.locatie}</span>}
                    {proiect.imagini && proiect.imagini.length > 0 && (
                      <span> · {proiect.imagini.length} poze</span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleActiv(proiect)}
                    title={proiect.activ ? 'Ascunde de pe site' : 'Publică pe site'}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:border-white/30 transition-colors"
                  >
                    {proiect.activ ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <Link
                    href={`/dashboard/admin/proiecte/${proiect.id}`}
                    title="Editează"
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:border-white/30 transition-colors"
                  >
                    <Pencil size={14} />
                  </Link>
                  <button
                    onClick={() => stergeProiect(proiect.id)}
                    disabled={stergere === proiect.id}
                    title="Șterge definitiv"
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-neutral-400 hover:text-red-400 hover:border-red-500/30 transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}