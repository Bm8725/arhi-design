/**
 * components/WhatsAppWidget.tsx
 * Widget de contact WhatsApp – PROARH.4D (PROIECTEARH 4D S.R.L.)
 *
 * Ce s-a schimbat față de versiunea veche:
 *  - mesajele nu mai afirmă „am preluat mesajul” (nimic nu pleacă până nu apeși Trimite în WhatsApp)
 *  - program într-o singură constantă (OPEN/CLOSE), calculat pe fusul Europe/Bucharest
 *  - fără avatar de la terți (nu se mai trimite IP-ul către dicebear) – inițiale locale
 *  - notă GDPR înainte de deschiderea WhatsApp
 *  - topicuri rapide, ora reală a mesajului, mesaj diferit în afara programului
 *  - Escape închide, focus gestionat, aria-*, fără elemente focusabile când e închis
 *  - sunet dezactivat implicit (buton de pornire în header)
 *  - bula se închide pentru sesiune (sessionStorage, cheia 'wa-widget-state')
 *  - peste bannerul de cookie când chatul e deschis
 */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { X, Send, CheckCheck, ChevronRight, ChevronLeft, Phone, Volume2, VolumeX } from 'lucide-react';

/* ============ SETĂRI ============ */
const OPEN = 9;   // ora de deschidere (România)
const CLOSE = 21; // ora de închidere (România)
const SCHEDULE_LABEL = `Lun–Vin, ${String(OPEN).padStart(2, '0')}:00–${CLOSE}:00`;
const STORAGE_KEY = 'wa-widget-state';
const MAX_LEN = 500;

const architects = [
  {
    id: 1,
    name: 'Arh. Bogdan Șotîngeanu',
    role: 'Suport clienți',
    specialty: 'Arhitectură, Rezidențial, Consultanță',
    phone: '40743193627',
    initials: 'BS',
  },
];

const quickLinks = [
  { label: 'Despre noi', href: '/noi' },
  { label: 'Shop digital assets', href: '/shop' },
  { label: 'Portofoliu', href: '/portofoliu' },
  { label: 'Arhi AI', href: '/arhi-chat' },
];

const topics = [
  'Vreau să construiesc o casă nouă',
  'Am nevoie de autorizație de construire',
  'Mă interesează analiza nZEB',
  'Întrebare despre modelele 3D din shop',
];

const defaultText = 'Bună ziua, sunt interesat de serviciile dvs. și aș dori mai multe detalii.';

type Architect = (typeof architects)[number];
type ChatStep = 'idle' | 'list' | 'chat' | 'redirect';

/* ============ UTILE ============ */
function isAvailableNow(): boolean {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Bucharest',
      weekday: 'short',
      hour: 'numeric',
      hour12: false,
    }).formatToParts(new Date());
    const day = parts.find((p) => p.type === 'weekday')?.value ?? '';
    const hour = Number(parts.find((p) => p.type === 'hour')?.value) % 24;
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(day) && hour >= OPEN && hour < CLOSE;
  } catch {
    return false;
  }
}

function nowLabel(): string {
  return new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
}

function formatPhone(p: string): string {
  return `+${p.slice(0, 2)} ${p.slice(2, 5)} ${p.slice(5, 8)} ${p.slice(8)}`;
}

function playPop(freq: number) {
  try {
    const w = window as unknown as { webkitAudioContext?: typeof AudioContext };
    const AudioCtx = window.AudioContext || w.webkitAudioContext;
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
  } catch {
    /* sunetul e opțional */
  }
}

const WhatsAppIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const Avatar = ({ initials, size = 40 }: { initials: string; size?: number }) => (
  <div
    style={{ width: size, height: size }}
    className="rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-semibold shrink-0 select-none"
    aria-hidden="true"
  >
    <span style={{ fontSize: Math.round(size * 0.36) }}>{initials}</span>
  </div>
);

