'use client';

import { useState, useEffect } from 'react';
import { X, Send, CheckCheck, ChevronRight } from 'lucide-react';

const WhatsAppIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// Luni-Vineri 9:00-15:00 ora României
function isAvailableNow(): boolean {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;

  // Detectează ora de vară: România e UTC+3 vara (ultimul duminică martie - ultimul duminică octombrie), UTC+2 iarna
  const jan = new Date(now.getFullYear(), 0, 1);
  const jul = new Date(now.getFullYear(), 6, 1);
  const stdOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  const isDST = now.getTimezoneOffset() < stdOffset;
  // România: UTC+2 iarna, UTC+3 vara
  const roOffset = isDST ? 3 : 2;

  const ro = new Date(utc + roOffset * 3600000);
  const day = ro.getDay();
  const hour = ro.getHours();
  const isWeekday = day >= 1 && day <= 5;
  const isWorkHour = hour >= 9 && hour < 15;
  return isWeekday && isWorkHour;
}

const architects = [
  {
    id: 1,
    name: 'Alexandru Popescu',
    role: 'suport clienti',
    specialty: 'Design Interior & Rezidențial',
    phone: '40743193627',
    avatar: 'AP',
    schedule: 'Lun–Vin, 09:00–15:00',
  },
];

type ChatStep = 'idle' | 'list' | 'chat' | 'redirect';

