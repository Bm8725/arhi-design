/**
 * wapp widget /page.tsx
 * author : BM
 * date: 22-08-2026
 */
'use client';

import { useState, useEffect } from 'react';
import { X, Send, CheckCheck, ChevronRight, ChevronLeft, Phone } from 'lucide-react';

const WhatsAppIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// Luni-Vineri 9:00-15:00 ora României
function isAvailableNow(): boolean {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;

  const jan = new Date(now.getFullYear(), 0, 1);
  const jul = new Date(now.getFullYear(), 6, 1);
  const stdOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  const isDST = now.getTimezoneOffset() < stdOffset;
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
    name: 'Arh. Bogdan Șotîngeanu',
    role: 'suport clienti',
    specialty: 'Arhitectura, Rezidențial, Consultanță',
    phone: '40743193627',
    avatar: 'BS',
    // Avatar ilustrat generat (nu e o persoană reală) — schimbă seed-ul pentru alt look,
    // sau înlocuiește avatarUrl cu o poză reală urcată de tine dacă preferi.
    avatarUrl: 'https://api.dicebear.com/9.x/personas/svg?seed=Bogdan&backgroundColor=065f46,047857,059669',
    schedule: 'Lun–Vin, 09:00–21:00',
  },
   /* {
    id: 2,
    name: 'assistant manager Sarah',
    role: 'suport clienti',
    specialty: 'Arhitectura  & Rezidențial',
    phone: '40743193627',
    avatar: 'AM',
    // Avatar ilustrat generat (nu e o persoană reală) — schimbă seed-ul pentru alt look,
    // sau înlocuiește avatarUrl cu o poză reală urcată de tine dacă preferi.
    avatarUrl: 'https://api.dicebear.com/9.x/personas/svg?seed=sarah&backgroundColor=065f46,047857,059669',
    schedule: 'Lun–Vin, 09:00–21:00',
  }, */
];

// Linkuri rapide afișate sub mesajul de bun venit — ajustează path-urile la structura ta reală
const quickLinks = [
    { label: 'Despre noi', href: '/noi' },
     { label: 'Shop digital assets', href: '/shop' },
  { label: 'Portofoliu', href: '/portofoliu' },
  { label: 'Politica cookie', href: '/politica-cookie' },
  { label: 'Confidențialitate', href: '/politica-confidentialitate' },
];

type ChatStep = 'idle' | 'list' | 'chat' | 'redirect';