/* ============ COMPONENTA ============ */
export default function WhatsAppWidget() {
  const [step, setStep] = useState<ChatStep>('idle');
  const [showBubble, setShowBubble] = useState(false);
  const [available, setAvailable] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [sentMessage, setSentMessage] = useState('');
  const [sentTime, setSentTime] = useState('');
  const [showTyping, setShowTyping] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [selectedArchitect, setSelectedArchitect] = useState<Architect>(architects[0]);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const fabRef = useRef<HTMLButtonElement>(null);
  const multiple = architects.length > 1;
  const isOpen = step !== 'idle';

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // Disponibilitate (după montare, ca să nu apară diferențe la hidratare)
  useEffect(() => {
    const update = () => setAvailable(isAvailableNow());
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  // Bula de întâmpinare, o dată pe sesiune
  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(STORAGE_KEY) === 'bubble-dismissed';
    } catch {
      /* storage indisponibil */
    }
    if (dismissed) return;
    const t = setTimeout(() => setShowBubble(true), 3500);
    return () => clearTimeout(t);
  }, []);

  const dismissBubble = () => {
    setShowBubble(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, 'bubble-dismissed');
    } catch {
      /* storage indisponibil */
    }
  };

  // Blochează scroll-ul paginii când chatul e full-screen pe mobil
  useEffect(() => {
    if (isOpen && window.innerWidth < 640) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    clearTimers();
    setStep('idle');
    setShowTyping(false);
    setShowReply(false);
    setSentMessage('');
    setUserMessage('');
    fabRef.current?.focus();
  }, []);

  // Escape închide
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, handleClose]);

  useEffect(() => () => clearTimers(), []);

  const openWidget = () => {
    dismissBubble();
    setSelectedArchitect(architects[0]);
    setStep(multiple ? 'list' : 'chat');
  };

  const handleSelectArchitect = (arch: Architect) => {
    setSelectedArchitect(arch);
    setStep('chat');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = userMessage.trim() !== '' ? userMessage.trim() : defaultText;
    setSentMessage(text);
    setSentTime(nowLabel());
    setUserMessage('');
    setStep('redirect');
    setShowTyping(true);
    if (soundOn) playPop(700);

    clearTimers();
    timers.current.push(
      setTimeout(() => {
        setShowTyping(false);
        setShowReply(true);
        if (soundOn) playPop(480);
      }, 1400)
    );
  };

  const handleBack = () => {
    clearTimers();
    setShowTyping(false);
    setShowReply(false);
    if (step === 'redirect') {
      setUserMessage(sentMessage); // poate edita mesajul
      setSentMessage('');
      setStep('chat');
    } else if (multiple) {
      setStep('list');
    }
  };

  const handleOpenWhatsApp = () => {
    const page = typeof window !== 'undefined' ? window.location.pathname : '';
    const body = `${sentMessage || defaultText}\n\n(Pagina: ${page})`;
    window.open(
      `https://wa.me/${selectedArchitect.phone}?text=${encodeURIComponent(body)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const showBack = step === 'redirect' || (step === 'chat' && multiple);

  return (
    <div
      className={`fixed bottom-36 md:bottom-12 right-5 font-sans flex flex-col items-end gap-3 ${
        isOpen ? 'z-[10000]' : 'z-50'
      }`}
    >
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
        @keyframes wa-msg-in {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
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
        .wa-pulse { animation: wa-pulse-ring 2.4s ease-out infinite; }
        .wa-msg-anim { animation: wa-msg-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .wa-animated-bg, .wa-pulse, .wa-msg-anim { animation: none; }
        }
      `}</style>

      {/* BULA DE ÎNTÂMPINARE */}
      {showBubble && !isOpen && (
        <div className="relative bg-white/95 backdrop-blur-xl border border-black/10 rounded-2xl rounded-br-none shadow-[0_10px_30px_rgba(0,0,0,0.18)] max-w-[230px]">
          <button
            onClick={openWidget}
            className="block w-full text-left px-4 py-3 rounded-2xl rounded-br-none"
            aria-label="Deschide conversația WhatsApp"
          >
            <p className="text-sm text-neutral-800 font-medium leading-snug">Salutare! 👋 Vă putem ajuta?</p>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              {available
                ? 'Suntem online. Scrieți-ne pe WhatsApp.'
                : `Răspundem pe WhatsApp ${SCHEDULE_LABEL}.`}
            </p>
          </button>
          <button
            onClick={dismissBubble}
            className="absolute -top-2 -right-2 w-6 h-6 bg-neutral-100 border border-black/10 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors"
            aria-label="Închide mesajul"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Overlay doar pe mobil */}
      <div
        onClick={handleClose}
        aria-hidden="true"
        className={`sm:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* FEREASTRA CHAT */}
      <div
        id="wa-chat-window"
        role="dialog"
        aria-label="Conversație WhatsApp"
        aria-hidden={!isOpen}
        className={`
          fixed inset-0 rounded-none
          sm:absolute sm:inset-auto sm:bottom-16 sm:right-0 sm:top-auto
          sm:w-[380px] sm:rounded-2xl
          w-auto max-h-none sm:max-h-[580px]
          bg-white border-0 sm:border sm:border-black/10 overflow-hidden
          shadow-[0_20px_60px_rgba(0,0,0,0.25)]
          transition-[opacity,transform,visibility] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-right
          flex flex-col z-50
          pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] sm:pt-0 sm:pb-0
          ${isOpen
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto visible'
            : 'opacity-0 translate-y-4 scale-[0.97] pointer-events-none invisible'}
        `}
      >
        {/* HEADER */}
        <div className="bg-[#075E54] px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {showBack && (
              <button
                onClick={handleBack}
                className="p-1 -ml-1 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors shrink-0"
                aria-label="Înapoi"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div className="w-9 h-9 rounded-full bg-white/15 shrink-0 flex items-center justify-center text-white overflow-hidden">
              {step === 'list' ? (
                <WhatsAppIcon size={18} />
              ) : (
                <Avatar initials={selectedArchitect.initials} size={36} />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {step === 'list' ? 'Alegeți un consultant' : selectedArchitect.name}
              </p>
              <p className="text-[11px] text-emerald-100/90 mt-0.5 truncate">
                {step === 'list'
                  ? 'PROARH.4D Studio'
                  : available
                  ? '● Online acum'
                  : `Program: ${SCHEDULE_LABEL}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {(step === 'chat' || step === 'redirect') && (
              <>
                <button
                  onClick={() => setSoundOn((s) => !s)}
                  className="p-1.5 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors"
                  aria-label={soundOn ? 'Oprește sunetul' : 'Pornește sunetul'}
                  aria-pressed={soundOn}
                  title={soundOn ? 'Sunet pornit' : 'Sunet oprit'}
                >
                  {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
                </button>
                <a
                  href={`tel:+${selectedArchitect.phone}`}
                  className="p-1.5 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors"
                  aria-label={`Sună la ${formatPhone(selectedArchitect.phone)}`}
                  title="Sună"
                >
                  <Phone size={15} />
                </a>
              </>
            )}
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors"
              aria-label="Închide fereastra"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* LISTA CONSULTANȚI (apare doar dacă există mai mulți) */}
        {step === 'list' && (
          <div className="wa-animated-bg p-3 flex flex-col gap-2 overflow-y-auto flex-1">
            <p className="text-[11px] text-neutral-500 px-1 pb-1 uppercase tracking-widest">Echipa noastră</p>
            {architects.map((arch) => (
              <button
                key={arch.id}
                onClick={() => handleSelectArchitect(arch)}
                className="w-full flex items-center gap-3 bg-white hover:bg-neutral-50 border border-black/5 hover:border-emerald-500/30 rounded-xl px-3 py-3 transition-all group text-left shadow-sm"
              >
                <div className="relative flex-shrink-0">
                  <Avatar initials={arch.initials} size={40} />
                  {available && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white wa-pulse" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-800 truncate">{arch.name}</p>
                  <p className="text-xs text-neutral-500 truncate">{arch.role}</p>
                  <p className="text-[11px] mt-0.5">
                    {available ? (
                      <span className="text-emerald-600 font-medium">● Disponibil acum</span>
                    ) : (
                      <span className="text-neutral-500">● {SCHEDULE_LABEL}</span>
                    )}
                  </p>
                </div>
                <ChevronRight size={14} className="text-neutral-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* CHAT */}
        {(step === 'chat' || step === 'redirect') && (
          <>
            <div className="wa-animated-bg px-4 py-3 flex flex-col gap-3 overflow-y-auto flex-1" style={{ minHeight: 200 }}>
              {/* Bun venit, în funcție de program */}
              <div className="wa-msg-anim self-start max-w-[88%]">
                <div className="bg-white rounded-2xl rounded-tl-none px-3 py-2 shadow-sm">
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    Bună! 👋 Sunt {selectedArchitect.name.replace('Arh. ', '')}.{' '}
                    {available
                      ? 'Cu ce vă putem ajuta?'
                      : `Momentan suntem offline (${SCHEDULE_LABEL}). Lăsați-ne mesajul și vă răspundem în următoarea zi lucrătoare.`}
                  </p>
                </div>
              </div>

              {/* Topicuri rapide */}
              {step === 'chat' && (
                <div className="wa-msg-anim self-start max-w-[92%] flex flex-wrap gap-1.5" style={{ animationDelay: '100ms' }}>
                  {topics.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setUserMessage(t)}
                      className="text-xs bg-white hover:bg-emerald-50 border border-emerald-600/25 hover:border-emerald-600/50 text-emerald-800 rounded-full px-3 py-1.5 transition-colors shadow-sm text-left"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}

              {/* Linkuri rapide */}
              {step === 'chat' && (
                <div className="wa-msg-anim self-start max-w-[92%]" style={{ animationDelay: '180ms' }}>
                  <p className="text-[11px] text-neutral-500 mb-1 ml-1">Sau vizitați:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {quickLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={handleClose}
                        className="text-xs bg-white/80 hover:bg-white border border-black/10 text-neutral-600 hover:text-neutral-900 rounded-full px-3 py-1.5 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Mesajul scris de utilizator */}
              {sentMessage !== '' && (
                <div className="wa-msg-anim self-end max-w-[88%]">
                  <div className="bg-[#dcf8c6] rounded-2xl rounded-tr-none px-3 py-2 shadow-sm">
                    <p className="text-sm text-neutral-800 leading-relaxed break-words">{sentMessage}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[11px] text-neutral-500">{sentTime}</span>
                      <CheckCheck size={12} className="text-neutral-400" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              )}

              {showTyping && (
                <div className="wa-msg-anim self-start" aria-live="polite">
                  <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 shadow-sm">
                    <span className="sr-only">Se pregătește răspunsul</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce motion-reduce:animate-none" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce motion-reduce:animate-none" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce motion-reduce:animate-none" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {/* Mesaj automat + acțiuni (onest: mesajul nu a fost încă trimis) */}
              {showReply && (
                <div className="wa-msg-anim self-start max-w-[92%] flex flex-col gap-2" aria-live="polite">
                  <div className="bg-white rounded-2xl rounded-tl-none px-3 py-2 shadow-sm">
                    <p className="text-[11px] uppercase tracking-wider text-neutral-400 mb-1">Mesaj automat</p>
                    <p className="text-sm text-neutral-700 leading-relaxed">
                      Mesajul dvs. <strong>nu a fost încă trimis</strong>. Apăsați{' '}
                      <em>Deschide WhatsApp</em> și trimiteți-l din aplicație. Ne puteți și suna direct. 👇
                    </p>
                  </div>

                  <button
                    onClick={handleOpenWhatsApp}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold py-3 px-4 rounded-xl transition-all active:scale-95 shadow-[0_4px_15px_rgba(16,185,129,0.3)]"
                  >
                    <WhatsAppIcon size={16} />
                    Deschide WhatsApp
                  </button>
                  <a
                    href={`tel:+${selectedArchitect.phone}`}
                    className="flex items-center justify-center gap-2 bg-white hover:bg-neutral-50 border border-black/15 text-neutral-800 text-sm font-semibold py-3 px-4 rounded-xl transition-all active:scale-95 shadow-sm"
                  >
                    <Phone size={15} />
                    Sună {formatPhone(selectedArchitect.phone)}
                  </a>

                  <p className="text-[11px] text-neutral-500 leading-relaxed px-1">
                    Conversația continuă pe WhatsApp (Meta). Mesajul și datele dvs. de contact sunt
                    prelucrate de PROIECTEARH 4D S.R.L. pentru a vă răspunde, conform{' '}
                    <Link
                      href="/politica-confidentialitate"
                      onClick={handleClose}
                      className="underline underline-offset-2 hover:text-neutral-800"
                    >
                      Politicii de confidențialitate
                    </Link>
                    .
                  </p>
                </div>
              )}
            </div>

            {/* INPUT */}
            {step === 'chat' && (
              <form onSubmit={handleSendMessage} className="px-3 py-2.5 bg-neutral-50 border-t border-black/5 flex items-center gap-2 shrink-0">
                <label htmlFor="wa-input" className="sr-only">Mesajul dvs.</label>
                <input
                  id="wa-input"
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  maxLength={MAX_LEN}
                  placeholder="Scrieți un mesaj..."
                  autoFocus
                  autoComplete="off"
                  className="flex-1 min-w-0 bg-white border border-black/10 rounded-full px-4 py-2.5 text-base sm:text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-emerald-500/60 transition-colors"
                />
                <button
                  type="submit"
                  className="w-10 h-10 bg-emerald-600 text-white rounded-full hover:bg-emerald-500 transition-all active:scale-95 flex items-center justify-center flex-shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700"
                  aria-label="Pregătește mesajul"
                >
                  <Send size={15} />
                </button>
              </form>
            )}

            {step === 'redirect' && (
              <div className="px-3 py-2.5 bg-neutral-50 border-t border-black/5 flex items-center justify-between gap-3 shrink-0">
                <button onClick={handleBack} className="text-xs text-neutral-600 hover:text-neutral-900 underline underline-offset-2">
                  Editează mesajul
                </button>
                <p className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                  <WhatsAppIcon size={11} /> Contact direct
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* BUTON PLUTITOR */}
      <button
        ref={fabRef}
        onClick={() => (isOpen ? handleClose() : openWidget())}
        aria-label={isOpen ? 'Închide chatul WhatsApp' : 'Deschide chatul WhatsApp'}
        aria-expanded={isOpen}
        aria-controls="wa-chat-window"
        className={`w-12 h-12 rounded-xl flex items-center justify-center relative transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-90 shadow-xl border shrink-0 z-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700 ${
          isOpen
            ? 'bg-white border-black/10 text-emerald-600'
            : 'bg-gradient-to-tr from-emerald-600 to-green-500 border-emerald-400/20 text-white hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-105 wa-pulse'
        }`}
      >
        {isOpen ? <X size={20} strokeWidth={1.5} /> : <WhatsAppIcon size={22} />}
      </button>
    </div>
  );
}