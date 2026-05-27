'use client';

import React, { useState } from 'react';
import { FileText, Layers, ShieldCheck, Milestone, ArrowRight } from 'lucide-react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
interface StageDetails {
  id: string;
  step: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: string;
  deliverables: string[];
}

const URBANISM_STAGES: StageDetails[] = [
  {
    id: 'cu',
    step: '01',
    title: 'Certificat de Urbanism (CU)',
    description: 'Analiza inițială a terenului și obținerea actului informativ obligatoriu care stabilește regulile jocului: regimul juridic, economic și tehnic al proprietății.',
    icon: <FileText className="w-5 h-5 text-amber-500" />,
    duration: '30 - 45 zile',
    deliverables: ['Studiu de oportunitate', 'Planuri cadastrale vizate', 'Formulare și cereri tip redactate autorizat'],
  },
  {
    id: 'puz-pud',
    step: '02',
    title: 'Documentații PUZ / PUD',
    description: 'Modificarea sau detalierea indicatorilor urbanistici (POT, CUT, Regim de Înălțime). Elaborăm planurile urbanistice zonale sau de detaliu conform viziunii arhitecturale și cerințelor locale.',
    icon: <Layers className="w-5 h-5 text-amber-500" />,
    duration: '4 - 9 luni',
    deliverables: ['Memoriu tehnic justificativ', 'Planșe de reglementări urbanistice', 'Modelare volumetrică 3D pentru comisii'],
  },
  {
    id: 'avize',
    step: '03',
    title: 'Avize și Acorduri de Amplasament',
    description: 'Managementul complet al procesului de avizare. Obținem acordurile necesare de la utilități (apă, canal, gaz, electricitate), mediu, ISU, DSP, Cultură și alte autorități solicitate prin CU.',
    icon: <Milestone className="w-5 h-5 text-amber-500" />,
    duration: '30 - 60 zile',
    deliverables: ['Avize de amplasament favorabile', 'Scenariu de securitate la incendiu (preliminar)', 'Acord de mediu'],
  },
  {
    id: 'dtac',
    step: '04',
    title: 'Autorizația de Construire (DTAC)',
    description: 'Faza finală și cea mai critică a birocrației. Întocmim documentația tehnică completă pentru obținerea autorizației care îți dă dreptul legal de a începe șantierul.',
    icon: <ShieldCheck className="w-5 h-5 text-amber-500" />,
    duration: '30 - 90 zile',
    deliverables: ['Proiect tehnic vizat spre neschimbare', 'Autorizație de Construire emisă', 'Grafic de execuție oficial'],
  },
];

export default function UrbanismSection() {
  const [activeStage, setActiveStage] = useState<StageDetails>(URBANISM_STAGES[0]);

  return (
      <div className="w-full bg-[#0d0d0d] text-white">
    <section className="relative w-full min-h-screen bg-[#0d0d0d] text-white py-24 px-6 md:p-12 lg:p-24 selection:bg-amber-500 selection:text-black">
      <Navbar />
      {/* Background decorativ fin - păstrează identitatea vizuală a site-ului */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] bg-amber-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[40vw] h-[40vw] bg-neutral-800/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-16">
        
        {/* TITLU SECȚIUNE */}
        <div className="max-w-2xl">
          <span className="text-amber-500 text-xs font-mono tracking-[0.3em] uppercase block mb-3">
            DEPARTAMENT TEHNIC // LEGAL
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extralight tracking-tight uppercase leading-none">
            Avize, Urbanism <br />
            <span className="font-light text-neutral-400">& Documentații PUD / PUZ</span>
          </h1>
          <p className="text-neutral-500 text-sm md:text-base font-light mt-6 leading-relaxed">
            Transformăm labirintul birocratic într-un proces clar și predictibil. Ne ocupăm de întreaga documentație legală pentru ca viziunea ta arhitecturală să primească undă verde.
          </p>
        </div>

        {/* ZONA INTERACTIVĂ (GRID) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* STÂNGA: Selectorul de pași (Timeline-ul) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {URBANISM_STAGES.map((stage) => {
              const isSelected = activeStage.id === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStage(stage)}
                  className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between group focus:outline-none ${
                    isSelected 
                      ? 'bg-white/[0.03] border-amber-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' 
                      : 'bg-transparent border-white/5 hover:border-white/10 hover:bg-white/[0.01]'
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <span className={`font-mono text-xs tracking-wider transition-colors ${isSelected ? 'text-amber-500' : 'text-neutral-600 group-hover:text-neutral-400'}`}>
                      {stage.step}
                    </span >
                    <div className="flex flex-col">
                      <span className={`text-sm md:text-base tracking-wide transition-colors ${isSelected ? 'text-white font-normal' : 'text-neutral-400 font-light group-hover:text-neutral-200'}`}>
                        {stage.title}
                      </span>
                    </div>
                  </div>
                  <div className={`transition-all duration-300 transform ${isSelected ? 'opacity-100 translate-x-0 text-amber-500' : 'opacity-0 -translate-x-2 text-neutral-500 group-hover:opacity-50'}`}>
                    <ArrowRight size={16} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* DREAPTA: Panoul de Detalii Schimbător (Woow Effect) */}
          <div className="lg:col-span-7 bg-neutral-950/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-[0_40px_80px_rgba(0,0,0,0.7)] min-h-[420px] flex flex-col justify-between transition-all duration-500">
            
            {/* Header Detalii */}
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    {activeStage.icon}
                  </div>
                  <span className="text-[10px] font-mono tracking-[0.2em] text-neutral-500 uppercase">Faza Operațională</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono tracking-wider text-amber-400 uppercase block">Timp Estimat</span>
                  <span className="text-xs text-white font-medium">{activeStage.duration}</span>
                </div>
              </div>

              {/* Descriere principală */}
              <h3 className="text-white text-xl md:text-2xl font-light tracking-wide mb-4">
                {activeStage.title}
              </h3>
              <p className="text-neutral-400 text-xs md:text-sm font-light leading-relaxed normal-case tracking-normal mb-8">
                {activeStage.description}
              </p>
            </div>

            {/* Listă Livrabile realizate de agenție */}
            <div className="border-t border-white/5 pt-6">
              <span className="text-[10px] font-mono tracking-[0.2em] text-amber-500 uppercase block mb-4">Documente incluse în serviciu</span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeStage.deliverables.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-neutral-400 text-xs font-light">
                    <span className="text-amber-500 mt-1 font-mono text-[10px]">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

      </div>

    </section>
     <Footer />
    </div>
  );
}