// Sunet scurt tip "pop", generat direct (fără fișier audio extern).
// freq mai mare = mesaj trimis, mai joasă = reply primit.
function playPop(freq: number) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
    osc.onended = () => ctx.close();
  } catch (_) {
    // audio poate fi blocat de browser înainte de interacțiune — ignorăm silențios
  }
}

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

  // Blochează scroll-ul paginii când fereastra de chat e deschisă pe mobil (full-screen acolo)
  useEffect(() => {
    const isOpenNow = step !== 'idle';
    if (isOpenNow && window.innerWidth < 640) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [step]);

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
    playPop(700); // sunet trimitere — ton mai înalt

    setTimeout(() => {
      setShowTyping(false);
      setShowReply(true);
      playPop(480); // sunet reply — ton mai jos
    }, 2800);
  };

  const handleBack = () => {
    setStep('list');
    setShowTyping(false);
    setShowReply(false);
    setSentMessage('');
    setUserMessage('');
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

      {/* animații fundal + puls + apariție mesaje, definite o singură dată */}
      <style jsx>{`
        @keyframes wa-bg-drift {
          0%, 100% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
        }
        @keyframes wa-pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.45); }
          70% { box-shadow: 0 0 0 12px rgba(16,185,129,0); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }
        .wa-animated-bg {
          background-color: #efe7db;
          background-image:
            radial-gradient(circle at 20% 20%, rgba(37,211,102,0.10) 0%, transparent 40%),
            radial-gradient(circle at 80% 30%, rgba(226,179,110,0.10) 0%, transparent 40%),
            radial-gradient(circle at 40% 80%, rgba(37,211,102,0.08) 0%, transparent 45%),
            radial-gradient(circle at 85% 85%, rgba(226,179,110,0.08) 0%, transparent 40%);
          background-size: 200% 200%;
          animation: wa-bg-drift 18s ease-in-out infinite;
        }
        .wa-pulse {
          animation: wa-pulse-ring 2.4s ease-out infinite;
        }

        /* apariție fluidă a mesajelor — fade + slide up, nu instant */
        @keyframes wa-msg-in {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .wa-msg-anim {
          animation: wa-msg-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        /* morph animat între iconițele butonului plutitor (WhatsApp ↔ X) */
        .wa-fab-icon-wrap {
          position: relative;
          width: 20px;
          height: 20px;
        }
        .wa-fab-icon {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
        }
        .wa-fab-icon.hidden-icon {
          opacity: 0;
          transform: rotate(-90deg) scale(0.4);
        }
        .wa-fab-icon.visible-icon {
          opacity: 1;
          transform: rotate(0deg) scale(1);
        }
      `}</style>

      {/* BUBBLE */}
      {showBubble && !isOpen && (
        <div className="relative bg-white/95 backdrop-blur-xl border border-black/10 rounded-2xl rounded-br-none px-4 py-3 max-w-[200px] shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
          <button
            onClick={() => setShowBubble(false)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-neutral-100 border border-black/10 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            <X size={10} />
          </button>
         <p className="text-sm text-neutral-700 leading-relaxed">Salutare! 💬 👋 </p>
<p className="text-xs text-neutral-500 mt-0.5">🫡 Răspundem rapid pe WhatsApp de luni până vineri, 09:00–21:00</p>
        </div>
      )}

      {/* Overlay întunecat în spatele ferestrei, doar pe mobil (unde fereastra e full-screen) */}
      <div
        onClick={handleClose}
        className={`sm:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* FEREASTRA CHAT — temă deschisă crem/alb, stil WhatsApp
          Mobil: chiar full-screen (fără gutter, fără colțuri rotunjite).
          Desktop (sm+): fereastră flotantă clasică. */}
      <div className={`
        fixed inset-0 rounded-none
        sm:absolute sm:inset-auto sm:bottom-16 sm:right-0 sm:top-auto
        sm:w-[380px] sm:rounded-2xl
        w-auto
        max-h-none sm:max-h-[560px]
        bg-white border-0 sm:border sm:border-black/10 overflow-hidden
        shadow-[0_20px_60px_rgba(0,0,0,0.25)]
        transition-[opacity,transform] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-right
        flex flex-col
        z-50
        pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] sm:pt-0 sm:pb-0
        ${isOpen ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-4 scale-[0.97] pointer-events-none'}
      `}>

        {/* HEADER — rămâne verde WhatsApp, contrastează cu restul crem/alb */}
        <div className="bg-[#075E54] px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {(step === 'chat' || step === 'redirect') && (
              <button
                onClick={handleBack}
                className="p-1 -ml-1 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors shrink-0"
                aria-label="Înapoi"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-white/15 overflow-hidden shrink-0 flex items-center justify-center text-white">
              {step === 'list'
                ? <WhatsAppIcon size={16} />
                : <img src={selectedArchitect.avatarUrl} alt={selectedArchitect.name} className="w-full h-full object-cover" />
              }
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-white tracking-wide truncate">
                {step === 'list' ? 'Alege un consultant' : selectedArchitect.name}
              </p>
              <p className="text-[9px] text-emerald-100/80 mt-0.5 truncate">
                {step === 'list' ? 'Proarh.4d Studio' : selectedArchitect.specialty}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {(step === 'chat' || step === 'redirect') && (
              <a
                href={`tel:+${selectedArchitect.phone}`}
                className="p-1.5 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors"
                aria-label="Sună acum"
                title="Sună acum"
              >
                <Phone size={15} />
              </a>
            )}
            <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* STEP: LISTA ARHITECTI */}
        {step === 'list' && (
          <div className="wa-animated-bg p-3 flex flex-col gap-2 overflow-y-auto flex-1">
            <p className="text-[10px] text-neutral-500 px-1 pb-1 uppercase tracking-widest">Echipa noastră</p>
            {architects.map((arch) => (
              <button
                key={arch.id}
                onClick={() => handleSelectArchitect(arch)}
                className="w-full flex items-center gap-3 bg-white hover:bg-neutral-50 border border-black/5 hover:border-emerald-500/30 rounded-xl px-3 py-3 transition-all group text-left shadow-sm"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-500/25 overflow-hidden">
                    <img src={arch.avatarUrl} alt={arch.name} className="w-full h-full object-cover" />
                  </div>
                  {available && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white wa-pulse" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-neutral-800 truncate">{arch.name}</p>
                  <p className="text-[10px] text-neutral-500 truncate">{arch.role}</p>
                  <p className="text-[9px] mt-0.5">
                    {available
                      ? <span className="text-emerald-600 font-medium">● Disponibil acum</span>
                      : <span className="text-neutral-400">● {arch.schedule}</span>
                    }
                  </p>
                </div>
                <ChevronRight size={14} className="text-neutral-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* STEP: CHAT */}
        {(step === 'chat' || step === 'redirect') && (
          <>
            <div
              className="wa-animated-bg px-4 py-3 flex flex-col gap-3 overflow-y-auto flex-1"
              style={{ minHeight: '180px' }}
            >
              {/* Mesaj bun venit */}
              <div className="wa-msg-anim self-start max-w-[85%]">
                <div className="bg-white rounded-2xl rounded-tl-none px-3 py-2 shadow-sm">
                  <p className="text-[17px] text-neutral-700 leading-relaxed">
                    Bună! 👋 Sunt {selectedArchitect.name.replace('Arh. ', '')}. Cu ce va putem ajuta?
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[9px] text-neutral-400">Acum</span>
                    <CheckCheck size={10} className="text-emerald-500" />
                  </div>
                </div>
              </div>

              {/* Linkuri rapide — portofoliu, cookie, confidențialitate */}
              <div
                className="wa-msg-anim self-start max-w-[85%] flex flex-wrap gap-1.5"
                style={{ animationDelay: '120ms' }}
              >
                {quickLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-[10px] bg-white hover:bg-emerald-50 border border-black/10 hover:border-emerald-500/30 text-neutral-600 hover:text-emerald-700 rounded-full px-3 py-1.5 transition-colors shadow-sm"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              {/* Mesajul trimis — verde deschis WhatsApp clasic */}
              {sentMessage !== '' && (
                <div className="wa-msg-anim self-end max-w-[85%]">
                  <div className="bg-[#dcf8c6] rounded-2xl rounded-tr-none px-3 py-2 shadow-sm">
                    <p className="text-[17px] text-neutral-800 leading-relaxed">{sentMessage}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[9px] text-neutral-500">Acum</span>
                      <CheckCheck size={10} className="text-emerald-600" />
                    </div>
                  </div>
                </div>
              )}

              {/* Typing */}
              {showTyping && (
                <div className="wa-msg-anim self-start">
                  <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {/* Reply + buton */}
              {showReply && (
                <div className="wa-msg-anim self-start max-w-[85%] flex flex-col gap-2">
                  <div className="bg-white rounded-2xl rounded-tl-none px-3 py-2 shadow-sm">
                    <p className="text-[17px] text-neutral-700 leading-relaxed">
                      Mulțumesc pentru mesaj ! 🙏 Am preluat mesajul dvs si daca doriti putem continua discutia pe whatsApp, sau ne putei apela telefonic! 👇👇👇
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[9px] text-neutral-400">Acum</span>
                      <CheckCheck size={10} className="text-emerald-500" />
                    </div>
                  </div>
                  <button
                    onClick={handleOpenWhatsApp}
                    className="wa-msg-anim flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[17px] font-semibold py-2.5 px-4 rounded-xl transition-all active:scale-95 shadow-[0_4px_15px_rgba(16,185,129,0.3)]"
                    style={{ animationDelay: '140ms' }}
                  >
                    <WhatsAppIcon size={14} />
                    Deschide WhatsApp
                  </button>
                  <a
                    href={`tel:+${selectedArchitect.phone}`}
                    className="wa-msg-anim flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 border border-black/10 text-white text-[17px] font-semibold py-2.5 px-4 rounded-xl transition-all active:scale-95 shadow-sm"
                    style={{ animationDelay: '220ms' }}
                  >
                    <Phone size={13} />
                    Sună acum
                  </a>
                </div>
              )}
            </div>

            {/* INPUT */}
            {step === 'chat' && (
              <form onSubmit={handleSendMessage} className="px-3 py-2.5 bg-neutral-50 border-t border-black/5 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Scrie un mesaj..."
                  autoFocus
                  className="flex-1 min-w-0 bg-white border border-black/10 rounded-full px-4 py-2 text-[17px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-emerald-500/50 transition-colors"
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
              <div className="px-3 py-2.5 bg-neutral-50 border-t border-black/5 flex items-center justify-center shrink-0">
                <p className="text-[10px] text-neutral-500 flex items-center gap-1.5">
                  <WhatsAppIcon size={10} /> Contact support 
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
        className={`w-11 h-11 rounded-xl flex items-center justify-center relative transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-90 shadow-xl border shrink-0 z-50 ${
          isOpen
            ? 'bg-white border-black/10 text-emerald-600'
            : 'bg-gradient-to-tr from-emerald-600 to-green-500 border-emerald-400/20 text-white hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-105 wa-pulse'
        }`}
      >
        {isOpen ? <X size={18} strokeWidth={1.5} /> : <WhatsAppIcon size={20} />}
      </button>

    </div>
  );
}