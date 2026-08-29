'use client';

import { useEffect, useRef, useState } from 'react';
import { Compass, FileText, Building2, Ruler, SendHorizontal, RotateCcw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Message { id: string; role: 'user' | 'assistant'; content: string; }

const STARTERS = [
  { icon: Ruler, label: 'Reglementări', prompt: 'Care sunt indicii POT și CUT maximi în Târgoviște?' },
  { icon: FileText, label: 'Acte', prompt: 'Ce acte îmi trebuie pentru un Certificat de Urbanism?' },
  { icon: Building2, label: 'Autorizații', prompt: 'Ce pași urmez pentru obținerea autorizației de construire?' },
  { icon: Compass, label: 'Servicii', prompt: 'Cât durează și cât costă, în general, o randare 3D?' },
];

export default function ArhiChat() {
  const [textInput, setTextInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const executeChat = async (promptToSend: string) => {
    if (!promptToSend.trim() || isLoading) return;
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
          0%, 100% { transform: translate(-10%, -10%) scale(1); opacity: 0.55; }
          50% { transform: translate(5%, 8%) scale(1.15); opacity: 0.8; }
        }
        @keyframes blobFloatB {
          0%, 100% { transform: translate(8%, 5%) scale(1); opacity: 0.4; }
          50% { transform: translate(-6%, -8%) scale(1.2); opacity: 0.65; }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounceDot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes glowPulse {
          0%, 100% { text-shadow: 0 0 10px rgba(245,158,11,0.25); }
          50% { text-shadow: 0 0 22px rgba(245,158,11,0.55); }
        }
        @keyframes ringPulse {
          0% { box-shadow: 0 0 0 0 rgba(245,158,11,0.35); }
          100% { box-shadow: 0 0 0 8px rgba(245,158,11,0); }
        }

        .anim-fadeup { animation: fadeInUp 0.55s ease-out both; }
        .anim-card { animation: cardIn 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .anim-spin-slow { animation: spinSlow 14s linear infinite; }
        .anim-glow-word { animation: glowPulse 3s ease-in-out infinite; }
        .anim-status-dot { animation: ringPulse 2s ease-out infinite; }

        .arhi-scroll::-webkit-scrollbar { width: 6px; }
        .arhi-scroll::-webkit-scrollbar-track { background: transparent; }
        .arhi-scroll::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.25); border-radius: 999px; }
        .arhi-scroll::-webkit-scrollbar-thumb:hover { background: rgba(245,158,11,0.45); }
        .arhi-scroll { scrollbar-width: thin; scrollbar-color: rgba(245,158,11,0.3) transparent; }
      `}</style>

      <div className="min-h-screen bg-[#0d0d0d] arhi-mono relative overflow-hidden">

        {/* Fundal ambiental — două pete de lumină amber care respiră lent */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-[8%] left-[10%] w-[420px] h-[420px] rounded-full blur-[110px]"
            style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.16) 0%, transparent 70%)', animation: 'blobFloatA 14s ease-in-out infinite' }}
          />
          <div
            className="absolute bottom-[10%] right-[8%] w-[380px] h-[380px] rounded-full blur-[110px]"
            style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)', animation: 'blobFloatB 17s ease-in-out infinite' }}
          />
        </div>

        <Navbar />

        <div className="relative pt-20 md:pt-32 pb-28 md:pb-20 px-4">
          <div className="anim-card max-w-3xl mx-auto h-[74dvh] md:h-[76vh] flex flex-col rounded-2xl border border-white/10 bg-[#141414]/90 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.55)] overflow-hidden">

            {/* Header intern al card-ului de chat */}
            <header className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                  <Compass size={16} className="text-amber-500 anim-spin-slow" />
                </div>
                <div className="leading-tight">
                  <span className="flex items-center gap-1.5 text-[13px] font-semibold text-white tracking-wide">
                    Arhi
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-amber-500 anim-status-dot" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                    </span>
                  </span>
                  <span className="block text-[10px] uppercase tracking-[0.15em] text-neutral-500">Asistent urbanism &amp; arhitectură</span>
                </div>
              </div>
              <button
                onClick={() => setMessages([])}
                className="group flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-neutral-400 hover:text-amber-400 transition-colors"
              >
                <RotateCcw size={12} className="transition-transform duration-500 group-hover:-rotate-180" />
                Conversație nouă
              </button>
            </header>

            {/* Zona de mesaje */}
            <div className="arhi-scroll flex-1 overflow-y-auto w-full">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center px-6 text-center">
                  <h2 className="anim-fadeup arhi-serif text-2xl md:text-3xl text-white mb-2">
                    Cu ce te pot ajuta, <em className="anim-glow-word text-amber-500 not-italic italic">arhitecte?</em>
                  </h2>
                  <p className="anim-fadeup text-[12.5px] text-neutral-500 mb-8 max-w-sm" style={{ animationDelay: '90ms' }}>
                    Întreabă orice despre urbanism, autorizații sau serviciile biroului Bogdan Sotingeanu.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                    {STARTERS.map((s, i) => {
                      const Icon = s.icon;
                      return (
                        <button
                          key={s.label}
                          onClick={() => executeChat(s.prompt)}
                          className="anim-fadeup group text-left p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-amber-500/40 hover:bg-white/[0.05] hover:-translate-y-0.5 transition-all duration-300"
                          style={{ animationDelay: `${160 + i * 90}ms` }}
                        >
                          <Icon size={15} className="text-amber-500 mb-2.5 transition-transform duration-300 group-hover:scale-110" />
                          <span className="block text-[10px] uppercase tracking-[0.15em] text-neutral-500 mb-1">{s.label}</span>
                          <span className="block text-[12.5px] text-neutral-300 leading-snug group-hover:text-white transition-colors">{s.prompt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="pb-4">
                  {messages.map((m) => (
                    <div key={m.id} className="anim-fadeup w-full px-5 py-4">
                      <div className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {m.role === 'assistant' && (
                          <div className="w-7 h-7 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                            <Compass size={13} className="text-amber-500" />
                          </div>
                        )}
                        <div
                          className={`max-w-[82%] px-4 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap break-words ${
                            m.role === 'user'
                              ? 'bg-amber-500 text-black font-medium rounded-2xl rounded-br-md'
                              : 'bg-white/[0.04] border border-white/10 text-neutral-100 rounded-2xl rounded-bl-md'
                          }`}
                        >
                          {m.content ? (
                            m.content
                          ) : (
                            <span className="inline-flex items-center gap-1 py-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" style={{ animation: 'bounceDot 1.2s ease-in-out infinite', animationDelay: '0ms' }} />
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" style={{ animation: 'bounceDot 1.2s ease-in-out infinite', animationDelay: '150ms' }} />
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" style={{ animation: 'bounceDot 1.2s ease-in-out infinite', animationDelay: '300ms' }} />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Formular Input */}
            <div className="shrink-0 border-t border-white/10 p-3.5">
              <div className="relative flex items-end w-full rounded-2xl border border-white/10 bg-white/[0.03] transition-all duration-300 focus-within:border-amber-500/60 focus-within:shadow-[0_0_0_4px_rgba(245,158,11,0.12)]">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Mesaj către Arhi..."
                  disabled={isLoading}
                  className="flex-1 w-full max-h-[160px] min-h-[46px] py-3.5 pl-4 pr-12 bg-transparent text-[14.5px] text-white placeholder-neutral-500 resize-none focus:outline-none arhi-mono"
                />
                <button
                  onClick={() => { if (textInput.trim()) { executeChat(textInput); setTextInput(''); } }}
                  disabled={isLoading || !textInput.trim()}
                  aria-label="Trimite"
                  className="absolute right-2.5 bottom-2.5 w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center disabled:bg-white/10 disabled:text-neutral-600 transition-all duration-300 hover:scale-110 hover:rotate-[8deg] active:scale-95 disabled:hover:scale-100 disabled:hover:rotate-0"
                >
                  <SendHorizontal size={14} />
                </button>
              </div>
            </div>

          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}