export default function WhatsAppWidget() {
  const [step, setStep] = useState<ChatStep>('idle');
  const [showBubble, setShowBubble] = useState(false);
  const [available, setAvailable] = useState(isAvailableNow());

  useEffect(() => {
    const interval = setInterval(() => setAvailable(isAvailableNow()), 60000);
    return () => clearInterval(interval);
  }, []);
  const [userMessage, setUserMessage] = useState('');
  const [sentMessage, setSentMessage] = useState('');
  const [showTyping, setShowTyping] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [selectedArchitect, setSelectedArchitect] = useState(architects[0]);

  const defaultText = 'Bună ziua, sunt interesat de serviciile dvs. și aș dori mai multe detalii.';

  useEffect(() => {
    const t = setTimeout(() => setShowBubble(true), 3500);
    return () => clearTimeout(t);
  }, []);

  const handleSelectArchitect = (arch: typeof architects[0]) => {
    setSelectedArchitect(arch);
    setStep('chat');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = userMessage.trim() !== '' ? userMessage : defaultText;
    setSentMessage(textToSend);
    setUserMessage('');
    setStep('redirect');
    setShowTyping(true);
    setTimeout(() => {
      setShowTyping(false);
      setShowReply(true);
    }, 2800);
  };

  const handleOpenWhatsApp = () => {
    const encodedText = encodeURIComponent(sentMessage || defaultText);
    window.open(`https://wa.me/${selectedArchitect.phone}?text=${encodedText}`, '_blank');
  };

  const handleClose = () => {
    setStep('idle');
    setShowTyping(false);
    setShowReply(false);
    setSentMessage('');
    setUserMessage('');
  };

  const isOpen = step !== 'idle';

  return (
    <div className="fixed bottom-36 md:bottom-12 right-5 z-50 font-sans flex flex-col items-end gap-3">

      {/* BUBBLE */}
      {showBubble && !isOpen && (
        <div className="relative bg-[#0d0d0d]/95 backdrop-blur-xl border border-white/10 rounded-2xl rounded-br-none px-4 py-3 max-w-[200px] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <button
            onClick={() => setShowBubble(false)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-neutral-800 border border-white/10 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <X size={10} />
          </button>
         <p className="text-sm text-neutral-300 leading-relaxed">Salutare! 💬</p>
<p className="text-xs text-neutral-500 mt-0.5">Răspundem rapid pe WhatsApp de luni până vineri, 09:00–15:00</p>
        </div>
      )}

      {/* FEREASTRA CHAT */}
      <div className={`absolute bottom-16 right-0 w-[340px] sm:w-[380px] bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-all duration-400 ease-out origin-bottom-right ${
        isOpen ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-6 scale-95 pointer-events-none'
      }`}>

        {/* HEADER */}
        <div className="bg-[#075E54] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
              <WhatsAppIcon size={16} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white tracking-wide">
                {step === 'list' ? 'Alege un consultant' : selectedArchitect.name}
              </p>
              <p className="text-[9px] text-emerald-200/70 mt-0.5">
                {step === 'list' ? 'Proarh.4d Studio' : selectedArchitect.specialty}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* STEP: LISTA ARHITECTI */}
        {step === 'list' && (
          <div className="p-3 flex flex-col gap-2 bg-[#0d0d0d]">
            <p className="text-[10px] text-neutral-500 px-1 pb-1 uppercase tracking-widest">Echipa noastră</p>
            {architects.map((arch) => (
              <button
                key={arch.id}
                onClick={() => handleSelectArchitect(arch)}
                className="w-full flex items-center gap-3 bg-[#1a1a1a] hover:bg-[#222] border border-white/5 hover:border-emerald-500/20 rounded-xl px-3 py-3 transition-all group text-left"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold">
                    {arch.avatar}
                  </div>
                  {available && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#1a1a1a]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-white truncate">{arch.name}</p>
                  <p className="text-[10px] text-neutral-400 truncate">{arch.role}</p>
                  <p className="text-[9px] mt-0.5">
                    {available
                      ? <span className="text-emerald-400/80">● Disponibil acum</span>
                      : <span className="text-neutral-500">● {arch.schedule}</span>
                    }
                  </p>
                </div>
                <ChevronRight size={14} className="text-neutral-600 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* STEP: CHAT */}
        {(step === 'chat' || step === 'redirect') && (
          <>
            <div
              className="px-4 py-3 flex flex-col gap-3 overflow-y-auto"
              style={{ minHeight: '180px', maxHeight: '220px', background: '#0d0d0d' }}
            >
              {/* Mesaj bun venit */}
              <div className="self-start max-w-[85%]">
                <div className="bg-[#1f2c34] rounded-2xl rounded-tl-none px-3 py-2">
                  <p className="text-[12px] text-neutral-200 leading-relaxed">
                    Bună! 👋 Sunt {selectedArchitect.name.replace('Arh. ', '')}. Cu ce te pot ajuta?
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[9px] text-neutral-500">Acum</span>
                    <CheckCheck size={10} className="text-emerald-400" />
                  </div>
                </div>
              </div>

              {/* Mesajul trimis */}
              {sentMessage !== '' && (
                <div className="self-end max-w-[85%]">
                  <div className="bg-[#005c4b] rounded-2xl rounded-tr-none px-3 py-2">
                    <p className="text-[12px] text-neutral-100 leading-relaxed">{sentMessage}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[9px] text-neutral-400">Acum</span>
                      <CheckCheck size={10} className="text-emerald-400" />
                    </div>
                  </div>
                </div>
              )}

              {/* Typing */}
              {showTyping && (
                <div className="self-start">
                  <div className="bg-[#1f2c34] rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {/* Reply + buton */}
              {showReply && (
                <div className="self-start max-w-[85%] flex flex-col gap-2">
                  <div className="bg-[#1f2c34] rounded-2xl rounded-tl-none px-3 py-2">
                    <p className="text-[12px] text-neutral-200 leading-relaxed">
                      Mulțumesc! 🙏 Continuăm pe WhatsApp.
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[9px] text-neutral-500">Acum</span>
                      <CheckCheck size={10} className="text-emerald-400" />
                    </div>
                  </div>
                  <button
                    onClick={handleOpenWhatsApp}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold py-2.5 px-4 rounded-xl transition-all active:scale-95 shadow-[0_4px_15px_rgba(16,185,129,0.25)]"
                  >
                    <WhatsAppIcon size={14} />
                    Deschide WhatsApp
                  </button>
                </div>
              )}
            </div>

            {/* INPUT */}
            {step === 'chat' && (
              <form onSubmit={handleSendMessage} className="px-3 py-2.5 bg-[#1a1a1a] border-t border-white/5 flex items-center gap-2">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Scrie un mesaj..."
                  autoFocus
                  className="flex-1 bg-[#2a2a2a] border border-white/10 rounded-full px-4 py-2 text-[12px] text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/40 transition-colors"
                />
                <button
                  type="submit"
                  className="w-8 h-8 bg-emerald-500 text-white rounded-full hover:bg-emerald-400 transition-all active:scale-95 flex items-center justify-center flex-shrink-0"
                >
                  <Send size={13} />
                </button>
              </form>
            )}

            {step === 'redirect' && (
              <div className="px-3 py-2.5 bg-[#1a1a1a] border-t border-white/5 flex items-center justify-center">
                <p className="text-[10px] text-neutral-600 flex items-center gap-1.5">
                  <WhatsAppIcon size={10} /> Continuați conversația pe WhatsApp
                </p>
              </div>
            )}
          </>
        )}

      </div>

      {/* BUTON PLUTITOR */}
      <button
        onClick={() => {
          if (!isOpen) { setStep('list'); setShowBubble(false); }
          else handleClose();
        }}
        className={`w-11 h-11 rounded-xl flex items-center justify-center relative transition-all duration-300 active:scale-90 shadow-xl border ${
          isOpen
            ? 'bg-neutral-900 border-white/10 text-amber-500'
            : 'bg-gradient-to-tr from-emerald-600 to-green-500 border-emerald-400/20 text-white hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-105'
        }`}
      >
        {isOpen ? <X size={18} strokeWidth={1.5} /> : <WhatsAppIcon size={20} />}
      </button>

    </div>
  );
}