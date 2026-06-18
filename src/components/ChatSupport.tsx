"use client";

import { useState, useEffect, useRef } from "react";

// ─── CONFIG ────────────────────────────────────────────────────────────────────
const WA_NUMBER = "40700000000"; // <-- numărul tău fără + și spații

// ─── FLOWS ─────────────────────────────────────────────────────────────────────
type Flow = { text: string; quick: string[]; wa?: boolean };

const FLOWS: Record<string, Flow> = {
  servicii: {
    text: "Avem trei direcții principale: 🏠 <strong>Arhitectură rezidențială</strong>, 🪑 <strong>Design interior</strong>, și 📐 <strong>Consultanță tehnică</strong>. Pe care vrei să afli mai multe?",
    quick: ["Arhitectură rezidențială", "Design interior", "Consultanță", "Vreau ofertă"],
  },
  arh: {
    text: "🏗️ Proiectăm case, vile și apartamente — de la concept până la detaliu de execuție. Lucrăm cu materiale nobile și volume clare. Vrei să discutăm proiectul tău direct?",
    quick: ["Da, vreau să discut", "Văd portofoliu", "Alte servicii"],
  },
  arh_discutie: {
    text: "Perfect! Ca să te ajutăm cât mai bine, ar fi util să ne spui pe scurt: ce tip de proiect ai în minte (casă nouă, renovare, amenajare) și în ce zonă? Continuăm pe WhatsApp pentru detalii?",
    quick: ["Da, pe WhatsApp", "Alte servicii"],
  },
  design: {
    text: "🪑 Designul interior la noi înseamnă materiale selecționate, mobilier customizat și o estetică atemporală. Poți trimite câteva poze cu spațiul și discutăm.",
    quick: ["Vreau consultație", "Văd exemple", "Alte servicii"],
  },
  consultanta: {
    text: "📐 Consultanța noastră acoperă: avize, autorizații, verificare proiecte existente și optimizare spații. Rapid și transparent. Continuăm pe WhatsApp?",
    quick: ["Da, pe WhatsApp", "Cât costă?", "Alte servicii"],
  },
  oferta: {
    text: "📋 Pentru o ofertă personalizată am nevoie de câteva detalii: locație, tip proiect și suprafață orientativă. Cel mai ușor le discutăm direct pe WhatsApp.",
    quick: ["Deschide WhatsApp", "Mai am întrebări"],
  },
  pret: {
    text: "💰 Prețurile variază în funcție de complexitate și suprafață. O consultație inițială gratuită de 30 min ne ajută să-ți dăm o estimare corectă. Programăm?",
    quick: ["Programează consultație", "Alte întrebări"],
  },
  portofoliu: {
    text: "🖼️ Portofoliul nostru include proiecte rezidențiale în București, Ilfov și județele limitrofe. Îl găsești complet pe site sau ți-l trimitem pe WhatsApp.",
    quick: ["Trimite pe WhatsApp", "Alte servicii", "Vreau ofertă"],
  },
  wa_redirect: {
    text: "📱 Perfect! Te redirecționăm pe WhatsApp — echipa răspunde de obicei în câteva minute.",
    quick: [],
    wa: true,
  },
  default: {
    text: "Înțeleg! Cel mai bine continuăm discuția direct cu echipa noastră pe WhatsApp, unde îți putem răspunde detaliat. 💬",
    quick: ["Deschide WhatsApp", "Înapoi la servicii"],
  },
};

// ─── INTENT DETECTION ─────────────────────────────────────────────────────────
const INTENTS: { keys: string[]; flow: string }[] = [
  { keys: ["servicii", "oferte", "ce fac", "ce faceti", "ce ofer"], flow: "servicii" },
  { keys: ["arhitectur", "casa", "vila", "proiect", "constructi", "renovar"], flow: "arh" },
  { keys: ["design", "interior", "mobil", "decor", "amenaj"], flow: "design" },
  { keys: ["consultan", "aviz", "autorizat", "verific"], flow: "consultanta" },
  { keys: ["oferta", "pret", "cat cost", "tarif", "buget"], flow: "pret" },
  { keys: ["portofol", "exemple", "lucrar"], flow: "portofoliu" },
  { keys: ["whatsapp", "suna", "telefon", "contact", "discut direct"], flow: "wa_redirect" },
];

function detectFlow(text: string): string | null {
  const t = text.toLowerCase();
  for (const intent of INTENTS) {
    if (intent.keys.some((k) => t.includes(k))) return intent.flow;
  }
  return null;
}

