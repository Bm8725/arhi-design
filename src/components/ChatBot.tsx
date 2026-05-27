"use client";

import { useState, useEffect, useRef } from 'react';
import { Send, X, ArrowUpRight } from 'lucide-react';

interface Mesaj {
  id: number;
  tip: 'asistent' | 'utilizator';
  text: string;
}

const intrebari = [
  "Încântat. Care este adresa ta de email?",
  "Lasă-ne și un număr de telefon pentru ședința video:",
  "Descrie viziunea ta — rezidențial, comercial, stil, locație:",
  "Datele au fost arhivate. Un arhitect te contactează în 24h.",
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [pas, setPas] = useState(0);
  const [input, setInput] = useState('');
  const [submis, setSubmis] = useState(false);
  const [date, setDate] = useState({ nume: '', email: '', telefon: '', viziune: '' });
  const [typing, setTyping] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mesaje, setMesaje] = useState<Mesaj[]>([
    { id: 1, tip: 'asistent', text: 'Bună ziua. Sunt asistentul Arhi.Design. Cum vă numiți?' }
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open, mesaje]);

  const handleTrimite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const txt = input;
    setInput('');
    const next: Mesaj[] = [...mesaje, { id: Date.now(), tip: 'utilizator', text: txt }];
    setMesaje(next);
    let d = { ...date };
    if (pas === 0) d.nume = txt;
    if (pas === 1) d.email = txt;
    if (pas === 2) d.telefon = txt;
    if (pas === 3) d.viziune = txt;
    setDate(d);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMesaje(prev => [...prev, { id: Date.now() + 1, tip: 'asistent', text: intrebari[pas] }]);
      setPas(prev => prev + 1);
    }, 900);
  };

  const progres = Math.min((pas / 4) * 100, 100);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Mono:wght@300;400&display=swap');

        .cb-btn {
          position: fixed; bottom: 28px; right: 28px; z-index: 1000;
          width: 52px; height: 52px;
          background: #0e0b08; border: 1px solid rgba(200,160,60,0.3);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.3s;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .cb-btn:hover { border-color: rgba(200,160,60,0.7); background: #1a1510; }
        .cb-btn-ring {
          position: absolute; inset: -6px;
          border: 1px solid rgba(200,160,60,0.15);
          animation: cbring 3s ease infinite;
        }
        @keyframes cbring { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(1.05)} }
        .cb-btn-dot {
          position: absolute; top: 9px; right: 9px;
          width: 6px; height: 6px; border-radius: 50%;
          background: #c8a03c;
          box-shadow: 0 0 8px rgba(200,160,60,0.6);
          animation: cbdot 2s ease infinite;
        }
        @keyframes cbdot { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .cb-panel {
          position: fixed; z-index: 999;
          display: flex; flex-direction: column;
          background: #0a0806;
          transition: opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.16,1,0.3,1);
          overflow: hidden;
        }
        .cb-panel.open {
          opacity: 1; transform: translateY(0) scale(1);
          pointer-events: all;
        }
        .cb-panel.closed {
          opacity: 0; transform: translateY(16px) scale(0.97);
          pointer-events: none;
        }
        @media(max-width:767px) {
          .cb-panel { inset: 0; }
        }
        @media(min-width:768px) {
          .cb-panel {
            bottom: 96px; right: 28px;
            width: 360px; height: 540px;
            border: 1px solid rgba(200,160,60,0.15);
            box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(200,160,60,0.05);
          }
        }

        .cb-header {
          padding: 18px 20px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: space-between;
          background: #0e0b08;
          flex-shrink: 0;
        }
        .cb-header-left { display: flex; align-items: center; gap: 10px; }
        .cb-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px; font-weight: 300; color: #e8dfc8;
          letter-spacing: 0.04em;
        }
        .cb-logo em { font-style: italic; color: #c8a03c; }
        .cb-status {
          display: flex; align-items: center; gap: 5px;
          font-family: 'DM Mono', monospace;
          font-size: 8px; letter-spacing: 0.35em; text-transform: uppercase;
          color: rgba(200,160,60,0.5);
        }
        .cb-status-dot { width: 4px; height: 4px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 6px #4ade80; }
        .cb-close {
          background: none; border: none; cursor: pointer; padding: 4px;
          color: rgba(232,223,200,0.3); transition: color 0.2s;
        }
        .cb-close:hover { color: rgba(232,223,200,0.8); }

        .cb-progress-wrap {
          height: 2px; background: rgba(255,255,255,0.04); flex-shrink: 0;
        }
        .cb-progress {
          height: 100%;
          background: linear-gradient(to right, rgba(200,160,60,0.4), #c8a03c);
          transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 0 0 8px rgba(200,160,60,0.3);
        }

        .cb-messages {
          flex: 1; overflow-y: auto; padding: 20px 16px;
          display: flex; flex-direction: column; gap: 12px;
          scrollbar-width: none;
        }
        .cb-messages::-webkit-scrollbar { display: none; }

        .cb-msg { display: flex; align-items: flex-end; gap: 8px; max-width: 88%; }
        .cb-msg.user { margin-left: auto; flex-direction: row-reverse; }

        .cb-avatar {
          width: 22px; height: 22px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Mono', monospace; font-size: 8px;
          border: 1px solid rgba(200,160,60,0.25);
          color: rgba(200,160,60,0.6);
          background: rgba(200,160,60,0.05);
        }
        .cb-msg.user .cb-avatar {
          background: rgba(232,223,200,0.08);
          border-color: rgba(232,223,200,0.15);
          color: rgba(232,223,200,0.4);
        }

        .cb-bubble {
          padding: 10px 14px;
          font-family: 'DM Mono', monospace;
          font-size: 11px; line-height: 1.7; font-weight: 300;
          animation: cbfadein 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes cbfadein { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .cb-bubble.asistent {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          color: rgba(232,223,200,0.8);
        }
        .cb-bubble.utilizator {
          background: rgba(200,160,60,0.1);
          border: 1px solid rgba(200,160,60,0.2);
          color: rgba(232,223,200,0.9);
        }

        .cb-typing {
          display: flex; align-items: center; gap: 4px;
          padding: 12px 16px;
          animation: cbfadein 0.3s ease;
        }
        .cb-typing span {
          width: 4px; height: 4px; border-radius: 50%;
          background: rgba(200,160,60,0.5);
          animation: cbtype 1.2s ease infinite;
        }
        .cb-typing span:nth-child(2) { animation-delay: 0.2s; }
        .cb-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes cbtype { 0%,60%,100%{transform:translateY(0);opacity:0.3} 30%{transform:translateY(-4px);opacity:1} }

        .cb-footer {
          padding: 14px 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
          background: #0e0b08; flex-shrink: 0;
        }
        .cb-form { display: flex; gap: 8px; align-items: center; }
        .cb-input {
          flex: 1; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 11px 14px;
          font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 300;
          color: #e8dfc8; outline: none;
          transition: border-color 0.2s;
          caret-color: #c8a03c;
        }
        .cb-input::placeholder { color: rgba(232,223,200,0.2); }
        .cb-input:focus { border-color: rgba(200,160,60,0.35); }
        .cb-send {
          width: 40px; height: 40px;
          background: rgba(200,160,60,0.15);
          border: 1px solid rgba(200,160,60,0.3);
          color: rgba(200,160,60,0.8);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s; flex-shrink: 0;
        }
        .cb-send:hover { background: rgba(200,160,60,0.25); border-color: rgba(200,160,60,0.6); color: #c8a03c; }

        .cb-success {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 16px; padding: 32px;
          animation: cbfadein 0.5s ease;
        }
        .cb-success-ring {
          width: 56px; height: 56px;
          border: 1px solid rgba(200,160,60,0.35);
          display: flex; align-items: center; justify-content: center;
          color: rgba(200,160,60,0.7);
          box-shadow: 0 0 30px rgba(200,160,60,0.08);
        }
        .cb-success-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px; font-weight: 300; color: #e8dfc8;
          font-style: italic; text-align: center;
        }
        .cb-success-sub {
          font-family: 'DM Mono', monospace;
          font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase;
          color: rgba(232,223,200,0.25); text-align: center; line-height: 1.8;
        }
        .cb-success-close {
          background: none; border: 1px solid rgba(200,160,60,0.2);
          color: rgba(200,160,60,0.6); cursor: pointer;
          font-family: 'DM Mono', monospace;
          font-size: 8px; letter-spacing: 0.35em; text-transform: uppercase;
          padding: 10px 20px; margin-top: 8px;
          transition: all 0.2s;
        }
        .cb-success-close:hover { border-color: rgba(200,160,60,0.5); color: rgba(200,160,60,0.9); }

        .cb-submit-btn {
          width: 100%; background: rgba(200,160,60,0.1);
          border: 1px solid rgba(200,160,60,0.3);
          color: rgba(200,160,60,0.85); padding: 13px;
          font-family: 'DM Mono', monospace;
          font-size: 9px; letter-spacing: 0.38em; text-transform: uppercase;
          cursor: pointer; transition: all 0.25s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .cb-submit-btn:hover { background: rgba(200,160,60,0.18); border-color: rgba(200,160,60,0.6); }

        .cb-step-hint {
          font-family: 'DM Mono', monospace;
          font-size: 8px; letter-spacing: 0.3em; text-transform: uppercase;
          color: rgba(200,160,60,0.3); text-align: center; padding: 0 0 10px;
        }
      `}</style>

      {/* BUTON FLOATING */}
      {!open && (
        <button className="cb-btn" onClick={() => setOpen(true)}>
          <div className="cb-btn-ring" />
          <div className="cb-btn-dot" />
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="rgba(200,160,60,0.8)" strokeWidth="1.5">
            <path d="M2 3h14v10H9.5L5 16v-3H2V3z"/>
          </svg>
        </button>
      )}

      {/* PANEL */}
      <div className={`cb-panel ${open ? 'open' : 'closed'}`}>

        {/* HEADER */}
        <div className="cb-header">
          <div className="cb-header-left">
            <div className="cb-logo">Arhi<em>.Design</em></div>
            <div className="cb-status">
              <div className="cb-status-dot" />
              <span>Online</span>
            </div>
          </div>
          <button className="cb-close" onClick={() => setOpen(false)}>
            <X size={15} strokeWidth={1.5} />
          </button>
        </div>

        {/* PROGRESS */}
        <div className="cb-progress-wrap">
          <div className="cb-progress" style={{ width: `${progres}%` }} />
        </div>

        {/* MESAJE */}
        {submis ? (
          <div className="cb-success">
            <div className="cb-success-ring">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="11" cy="11" r="10"/><path d="M7 11l3 3 5-5"/>
              </svg>
            </div>
            <div className="cb-success-title">Briefing arhivat.</div>
            <p className="cb-success-sub">Un arhitect principal<br />te va contacta în 24h.</p>
            <button className="cb-success-close" onClick={() => setOpen(false)}>Închide</button>
          </div>
        ) : (
          <>
            <div className="cb-messages">
              {mesaje.map(msg => (
                <div key={msg.id} className={`cb-msg ${msg.tip}`}>
                  <div className="cb-avatar">{msg.tip === 'utilizator' ? 'TU' : 'A'}</div>
                  <div className={`cb-bubble ${msg.tip}`}>{msg.text}</div>
                </div>
              ))}
              {typing && (
                <div className="cb-msg">
                  <div className="cb-avatar">A</div>
                  <div className="cb-bubble asistent cb-typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="cb-footer">
              {pas > 3 ? (
                <>
                  <p className="cb-step-hint">Pasul 4 din 4 — gata</p>
                  <button className="cb-submit-btn" onClick={() => setSubmis(true)}>
                    <span>Validează fișa tehnică</span>
                    <ArrowUpRight size={12} strokeWidth={1.5} />
                  </button>
                </>
              ) : (
                <>
                  <p className="cb-step-hint">Pasul {pas + 1} din 4</p>
                  <form className="cb-form" onSubmit={handleTrimite}>
                    <input
                      className="cb-input"
                      type={pas === 1 ? 'email' : pas === 2 ? 'tel' : 'text'}
                      required
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder={
                        pas === 0 ? 'Numele complet...' :
                        pas === 1 ? 'Adresa de email...' :
                        pas === 2 ? 'Număr de telefon...' :
                        'Viziunea proiectului...'
                      }
                      autoFocus
                    />
                    <button type="submit" className="cb-send">
                      <Send size={12} strokeWidth={1.5} />
                    </button>
                  </form>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}