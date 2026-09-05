'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function EditeazaProiect() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [autorizat, setAutorizat] = useState(false);
  const [loadingProiect, setLoadingProiect] = useState(true);
  const [negasit, setNegasit] = useState(false);

  const [titlu, setTitlu] = useState('');
  const [beneficiar, setBeneficiar] = useState('');
  const [locatie, setLocatie] = useState('');
  const [tip, setTip] = useState('');
  const [descriere, setDescriere] = useState('');
  const [imaginiExistente, setImaginiExistente] = useState<string[]>([]);
  const [fisiereNoi, setFisiereNoi] = useState<File[]>([]);
  const [previzualizariNoi, setPrevizualizariNoi] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [stergand, setStergand] = useState(false);
  const [eroare, setEroare] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);

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

      const { data: proiect, error } = await supabase
        .from('proiecte_recente')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !proiect) {
        setNegasit(true);
        setLoadingProiect(false);
        return;
      }

      setTitlu(proiect.titlu ?? '');
      setBeneficiar(proiect.beneficiar ?? '');
      setLocatie(proiect.locatie ?? '');
      setTip(proiect.tip ?? '');
      setDescriere(proiect.descriere ?? '');
      setImaginiExistente(proiect.imagini ?? []);
      setLoadingProiect(false);
    }
    verificaSiIncarca();
  }, [id, router, supabase]);

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const noi = Array.from(e.target.files ?? []);
    if (noi.length === 0) return;
    setFisiereNoi((prev) => [...prev, ...noi]);
    setPrevizualizariNoi((prev) => [...prev, ...noi.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const eliminaPozaExistenta = (index: number) => {
    setImaginiExistente((prev) => prev.filter((_, i) => i !== index));
  };

  const eliminaPozaNoua = (index: number) => {
    setFisiereNoi((prev) => prev.filter((_, i) => i !== index));
    setPrevizualizariNoi((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titlu.trim()) {
      setEroare('Titlul e obligatoriu.');
      return;
    }

    setSaving(true);
    setEroare(null);
    setSucces(false);

    try {
      const urlNoi: string[] = [];

      for (const fisier of fisiereNoi) {
        const extensie = fisier.name.split('.').pop();
        const numeFisier = `${crypto.randomUUID()}.${extensie}`;

        const { error: uploadError } = await supabase.storage
          .from('proiecte')
          .upload(numeFisier, fisier, { upsert: false });

        if (uploadError) throw new Error(`Eroare la încărcarea unei imagini noi: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage.from('proiecte').getPublicUrl(numeFisier);
        urlNoi.push(publicUrlData.publicUrl);
      }

      const imaginiFinale = [...imaginiExistente, ...urlNoi];

      const { error: updateError } = await supabase
        .from('proiecte_recente')
        .update({
          titlu: titlu.trim(),
          beneficiar: beneficiar.trim() || null,
          locatie: locatie.trim() || null,
          tip: tip.trim() || null,
          descriere: descriere.trim() || null,
          imagini: imaginiFinale,
          imagine_url: imaginiFinale[0] ?? null,
        })
        .eq('id', id);

      if (updateError) throw new Error(`Eroare la salvare: ${updateError.message}`);

      setSucces(true);
      setFisiereNoi([]);
      setPrevizualizariNoi([]);
      setImaginiExistente(imaginiFinale);
    } catch (err: any) {
      console.error(err);
      setEroare(err?.message ?? 'Eroare necunoscută la salvare.');
    } finally {
      setSaving(false);
    }
  };

  const stergeProiect = async () => {
    if (!confirm('Ștergi definitiv acest proiect? Nu poate fi recuperat.')) return;
    setStergand(true);

    const { error } = await supabase.from('proiecte_recente').delete().eq('id', id);

    if (error) {
      console.error(error);
      alert('Nu s-a putut șterge proiectul.');
      setStergand(false);
      return;
    }
    router.push('/dashboard/admin/proiecte');
  };

  if (checkingAuth || loadingProiect) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">Se încarcă...</p>
      </div>
    );
  }

  if (!autorizat) return null;

  if (negasit) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
        <p className="text-sm font-mono text-neutral-400">Proiectul nu a fost găsit.</p>
        <Link href="/dashboard/admin/proiecte" className="text-[11px] font-mono uppercase tracking-widest text-[#bfa054] underline">
          Înapoi la listă
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-4 sm:px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-[0.25em] text-neutral-500 uppercase font-bold block mb-2">
              Admin · Proiecte
            </span>
            <h1 className="text-3xl font-serif font-extralight tracking-tight text-white">
              Editează <em className="italic text-[#bfa054]">proiectul.</em>
            </h1>
          </div>
          <Link
            href="/dashboard/admin/proiecte"
            className="shrink-0 text-[10px] font-mono uppercase tracking-widest text-neutral-500 hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5"
          >
            Înapoi la listă
          </Link>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2">
              Titlu proiect *
            </label>
            <input
              type="text"
              value={titlu}
              onChange={(e) => setTitlu(e.target.value)}
              required
              className="w-full px-4 py-3 border border-white/10 bg-white/[0.03] text-sm text-white focus:outline-none focus:border-[#bfa054]/60 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2">
                Beneficiar
              </label>
              <input
                type="text"
                value={beneficiar}
                onChange={(e) => setBeneficiar(e.target.value)}
                className="w-full px-4 py-3 border border-white/10 bg-white/[0.03] text-sm text-white focus:outline-none focus:border-[#bfa054]/60 transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2">
                Locație
              </label>
              <input
                type="text"
                value={locatie}
                onChange={(e) => setLocatie(e.target.value)}
                className="w-full px-4 py-3 border border-white/10 bg-white/[0.03] text-sm text-white focus:outline-none focus:border-[#bfa054]/60 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2">
              Tip proiect
            </label>
            <input
              type="text"
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              className="w-full px-4 py-3 border border-white/10 bg-white/[0.03] text-sm text-white focus:outline-none focus:border-[#bfa054]/60 transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2">
              Descriere
            </label>
            <textarea
              value={descriere}
              onChange={(e) => setDescriere(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-white/10 bg-white/[0.03] text-sm text-white focus:outline-none focus:border-[#bfa054]/60 transition resize-none"
            />
          </div>

          {imaginiExistente.length > 0 && (
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2">
                Imagini existente
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {imaginiExistente.map((src, i) => (
                  <div key={src + i} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 bg-white/[0.03] group">
                    <img src={src} alt={`Imagine ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => eliminaPozaExistenta(i)}
                      aria-label="Elimină imaginea"
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2">
              Adaugă imagini noi
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onFilesChange}
              className="w-full text-xs text-neutral-400 file:mr-4 file:px-4 file:py-2 file:border file:border-white/20 file:bg-transparent file:text-xs file:font-mono file:uppercase file:tracking-widest file:text-white file:cursor-pointer hover:file:bg-white hover:file:text-black file:transition-colors"
            />
            {previzualizariNoi.length > 0 && (
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
                {previzualizariNoi.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-[#bfa054]/30 bg-white/[0.03] group">
                    <img src={src} alt={`Nou ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => eliminaPozaNoua(i)}
                      aria-label="Elimină imaginea"
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {eroare && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3">
              {eroare}
            </p>
          )}
          {succes && (
            <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
              Modificări salvate cu succes.
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-white text-black py-3.5 text-xs font-mono uppercase tracking-widest hover:bg-[#bfa054] disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Se salvează...' : 'Salvează modificările'}
            </button>
            <button
              type="button"
              onClick={stergeProiect}
              disabled={stergand}
              className="shrink-0 px-5 py-3.5 text-xs font-mono uppercase tracking-widest border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-40 transition-colors"
            >
              {stergand ? 'Se șterge...' : 'Șterge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}