const QUICK_REPLY_MAP: Record<string, string> = {
  "Servicii & prețuri": "servicii",
  "Proiect nou": "arh",
  "Vreau o ofertă": "oferta",
  "Arhitectură rezidențială": "arh",
  "Design interior": "design",
  "Consultanță": "consultanta",
  "Vreau ofertă": "oferta",
  "Da, vreau să discut": "arh_discutie",
  "Văd portofoliu": "portofoliu",
  "Da, pe WhatsApp": "wa_redirect",
  "Vreau consultație": "pret",
  "Văd exemple": "portofoliu",
  "Cât costă?": "pret",
  "Deschide WhatsApp": "wa_redirect",
  "Mai am întrebări": "servicii",
  "Programează consultație": "wa_redirect",
  "Alte întrebări": "servicii",
  "Trimite pe WhatsApp": "wa_redirect",
  "Alte servicii": "servicii",
  "Înapoi la servicii": "servicii",
};

function quickToFlow(opt: string): string {
  return QUICK_REPLY_MAP[opt] ?? "servicii";
}

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Message {
  id: number;
  role: "bot" | "user";
  text: string;
}

let _id = 0;
const uid = () => ++_id;

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifDismissed, setNotifDismissed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [quickOptions, setQuickOptions] = useState<string[]>([
    "Servicii & prețuri",
    "Proiect nou",
    "Design interior",
    "Vreau o ofertă",
  ]);
  const [showWaBtn, setShowWaBtn] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!open) setNotifVisible(true);
    }, 2500);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setTimeout(() => {
        setMessages([
          {
            id: uid(),
            role: "bot",
            text: "Bună ziua! 👋 Sunt asistentul virtual <strong>Arhi.Design</strong>. Cu ce te pot ajuta azi?",
          },
        ]);
      }, 300);
    }
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Pe mobil panelul e full-screen, deci blocăm scroll-ul de fundal —
  // altfel body-ul "sare" în spatele ecranului de chat.
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const openWhatsApp = (msg = "Bună ziua! Aș dori mai multe informații despre serviciile Arhi.Design.") => {
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };

  const handleToggle = () => {
    setOpen((v) => !v);
    setNotifVisible(false);
    setNotifDismissed(true);
  };

  const respond = (flowKey: string) => {
    setQuickOptions([]);
    setShowWaBtn(false);
    setIsTyping(true);

    setTimeout(() => {
      const flow = FLOWS[flowKey] || FLOWS.servicii;
      setIsTyping(false);
      setMessages((prev) => [...prev, { id: uid(), role: "bot", text: flow.text }]);

      if (flow.wa) {
        setShowWaBtn(true);
        setQuickOptions([]);
        setTimeout(() => openWhatsApp(), 1200);
      } else {
        setQuickOptions(flow.quick || []);
      }
    }, 800 + Math.random() * 400);
  };

  const handleQuick = (opt: string) => {
    setMessages((prev) => [...prev, { id: uid(), role: "user", text: opt }]);
    respond(quickToFlow(opt));
  };

  const handleSend = () => {
    const v = inputVal.trim();
    if (!v || isTyping) return;
    setInputVal("");
    setMessages((prev) => [...prev, { id: uid(), role: "user", text: v }]);
    respond(detectFlow(v) || "servicii");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const showNotif = notifVisible && !notifDismissed && !open;

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════
          PANEL — structură DOM diferită explicit pentru mobil vs desktop.
          Pe mobil (< md): fixed inset-0, full-screen, fără card, fără colțuri.
          Pe desktop (≥ md): floating card în colțul din dreapta-jos, cu umbră.
         ════════════════════════════════════════════════════════════════ */}
      <div
        className={`
          fixed z-50 bg-white flex flex-col
          inset-0 md:inset-auto
          md:bottom-6 md:right-6 lg:bottom-8 lg:right-8
          md:w-[400px] lg:w-[420px]
          md:h-[640px] md:max-h-[80vh]
          md:rounded-2xl md:border md:border-gray-200 md:shadow-2xl
          transition-opacity duration-200
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      >
        {/* HEADER — pe mobil are padding-top pentru safe-area (notch) */}
        <div
          className="relative bg-[#e8272d] px-4 md:px-5 flex items-center gap-3 overflow-hidden flex-shrink-0"
          style={{ paddingTop: "max(1rem, env(safe-area-inset-top))", paddingBottom: "1rem" }}
        >
          <div className="absolute -right-5 -top-5 w-28 h-28 rounded-full bg-white/[0.07] pointer-events-none" />
          <div className="absolute -left-4 bottom-0 w-16 h-16 rounded-full bg-white/[0.05] pointer-events-none" />

          {/* buton înapoi — vizibil DOAR pe mobil, pentru senzația de ecran dedicat */}
          <button
            onClick={handleToggle}
            className="relative z-10 md:hidden text-white w-8 h-8 flex items-center justify-center -ml-1 flex-shrink-0"
            aria-label="Înapoi"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="relative z-10 w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center flex-shrink-0">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div className="relative z-10 flex-1 min-w-0">
            <h3 className="text-white font-semibold text-[15px] md:text-[14px] leading-tight truncate">Arhi.Design Studio</h3>
            <p className="text-white/70 text-[11px] md:text-[10px] mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block flex-shrink-0" />
              Online acum · răspunde instant
            </p>
          </div>

          {/* buton X — vizibil DOAR pe desktop (pe mobil avem deja buton înapoi) */}
          <button
            onClick={handleToggle}
            className="relative z-10 hidden md:flex text-white/70 hover:text-white transition-colors flex-shrink-0 w-8 h-8 items-center justify-center"
            aria-label="Închide chat"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* MESAJE */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#fafafa] flex flex-col gap-3 min-h-0">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[88%] md:max-w-[84%] px-3.5 py-2.5 text-[13.5px] md:text-[12.5px] leading-relaxed break-words ${
                  msg.role === "user"
                    ? "bg-[#e8272d] text-white rounded-[14px_14px_4px_14px]"
                    : "bg-white text-gray-700 rounded-[14px_14px_14px_4px] border border-gray-100 shadow-sm"
                }`}
                dangerouslySetInnerHTML={{ __html: msg.text }}
              />
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 rounded-[14px_14px_14px_4px] px-4 py-3 shadow-sm flex items-center gap-1.5">
                {[0, 150, 300].map((delay) => (
                  <span key={delay} className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* QUICK REPLIES */}
        {(quickOptions.length > 0 || showWaBtn) && (
          <div className="px-3 py-3 bg-[#fafafa] border-t border-gray-100 flex-shrink-0">
            {showWaBtn ? (
              <button
                onClick={() => openWhatsApp()}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fb356] text-white text-[13px] md:text-[12.5px] font-semibold py-3.5 md:py-3 rounded-xl transition-colors"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="white" className="flex-shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M11.997 2C6.477 2 2 6.478 2 12c0 1.818.487 3.53 1.338 5.008L2 22l5.135-1.318A9.955 9.955 0 0 0 12 22c5.52 0 10-4.478 10-10S17.517 2 11.997 2z"/>
                </svg>
                Continuă pe WhatsApp
              </button>
            ) : (
              <div className="flex flex-wrap gap-2">
                {quickOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleQuick(opt)}
                    disabled={isTyping}
                    className="bg-white border-[1.5px] border-gray-200 rounded-full px-3.5 py-2 md:py-1.5 text-[12.5px] md:text-[11.5px] text-gray-600 cursor-pointer transition-all hover:border-[#e8272d] hover:text-[#e8272d] hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* INPUT — pe mobil are padding-bottom pentru safe-area (home indicator) */}
        <div
          className="px-3 pt-3 bg-white border-t border-gray-100 flex items-center gap-2 flex-shrink-0"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            placeholder="Scrie un mesaj..."
            className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-full px-4 py-3 md:py-2.5 text-[14px] md:text-[12.5px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#e8272d] focus:bg-white transition-colors disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!inputVal.trim() || isTyping}
            className="w-11 h-11 md:w-9 md:h-9 rounded-full bg-[#e8272d] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all hover:bg-[#cc2020] active:scale-95 flex-shrink-0"
            aria-label="Trimite"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          NOTIFICARE + TOGGLE BUTTON — vizibile doar când panelul e închis
         ════════════════════════════════════════════════════════════════ */}
      {!open && (
        <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 lg:bottom-8 lg:right-8 z-50 flex flex-col items-end gap-3 pointer-events-none" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          <div
            className={`
              pointer-events-auto mr-3 sm:mr-4 md:mr-0
              flex items-center gap-2 bg-white
              rounded-[18px_18px_4px_18px] px-3.5 sm:px-4 py-2.5 sm:py-3
              shadow-xl text-[12px] sm:text-[13px] text-gray-700 font-medium
              max-w-[calc(100vw-2rem)] sm:max-w-none sm:whitespace-nowrap
              border border-gray-100
              transition-all duration-500
              ${showNotif ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}
            `}
          >
            <span className="w-2 h-2 rounded-full bg-[#e8272d] flex-shrink-0 animate-pulse" />
            <span className="flex-1 sm:flex-initial">Bună ziua! Cu ce vă putem ajuta? 👋</span>
            <button
              onClick={() => { setNotifVisible(false); setNotifDismissed(true); }}
              className="ml-1 text-gray-300 hover:text-gray-500 transition-colors text-lg leading-none flex-shrink-0"
              aria-label="Închide"
            >×</button>
          </div>

          <button
            onClick={handleToggle}
            aria-label="Deschide chat"
            style={{ boxShadow: "0 0 0 0 rgba(232,39,45,0.4)", animation: "pulseRed 2.5s infinite" }}
            className="pointer-events-auto mr-3 mb-3 sm:mr-4 sm:mb-4 md:mr-0 md:mb-0 self-end w-[58px] h-[58px] sm:w-[62px] sm:h-[62px] rounded-full bg-[#e8272d] hover:bg-[#cc2020] border-none flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulseRed {
          0%, 100% { box-shadow: 0 0 0 0 rgba(232,39,45,0.45); }
          60%       { box-shadow: 0 0 0 14px rgba(232,39,45,0); }
        }
      `}</style>
    </>
  );
}