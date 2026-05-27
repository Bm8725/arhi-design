"use client";

import { useState } from 'react';
import { 
  Building2, FolderKanban, Clock, 
  Search, SlidersHorizontal, MoreVertical, TrendingUp
} from 'lucide-react';


interface ProiectDashboard {
  id: string;
  cod: string;
  client: string;
  tip: string;
  status: 'schita' | 'avizare' | 'randare3d' | 'executie' | 'finalizat';
  progres: number;
  buget: string;
  dataModificare: string;
}

export default function DashboardPage() {
  const [filtruStatus, setFiltruStatus] = useState<string>('toate');
  const [cautare, setCautare] = useState<string>('');

  // Date fixe afișate direct pe ecran
  const proiecte: ProiectDashboard[] = [
    { id: '1', cod: 'PRJ-024', client: 'Andrei Ionescu', tip: 'Casă Privată (Brutalism Cald)', status: 'randare3d', progres: 65, buget: 'Premium', dataModificare: 'Astăzi, 14:20' },
    { id: '2', cod: 'PRJ-025', client: 'S.C. Nexus Hub', tip: 'Birouri & Retail Comercial', status: 'avizare', progres: 30, buget: 'De Lux', dataModificare: 'Ieri, 09:15' },
    { id: '3', cod: 'PRJ-026', client: 'Elena Radu', tip: 'Design Interior Apartament', status: 'executie', progres: 85, buget: 'Mediu', dataModificare: '22 Mai 2026' },
    { id: '4', cod: 'PRJ-027', client: 'Mihai Popescu', tip: 'Rezidență Nordică', status: 'schita', progres: 10, buget: 'Premium', dataModificare: '18 Mai 2026' },
  ];

  // Filtrare simplă pe text și status
  const proiecteFiltrate = proiecte.filter(p => {
    const potrivireStatus = filtruStatus === 'toate' || p.status === filtruStatus;
    const potrivireCautare = p.client.toLowerCase().includes(cautare.toLowerCase()) || p.cod.toLowerCase().includes(cautare.toLowerCase());
    return potrivireStatus && potrivireCautare;
  });

  const getStatusStil = (status: string) => {
    switch (status) {
      case 'schita': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'avizare': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'randare3d': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'executie': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'finalizat': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#121212] antialiased pt-28 pb-12 px-6">


      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* TOP BAR PENTRU REZUMAT VIZUAL */}
        <div className="border-b border-[#e5e0d8] pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-light font-serif tracking-tight">Atelier Dashboard</h1>
            <p className="text-[10px] text-[#8c8275] font-mono uppercase tracking-[0.2em]">Management Lucrări și Faze de Execuție</p>
          </div>
        </div>

        {/* METRICI MINIMALISTE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { t: 'Proiecte Active', v: proiecte.length, i: FolderKanban, d: 'În lucru pe planșetă' },
            { t: 'Fază de Avize', v: proiecte.filter(p=>p.status==='avizare').length, i: Clock, d: 'Verificare Urbanism' },
            { t: 'Segment de Lux', v: proiecte.filter(p=>p.buget==='De Lux').length, i: Building2, d: 'Finisaje premium' },
            { t: 'Eficiență Predare', v: '98%', i: TrendingUp, d: 'Termene respectate' },
          ].map((card, idx) => {
            const Icon = card.i;
            return (
              <div key={idx} className="bg-white border border-[#e5e0d8] p-6 flex flex-col justify-between h-32 group hover:border-[#121212] transition-colors duration-300">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono tracking-widest text-[#8c8275] uppercase">{card.t}</span>
                  <Icon size={16} className="text-[#8c8275]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-2xl font-light font-serif leading-none">{card.v}</h3>
                  <p className="text-[9px] text-[#a39889] font-mono uppercase tracking-wider mt-1">{card.d}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* FILTRE ȘI BARA DE CĂUTARE REALA */}
        <div className="bg-white border border-[#e5e0d8] p-4 flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="w-full lg:w-80 bg-[#faf8f5] border border-[#e5e0d8] px-4 py-2.5 flex items-center gap-3 focus-within:border-[#121212] transition-colors">
            <Search size={14} className="text-[#8c8275]" />
            <input 
              type="text" placeholder="Caută cod sau client..." value={cautare}
              onChange={(e) => setCautare(e.target.value)}
              className="w-full bg-transparent text-xs tracking-wide focus:outline-none placeholder-[#bfae9e] text-[#121212]"
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {['toate', 'schita', 'avizare', 'randare3d', 'executie', 'finalizat'].map((st) => (
              <button
                key={st} onClick={() => setFiltruStatus(st)}
                className={`px-3 py-2 text-[10px] font-mono uppercase tracking-widest border transition-all duration-300 cursor-pointer ${filtruStatus === st ? 'bg-[#121212] text-white border-[#121212]' : 'bg-transparent text-[#7c7265] border-[#e5e0d8] hover:border-gray-400'}`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* TABEL CENTRAL DE STATUS */}
        <div className="bg-white border border-[#e5e0d8] overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e5e0d8] bg-[#faf8f5] text-[10px] font-mono tracking-widest text-[#8c8275] uppercase">
                <th className="py-4 px-6 font-semibold">Cod</th>
                <th className="py-4 px-6 font-semibold">Client / Structură</th>
                <th className="py-4 px-6 font-semibold">Fază Curentă</th>
                <th className="py-4 px-6 font-semibold">Volum Progres</th>
                <th className="py-4 px-6 font-semibold">Segment</th>
                <th className="py-4 px-6 font-semibold">Actualizat</th>
                <th className="py-4 px-6 font-semibold text-right">Opțiuni</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-[#e5e0d8]/50 text-[#332f2a]">
              {proiecteFiltrate.map((p) => (
                <tr key={p.id} className="hover:bg-[#faf8f5]/60 transition-colors">
                  <td className="py-5 px-6 font-mono font-bold text-neutral-800">{p.cod}</td>
                  <td className="py-5 px-6">
                    <div className="font-semibold text-[#121212]">{p.client}</div>
                    <div className="text-[10px] text-[#8c8275] font-light mt-0.5">{p.tip}</div>
                  </td>
                  <td className="py-5 px-6">
                    <span className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border ${getStatusStil(p.status)}`}>
                      {p.status === 'schita' ? 'Concept / Schiță' :
                       p.status === 'avizare' ? 'Documentație Avize' :
                       p.status === 'randare3d' ? 'Randare 3D / VR' :
                       p.status === 'executie' ? 'În Execuție' : 'Predat / Finalizat'}
                    </span>
                  </td>
                  <td className="py-5 px-6 w-44">
                    <div className="flex items-center gap-3">
                      <div className="h-1 flex-1 bg-neutral-100 overflow-hidden">
                        <div className="h-full bg-neutral-900" style={{ width: `${p.progres}%` }} />
                      </div>
                      <span className="font-mono text-[10px] text-neutral-500">{p.progres}%</span>
                    </div>
                  </td>
                  <td className="py-5 px-6 font-light">{p.buget}</td>
                  <td className="py-5 px-6 text-[#8c8275] font-mono text-[10px]">{p.dataModificare}</td>
                  <td className="py-5 px-6 text-right"><button className="text-neutral-400 hover:text-black p-1 cursor-pointer"><MoreVertical size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}
