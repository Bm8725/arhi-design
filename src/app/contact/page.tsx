"use client";

import { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle2, Home, Building2, Trees, Paintbrush, Sparkles, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppWidget from "@/components/WhatsAppWidget";

export default function ContactPage() {
  const [pas, setPas] = useState(1);
  const [submis, setSubmis] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [date, setDate] = useState({ tipProiect: '', buget: '', nume: '', email: '', telefon: '', detalii: '' });

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const pasulAnterior = () => setPas(p => Math.max(p - 1, 1));

  const handleSelectie = (camp: string, valoare: string) => {
    setDate(d => ({ ...d, [camp]: valoare }));
    if (camp === 'tipProiect') setTimeout(() => setPas(2), 320);
    if (camp === 'buget') setTimeout(() => setPas(3), 320);
  };

  const trimiteFormular = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date.nume || !date.email || !date.telefon) return;
    setSubmis(true);
  };

  const progres = (pas / 3) * 100;

  const tipuri = [
    { id: 'rezidential',  nume: 'Casă / Vilă',    icon: Home,       desc: 'Spații de locuit' },
    { id: 'comercial',    nume: 'Birouri',         icon: Building2,  desc: 'Spații comerciale' },
    { id: 'interior',     nume: 'Interior',        icon: Paintbrush, desc: 'Design interior'  },
    { id: 'peisagistica', nume: 'Peisagistică',    icon: Trees,      desc: 'Amenajări exterioare' },
  ];

  const bugete = [
    { id: 'standard', titlu: 'Standard',  sub: 'Eficiență maximă',   desc: 'Sustenabil, axat pe funcționalitate și materiale durabile de calitate.',   icon: ShieldCheck },
    { id: 'mediu',    titlu: 'Premium',   sub: 'Design personalizat', desc: 'Finisaje superioare, corpuri custom și soluții tehnice avansate.',          icon: Sparkles    },
    { id: 'lux',      titlu: 'Exclusive', sub: 'Fără compromisuri',   desc: 'Materiale rare, automatizări complete și arhitectură de autor.',            icon: Building2   },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400;500&display=swap');

        .c-root *, .c-root *::before, .c-root *::after { box-sizing: border-box; }

        .c-root {
          min-height: 100vh;
          background: #f5f0e8;
          font-family: 'DM Mono', monospace;
          color: #3a2e22;
          position: relative;
          overflow-x: hidden;
        }

        /* ── AMBIENT ── */
        .c-ambient {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background:
            radial-gradient(ellipse 80% 50% at 15% 20%, rgba(180,140,80,0.1) 0%, transparent 60%),
            radial-gradient(ellipse 60% 60% at 85% 80%, rgba(140,120,90,0.08) 0%, transparent 60%);
        }
        .c-grid {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(60,40,20,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(60,40,20,0.04) 1px, transparent 1px);
          background-size: 80px 80px;
        }

        /* ── WRAP ── */
        .c-wrap {
          position: relative; z-index: 1;
          max-width: 820px; margin: 0 auto;
          padding: 80px 40px 60px;
          min-height: 100vh;
          display: flex; flex-direction: column;
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .c-wrap.ready { opacity: 1; transform: translateY(0); }

        /* ── PROGRESS ── */
        .c-prog { margin-bottom: 70px; }
        .c-prog-meta {
          display: flex; justify-content: space-between;
          font-size: 9px; letter-spacing: 0.28em; text-transform: uppercase;
          color: rgba(80,55,30,0.35); margin-bottom: 14px;
        }
        .c-prog-meta span:first-child { display: flex; align-items: center; gap: 8px; }
        .c-prog-meta span:first-child::before {
          content: ''; width: 4px; height: 4px; border-radius: 50%;
          background: rgba(160,110,45,0.8);
          box-shadow: 0 0 8px rgba(160,110,45,0.3);
          animation: blink 2s ease infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .c-prog-track {
          height: 1px; background: rgba(80,55,30,0.12);
          position: relative;
        }
        .c-prog-fill {
          position: absolute; top: 0; left: 0; height: 100%;
          background: linear-gradient(to right, rgba(160,110,45,0.4), rgba(150,100,35,1));
          transition: width 0.7s cubic-bezier(0.4,0,0.2,1);
        }
        .c-prog-cursor {
          position: absolute; top: 50%; transform: translate(-50%,-50%);
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(150,100,35,1);
          box-shadow: 0 0 10px rgba(150,100,35,0.4);
          transition: left 0.7s cubic-bezier(0.4,0,0.2,1);
        }

        /* ── STEP ── */
        .c-step { animation: stepIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards; }
        @keyframes stepIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .c-eyebrow {
          font-size: 9px; letter-spacing: 0.35em; text-transform: uppercase;
          color: rgba(140,95,30,0.65); margin-bottom: 18px;
          display: flex; align-items: center; gap: 12px;
        }
        .c-eyebrow::before {
          content: ''; width: 28px; height: 1px;
          background: linear-gradient(to right, rgba(140,95,30,0.5), transparent);
        }

        .c-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(30px, 4.5vw, 46px);
          font-weight: 300; line-height: 1.15;
          color: #2a1e12; letter-spacing: -0.01em;
          margin-bottom: 48px;
        }
        .c-title em { font-style: italic; color: rgba(150,100,35,0.95); }

        /* ── TYPE CARDS ── */
        .c-type-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media(min-width:560px){ .c-type-grid { grid-template-columns: repeat(4,1fr); } }

        .c-type-card {
          border: 1px solid rgba(80,55,30,0.1);
          background: rgba(255,248,235,0.6);
          padding: 24px 20px 22px;
          cursor: pointer;
          display: flex; flex-direction: column;
          justify-content: space-between;
          aspect-ratio: 1;
          transition: border-color 0.25s, background 0.25s, transform 0.2s;
          position: relative; overflow: hidden;
          text-align: left;
        }
        .c-type-card::after {
          content: ''; position: absolute;
          bottom: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(to right, rgba(150,100,35,0), rgba(150,100,35,0.5), rgba(150,100,35,0));
          transform: scaleX(0); transition: transform 0.3s;
        }
        .c-type-card:hover { border-color: rgba(150,100,35,0.3); transform: translateY(-2px); }
        .c-type-card:hover::after { transform: scaleX(1); }
        .c-type-card.sel {
          border-color: rgba(150,100,35,0.45);
          background: rgba(200,160,80,0.1);
          transform: translateY(-2px);
        }
        .c-type-card.sel::after { transform: scaleX(1); }

        .c-type-icon { color: rgba(80,55,30,0.22); transition: color 0.25s; margin-bottom: 8px; }
        .c-type-card:hover .c-type-icon, .c-type-card.sel .c-type-icon { color: rgba(150,100,35,0.85); }

        .c-type-name {
          font-size: 9.5px; letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(80,55,30,0.4); transition: color 0.25s; line-height: 1.5;
        }
        .c-type-card:hover .c-type-name, .c-type-card.sel .c-type-name { color: rgba(150,100,35,0.9); }

        /* ── BUDGET CARDS ── */
        .c-budget-grid {
          display: grid; grid-template-columns: 1fr; gap: 10px;
        }
        @media(min-width:560px){ .c-budget-grid { grid-template-columns: repeat(3,1fr); } }

        .c-budget-card {
          border: 1px solid rgba(80,55,30,0.1);
          background: rgba(255,248,235,0.6);
          padding: 26px 22px;
          cursor: pointer; text-align: left;
          display: flex; flex-direction: column; gap: 14px;
          transition: border-color 0.25s, background 0.25s, transform 0.2s;
        }
        .c-budget-card:hover { border-color: rgba(150,100,35,0.3); transform: translateY(-2px); }
        .c-budget-card.sel { border-color: rgba(150,100,35,0.45); background: rgba(200,160,80,0.1); transform: translateY(-2px); }

        .c-budget-head {
          display: flex; justify-content: space-between; align-items: flex-start;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(80,55,30,0.1);
        }
        .c-budget-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 300; color: #2a1e12;
        }
        .c-budget-sub {
          font-size: 8.5px; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(80,55,30,0.3); margin-top: 5px;
        }
        .c-budget-ico { color: rgba(80,55,30,0.18); transition: color 0.25s; }
        .c-budget-card:hover .c-budget-ico, .c-budget-card.sel .c-budget-ico { color: rgba(150,100,35,0.5); }
        .c-budget-desc {
          font-size: 10.5px; line-height: 1.75; color: rgba(60,45,25,0.4);
          transition: color 0.25s;
        }
        .c-budget-card:hover .c-budget-desc, .c-budget-card.sel .c-budget-desc { color: rgba(60,45,25,0.7); }

        /* ── FORM ── */
        .c-form { display: flex; flex-direction: column; }
        .c-field {
          position: relative;
          border-bottom: 1px solid rgba(80,55,30,0.12);
          transition: border-color 0.25s;
        }
        .c-field:focus-within { border-bottom-color: rgba(150,100,35,0.5); }
        .c-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0 40px; }

        .c-label {
          position: absolute; top: 18px; left: 0;
          font-size: 8.5px; letter-spacing: 0.28em; text-transform: uppercase;
          color: rgba(80,55,30,0.3); pointer-events: none;
          transition: top 0.2s, font-size 0.2s, color 0.2s;
        }
        .c-input:focus ~ .c-label,
        .c-input:not(:placeholder-shown) ~ .c-label,
        .c-textarea:focus ~ .c-label,
        .c-textarea:not(:placeholder-shown) ~ .c-label {
          top: 6px; font-size: 7.5px; color: rgba(140,95,30,0.7);
        }

        .c-input {
          width: 100%; background: none; border: none; outline: none;
          font-family: 'DM Mono', monospace; font-size: 13px;
          color: #2a1e12; padding: 28px 0 11px;
        }
        .c-input::placeholder { color: transparent; }
        .c-textarea {
          width: 100%; background: none; border: none; outline: none;
          font-family: 'DM Mono', monospace; font-size: 13px;
          color: #2a1e12; padding: 28px 0 11px;
          resize: none; min-height: 90px;
        }
        .c-textarea::placeholder { color: transparent; }
        .c-input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px #f5f0e8 inset;
          -webkit-text-fill-color: #2a1e12;
        }

        /* ── CTA ── */
        .c-cta-row {
          display: flex; align-items: center;
          justify-content: space-between; gap: 24px;
          margin-top: 44px;
        }
        .c-btn-submit {
          display: inline-flex; align-items: center; gap: 18px;
          background: none; border: 1px solid rgba(140,95,30,0.35);
          color: rgba(140,95,30,0.9); cursor: pointer;
          padding: 15px 30px;
          font-family: 'DM Mono', monospace;
          font-size: 9px; letter-spacing: 0.28em; text-transform: uppercase;
          transition: all 0.25s; position: relative; overflow: hidden;
        }
        .c-btn-submit::before {
          content: ''; position: absolute; inset: 0;
          background: rgba(180,130,40,0.07);
          transform: translateX(-101%); transition: transform 0.35s ease;
        }
        .c-btn-submit:hover { border-color: rgba(140,95,30,0.65); }
        .c-btn-submit:hover::before { transform: translateX(0); }
        .c-btn-arrow {
          width: 22px; height: 1px;
          background: rgba(140,95,30,0.6);
          position: relative; transition: width 0.25s;
        }
        .c-btn-arrow::after {
          content: ''; position: absolute; right: -1px; top: -3px;
          width: 7px; height: 7px;
          border-top: 1px solid rgba(140,95,30,0.6);
          border-right: 1px solid rgba(140,95,30,0.6);
          transform: rotate(45deg);
        }
        .c-btn-submit:hover .c-btn-arrow { width: 32px; }
        .c-cta-note {
          font-size: 8.5px; letter-spacing: 0.15em; text-transform: uppercase;
          color: rgba(80,55,30,0.3); line-height: 1.7; text-align: right;
        }

        /* ── BACK ── */
        .c-back {
          display: inline-flex; align-items: center; gap: 8px;
          background: none; border: none; cursor: pointer;
          font-family: 'DM Mono', monospace;
          font-size: 8.5px; letter-spacing: 0.25em; text-transform: uppercase;
          color: rgba(80,55,30,0.3); transition: color 0.2s;
          margin-top: 36px; padding: 0;
        }
        .c-back:hover { color: rgba(80,55,30,0.6); }

        /* ── SUCCESS ── */
        .c-success {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center; gap: 28px;
          animation: stepIn 0.6s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .c-success-ring {
          width: 70px; height: 70px; border-radius: 50%;
          border: 1px solid rgba(150,100,35,0.3);
          display: flex; align-items: center; justify-content: center;
          color: rgba(150,100,35,0.75);
        }
        .c-success-title {
          font-family: 'Playfair Display', serif;
          font-size: 42px; font-weight: 300;
          color: #2a1e12; letter-spacing: 0.01em;
        }
        .c-success-sub {
          font-size: 10.5px; line-height: 1.85;
          color: rgba(60,45,25,0.45); max-width: 340px; letter-spacing: 0.05em;
        }
        .c-success-reset {
          background: none; border: none; cursor: pointer;
          font-family: 'DM Mono', monospace;
          font-size: 8.5px; letter-spacing: 0.3em; text-transform: uppercase;
          color: rgba(80,55,30,0.3); transition: color 0.2s;
          padding-top: 22px; margin-top: 8px;
          border-top: 1px solid rgba(80,55,30,0.1); width: 100%; max-width: 300px;
        }
        .c-success-reset:hover { color: rgba(80,55,30,0.6); }

        /* ── FOOTER ── */
        .c-footer {
          margin-top: 72px; padding-top: 22px;
          border-top: 1px solid rgba(80,55,30,0.08);
          display: flex; justify-content: space-between;
          font-size: 8.5px; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(80,55,30,0.22);
        }
      `}</style>

      <div className="c-root">
        <div className="c-ambient" />
        <div className="c-grid" />
        <Navbar />

        <div className={`c-wrap${mounted ? ' ready' : ''}`}>

          {!submis && (
            <div className="c-prog">
              <div className="c-prog-meta">
                <span>Faza {pas} din 3</span>
                <span>{Math.round(progres)}% schițat</span>
              </div>
              <div className="c-prog-track">
                <div className="c-prog-fill" style={{ width: `${progres}%` }} />
                <div className="c-prog-cursor" style={{ left: `${progres}%` }} />
              </div>
            </div>
          )}

          <div style={{ flex: 1 }}>
            {submis ? (
              <div className="c-success">
                <div className="c-success-ring">
                  <CheckCircle2 size={26} strokeWidth={1} />
                </div>
                <div className="c-success-title">Concept recepționat.</div>
                <p className="c-success-sub">
                  Datele au fost înregistrate. Un arhitect din echipa noastră te va contacta în maximum 24 de ore pentru a discuta viziunea proiectului.
                </p>
                <button className="c-success-reset" onClick={() => { setSubmis(false); setPas(1); setDate({ tipProiect:'', buget:'', nume:'', email:'', telefon:'', detalii:'' }); }}>
                  Configurează alt spațiu
                </button>
              </div>
            ) : (
              <>
                {pas === 1 && (
                  <div className="c-step" key="p1">
                    <div className="c-eyebrow">Tipologie structurală</div>
                    <h2 className="c-title">Ce fel de structură <em>plănuiești?</em></h2>
                    <div className="c-type-grid">
                      {tipuri.map(item => {
                        const Icon = item.icon;
                        return (
                          <button key={item.id} type="button" className={`c-type-card${date.tipProiect === item.id ? ' sel' : ''}`} onClick={() => handleSelectie('tipProiect', item.id)}>
                            <div className="c-type-icon"><Icon size={18} strokeWidth={1.5} /></div>
                            <span className="c-type-name">{item.nume}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {pas === 2 && (
                  <div className="c-step" key="p2">
                    <div className="c-eyebrow">Resurse & execuție</div>
                    <h2 className="c-title">Segmentul de <em>buget alocat</em></h2>
                    <div className="c-budget-grid">
                      {bugete.map(item => {
                        const Icon = item.icon;
                        return (
                          <button key={item.id} type="button" className={`c-budget-card${date.buget === item.id ? ' sel' : ''}`} onClick={() => handleSelectie('buget', item.id)}>
                            <div className="c-budget-head">
                              <div>
                                <div className="c-budget-title">{item.titlu}</div>
                                <div className="c-budget-sub">{item.sub}</div>
                              </div>
                              <div className="c-budget-ico"><Icon size={15} strokeWidth={1} /></div>
                            </div>
                            <p className="c-budget-desc">{item.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                    <button type="button" className="c-back" onClick={pasulAnterior}>
                      <ChevronLeft size={11} /> Înapoi
                    </button>
                  </div>
                )}

                {pas === 3 && (
                  <div className="c-step" key="p3">
                    <div className="c-eyebrow">Identitate proiect</div>
                    <h2 className="c-title">Cum te <em>contactăm?</em></h2>
                    <form onSubmit={trimiteFormular} className="c-form">
                      <div className="c-field-row">
                        <div className="c-field">
                          <input id="f-nume" className="c-input" type="text" placeholder="x" value={date.nume} onChange={e => setDate(d => ({...d, nume: e.target.value}))} required />
                          <label htmlFor="f-nume" className="c-label">Nume complet</label>
                        </div>
                        <div className="c-field">
                          <input id="f-tel" className="c-input" type="tel" placeholder="x" value={date.telefon} onChange={e => setDate(d => ({...d, telefon: e.target.value}))} required />
                          <label htmlFor="f-tel" className="c-label">Telefon</label>
                        </div>
                      </div>
                      <div className="c-field">
                        <input id="f-email" className="c-input" type="email" placeholder="x" value={date.email} onChange={e => setDate(d => ({...d, email: e.target.value}))} required />
                        <label htmlFor="f-email" className="c-label">Adresă email</label>
                      </div>
                      <div className="c-field">
                        <textarea id="f-det" className="c-textarea" placeholder="x" value={date.detalii} onChange={e => setDate(d => ({...d, detalii: e.target.value}))} />
                        <label htmlFor="f-det" className="c-label">Detalii proiect (opțional)</label>
                      </div>
                      <div className="c-cta-row">
                        <button type="submit" className="c-btn-submit">
                          <span>Trimite conceptul</span>
                          <div className="c-btn-arrow" />
                        </button>
                        <div className="c-cta-note">Răspuns în<br />max. 24 ore</div>
                      </div>
                    </form>
                    <button type="button" className="c-back" onClick={pasulAnterior}>
                      <ChevronLeft size={11} /> Înapoi
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <WhatsAppWidget />
      <Footer />
    </>
  );
}