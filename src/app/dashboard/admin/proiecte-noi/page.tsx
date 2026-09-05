'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import DashHeader from '@/components/DashHeader'

export default function AdaugaProiectNou() {
  const supabase = createClient();
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [autorizat, setAutorizat] = useState(false);

  const [titlu, setTitlu] = useState('');
  const [beneficiar, setBeneficiar] = useState('');
  const [locatie, setLocatie] = useState('');
  const [tip, setTip] = useState('');
  const [descriere, setDescriere] = useState('');
  const [fisiere, setFisiere] = useState<File[]>([]);
  const [previzualizari, setPrevizualizari] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [eroare, setEroare] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);

  useEffect(() => {
    async function verificaRol() {
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

      if (!rolPermis) router.push('/dashboard/client');
    }
    verificaRol();
  }, [router, supabase]);

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const noi = Array.from(e.target.files ?? []);
    if (noi.length === 0) return;
    setFisiere((prev) => [...prev, ...noi]);
    setPrevizualizari((prev) => [...prev, ...noi.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const eliminaPoza = (index: number) => {
    setFisiere((prev) => prev.filter((_, i) => i !== index));
    setPrevizualizari((prev) => prev.filter((_, i) => i !== index));
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
      const urlImagini: string[] = [];

      for (const fisier of fisiere) {
        const extensie = fisier.name.split('.').pop();
        const numeFisier = `${crypto.randomUUID()}.${extensie}`;

        const { error: uploadError } = await supabase.storage
          .from('proiecte')
          .upload(numeFisier, fisier, { upsert: false });

        if (uploadError) throw new Error(`Eroare la încărcarea unei imagini: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage.from('proiecte').getPublicUrl(numeFisier);
        urlImagini.push(publicUrlData.publicUrl);
      }

      const { data: { session } } = await supabase.auth.getSession();

      const { error: insertError } = await supabase.from('proiecte_recente').insert({
        titlu: titlu.trim(),
        beneficiar: beneficiar.trim() || null,
        locatie: locatie.trim() || null,
        tip: tip.trim() || null,
        descriere: descriere.trim() || null,
        imagini: urlImagini,
        imagine_url: urlImagini[0] ?? null,
        created_by: session?.user?.id ?? null,
      });

      if (insertError) throw new Error(`Eroare la salvarea proiectului: ${insertError.message}`);

      setSucces(true);
      setTitlu('');
      setBeneficiar('');
      setLocatie('');
      setTip('');
      setDescriere('');
      setFisiere([]);
      setPrevizualizari([]);
    } catch (err: any) {
      console.error(err);
      setEroare(err?.message ?? 'Eroare necunoscută la salvare.');
    } finally {
      setSaving(false);
    }
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
      <DashHeader/>
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-[0.25em] text-neutral-500 uppercase font-bold block mb-2">
              Admin · Proiecte
            </span>
            <h1 className="text-3xl font-serif font-extralight tracking-tight text-white">
              Adaugă un proiect <em className="italic text-[#bfa054]">nou.</em>
            </h1>
          </div>
          <Link
            href="/dashboard/admin/proiecte"
            className="shrink-0 text-[10px] font-mono uppercase tracking-widest text-neutral-500 hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5"
          >
            Vezi toate proiectele
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
              placeholder="Ex: Locuință unifamilială contemporană P+1"
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
                placeholder="Ex: Familia Popescu / SC Exemplu SRL"
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
                placeholder="Ex: Târgoviște, Dâmbovița"
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
              placeholder="Ex: Arhitectură rezidențială, Lăcaș de cult, Spații comerciale"
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
              placeholder="Câteva rânduri despre proiect..."
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2">
              Imagini (poți selecta mai multe deodată)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onFilesChange}
              className="w-full text-xs text-neutral-400 file:mr-4 file:px-4 file:py-2 file:border file:border-white/20 file:bg-transparent file:text-xs file:font-mono file:uppercase file:tracking-widest file:text-white file:cursor-pointer hover:file:bg-white hover:file:text-black file:transition-colors"
            />

            {previzualizari.length > 0 && (
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
                {previzualizari.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 bg-white/[0.03] group">
                    <img src={src} alt={`Previzualizare ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => eliminaPoza(i)}
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
              Proiect publicat cu succes.
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-white text-black py-3.5 text-xs font-mono uppercase tracking-widest hover:bg-[#bfa054] disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Se publica pe platforma...' : 'Publica proiectul proiectul'}
          </button>
        </form>
      </div>
    </div>
  );
}