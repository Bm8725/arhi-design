'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Wand2, FileText, Building2, Ruler, SendHorizontal, RotateCcw, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Message { id: string; role: 'user' | 'assistant'; content: string; }

const STARTERS = [
  { icon: Ruler, label: 'Reglementări', prompt: 'Care sunt indicii POT și CUT maximi în Târgoviște?' },
  { icon: FileText, label: 'Acte', prompt: 'Ce acte îmi trebuie pentru un Certificat de Urbanism?' },
  { icon: Building2, label: 'Autorizații', prompt: 'Ce pași urmez pentru obținerea autorizației de construire?' },
  { icon: Wand2, label: 'Servicii', prompt: 'Cât durează și cât costă, în general, o randare 3D?' },
];

export default function ArhiChat() {
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [textInput, setTextInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id ?? null);
      setCheckingAuth(false);
    }
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const isNewMessage = messages.length !== prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: isNewMessage ? 'smooth' : 'auto',
    });
  }, [messages]);

  const executeChat = async (promptToSend: string) => {
    if (!userId || !promptToSend.trim() || isLoading) return;
    setIsLoading(true);
    const updatedMessages = [...messages, { id: crypto.randomUUID(), role: 'user' as const, content: promptToSend }];
    setMessages(updatedMessages);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      const assistantId = crypto.randomUUID();
      let assistantContent = '';
      setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        setMessages((prev) => prev.map((msg) => msg.id === assistantId ? { ...msg, content: assistantContent } : msg));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (textInput.trim()) { executeChat(textInput); setTextInput(''); }
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Mono:wght@400;500;700&display=swap');
        .arhi-serif { font-family: 'Playfair Display', serif; }
        .arhi-mono { font-family: 'DM Mono', monospace; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes blobFloatA {
          0%, 100% { transform: translate(-10%, -10%) scale(1); opacity: 0.5; }
          50% { transform: translate(5%, 8%) scale(1.15); opacity: 0.75; }
        }
        @keyframes blobFloatB {
          0%, 100% { transform: translate(8%, 5%) scale(1); opacity: 0.35; }
          50% { transform: translate(-6%, -8%) scale(1.2); opacity: 0.6; }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes borderSweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounceDot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes glowPulse {
          0%, 100% { text-shadow: 0 0 8px rgba(191,160,84,0.2); }
          50% { text-shadow: 0 0 16px rgba(191,160,84,0.45); }
        }
        @keyframes avatarPop {
          0% { transform: scale(0.4); opacity: 0; }
          60% { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes bgBreathe {
          0% { transform: scale(1.06) translate(0, 0); }
          50% { transform: scale(1.14) translate(-1%, -1%); }
          100% { transform: scale(1.06) translate(0, 0); }
        }

        .anim-fadeup { animation: fadeInUp 0.55s ease-out both; }
        .anim-card { animation: cardIn 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .anim-spin-slow { animation: spinSlow 14s linear infinite; }
        .anim-glow-word { animation: glowPulse 3s ease-in-out infinite; }
        .anim-avatar-pop { animation: avatarPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
        .anim-pulse-slow { animation: pulseSlow 2.6s ease-in-out infinite; }
        .anim-bg-breathe { animation: bgBreathe 22s ease-in-out infinite; }

        .arhi-scroll::-webkit-scrollbar { width: 6px; }
        .arhi-scroll::-webkit-scrollbar-track { background: transparent; }
        .arhi-scroll::-webkit-scrollbar-thumb { background: rgba(191,160,84,0.3); border-radius: 999px; }
        .arhi-scroll::-webkit-scrollbar-thumb:hover { background: rgba(191,160,84,0.5); }
        .arhi-scroll { scrollbar-width: thin; scrollbar-color: rgba(191,160,84,0.35) transparent; overscroll-behavior: contain; }

        /* Bordură cu lumină care se rotește lent în jurul card-ului de chat */
        .arhi-card-frame { position: relative; border-radius: 1rem; padding: 1px; overflow: hidden; }
        .arhi-card-frame::before {
          content: '';
          position: absolute;
          inset: -50%;
          background: conic-gradient(from 0deg, transparent 0%, rgba(191,160,84,0.55) 8%, transparent 22%);
          animation: borderSweep 7s linear infinite;
        }
      `}</style>

      <div className="min-h-screen bg-[#faf8f4] arhi-mono relative overflow-hidden">

        {/* Fundal real: imaginea, cu zoom lent + overlay deschis pentru lizibilitate pe temă albă */}
        <div className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden">
          <img
            src="/nimet.webp"
            alt=""
            className="anim-bg-breathe w-full h-full object-cover opacity-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#faf8f4]/85 via-[#faf8f4]/60 to-[#faf8f4]/92" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#faf8f4]/75 via-transparent to-[#faf8f4]/75" />
        </div>

        {/* Fundal ambiental — două pete de lumină aurie, discrete pe alb */}
        <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
          <div
            className="absolute top-[8%] left-[10%] w-[420px] h-[420px] rounded-full blur-[110px]"
            style={{ background: 'radial-gradient(circle, rgba(191,160,84,0.22) 0%, transparent 70%)', animation: 'blobFloatA 14s ease-in-out infinite' }}
          />
          <div
            className="absolute bottom-[10%] right-[8%] w-[380px] h-[380px] rounded-full blur-[110px]"
            style={{ background: 'radial-gradient(circle, rgba(191,160,84,0.16) 0%, transparent 70%)', animation: 'blobFloatB 17s ease-in-out infinite' }}
          />
        </div>

        <div className="relative z-10">
          <Navbar />

          <div className="relative pt-20 md:pt-32 pb-28 md:pb-20 px-4">
            <div className="anim-card arhi-card-frame max-w-3xl mx-auto h-[74dvh] md:h-[76vh] shadow-[0_20px_60px_rgba(26,26,26,0.12)]">
              <div className="relative h-full flex flex-col rounded-2xl bg-white/85 backdrop-blur-xl overflow-hidden border border-black/5">

                {checkingAuth ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-[#bfa054]/25 border-t-[#bfa054]"
                      style={{ animation: 'spin 0.8s linear infinite' }}
                    />
                    <span className="text-[11px] uppercase tracking-[0.15em] text-zinc-500">Se verifică accesul...</span>
                  </div>
                ) : !userId ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-8">
                    <div className="w-12 h-12 rounded-full bg-[#bfa054]/10 border border-[#bfa054]/25 flex items-center justify-center mb-5">
                      <Lock size={18} className="text-[#bfa054]" />
                    </div>
                    <h2 className="arhi-serif text-2xl md:text-3xl text-black mb-2">
                      Autentificare <em className="text-[#bfa054] not-italic italic">necesară.</em>
                    </h2>
                    <p className="text-[12.5px] text-zinc-500 mb-7 max-w-xs leading-relaxed">
                      Conversația cu Arhi AI este disponibilă doar pentru utilizatorii cu cont. Autentifică-te sau creează-ți un cont gratuit pentru a continua.
                    </p>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center bg-black text-white rounded-full px-7 py-3 text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-300 hover:bg-[#bfa054] active:scale-95"
                    >
                      Autentifică-te
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Header intern al card-ului de chat */}
                    <header className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-black/5 bg-white/60 backdrop-blur-md">
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 rounded-xl bg-[#bfa054]/10 border border-[#bfa054]/25 flex items-center justify-center">
                          <Wand2 size={18} className="text-[#bfa054] anim-pulse-slow" />
                          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-black tracking-wide">Arhi AI</span>
                          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                            Asistent urbanism &amp; arhitectură
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setMessages([])}
                        className="group flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium uppercase tracking-wider text-zinc-500 hover:text-[#bfa054] hover:bg-[#bfa054]/5 transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-[#bfa054]/30"
                      >
                        <RotateCcw size={13} className="transition-transform duration-500 ease-out group-hover:-rotate-180" />
                        Conversație nouă
                      </button>
                    </header>

                    {/* Zona de mesaje */}
                    <div ref={scrollContainerRef} className="arhi-scroll flex-1 overflow-y-auto w-full relative">
                      {messages.length === 0 ? (
                        <div className="h-full flex flex-col justify-center items-center px-6 text-center">
                          <h2 className="anim-fadeup arhi-serif text-2xl md:text-3xl text-black mb-2">
                            Cu ce te pot ajuta, <em className="anim-glow-word text-[#bfa054] not-italic italic">arhitecte?</em>
                          </h2>
                          <p className="anim-fadeup text-[12.5px] text-zinc-500 mb-8 max-w-sm" style={{ animationDelay: '90ms' }}>
                            Întreabă orice despre urbanism, autorizații sau serviciile biroului Bogdan Sotingeanu.
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                            {STARTERS.map((s, i) => {
                              const Icon = s.icon;
                              return (
                                <button
                                  key={s.label}
                                  onClick={() => executeChat(s.prompt)}
                                  className="anim-fadeup group text-left p-4 rounded-xl border border-black/10 bg-white/70 backdrop-blur-sm hover:border-[#bfa054]/50 hover:bg-white hover:-translate-y-0.5 transition-all duration-300"
                                  style={{ animationDelay: `${160 + i * 90}ms` }}
                                >
                                  <Icon size={15} className="text-[#bfa054] mb-2.5 transition-transform duration-300 group-hover:scale-110" />
                                  <span className="block text-[10px] uppercase tracking-[0.15em] text-zinc-500 mb-1">{s.label}</span>
                                  <span className="block text-[12.5px] text-zinc-700 leading-snug group-hover:text-black transition-colors">{s.prompt}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="pb-4 relative z-10">
                          {messages.map((m) => (
                            <div key={m.id} className="anim-fadeup w-full px-5 py-4">
                              <div className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {m.role === 'assistant' && (
                                  <div className="anim-avatar-pop w-7 h-7 rounded-full bg-[#bfa054]/10 border border-[#bfa054]/25 flex items-center justify-center shrink-0 mt-0.5">
                                    <Wand2 size={13} className="text-[#bfa054]" />
                                  </div>
                                )}
                                <div
                                  className={`max-w-[82%] px-4 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap break-words ${
                                    m.role === 'user'
                                      ? 'bg-black text-white font-medium rounded-2xl rounded-br-md'
                                      : 'bg-zinc-100/90 border border-black/5 text-zinc-800 rounded-2xl rounded-bl-md backdrop-blur-sm'
                                  }`}
                                >
                                  {m.content ? (
                                    m.content
                                  ) : (
                                    <span className="inline-flex items-center gap-1 py-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#bfa054]" style={{ animation: 'bounceDot 1.2s ease-in-out infinite', animationDelay: '0ms' }} />
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#bfa054]" style={{ animation: 'bounceDot 1.2s ease-in-out infinite', animationDelay: '150ms' }} />
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#bfa054]" style={{ animation: 'bounceDot 1.2s ease-in-out infinite', animationDelay: '300ms' }} />
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Formular Input */}
                    <div className="shrink-0 border-t border-black/5 p-3.5">
                      <div className="relative flex items-end w-full rounded-2xl border border-black/10 bg-white/70 backdrop-blur-sm transition-all duration-300 focus-within:border-[#bfa054]/60 focus-within:shadow-[0_0_0_4px_rgba(191,160,84,0.15)]">
                        <textarea
                          ref={inputRef}
                          rows={1}
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Mesaj către Arhi..."
                          disabled={isLoading}
                          className="flex-1 w-full max-h-[160px] min-h-[46px] py-3.5 pl-4 pr-12 bg-transparent text-[14.5px] text-black placeholder-zinc-400 resize-none focus:outline-none arhi-mono"
                        />
                        <button
                          onClick={() => { if (textInput.trim()) { executeChat(textInput); setTextInput(''); } }}
                          disabled={isLoading || !textInput.trim()}
                          aria-label="Trimite"
                          className="absolute right-2.5 bottom-2.5 w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center disabled:bg-zinc-200 disabled:text-zinc-400 transition-all duration-300 hover:scale-110 hover:rotate-[8deg] hover:bg-[#bfa054] active:scale-95 disabled:hover:scale-100 disabled:hover:rotate-0 disabled:hover:bg-zinc-200"
                        >
                          <SendHorizontal size={14} />
                        </button>
                      </div>
                    </div>
                  </>
                )}

              </div>
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </>
  );
}