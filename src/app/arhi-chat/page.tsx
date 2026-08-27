'use client';

import { useEffect, useRef, useState } from 'react';

interface Message { id: string; role: 'user' | 'assistant'; content: string; }

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
    <div className="flex h-screen w-full bg-[#212121] text-[#ececec] font-sans antialiased">
      <div className="flex flex-col flex-1 h-full relative overflow-hidden">
        
        {/* Header */}
        <header className="shrink-0 flex items-center justify-between px-4 py-3 bg-[#212121] border-b border-[#2f2f2f]">
          <div className="flex items-center gap-2.5 text-[14px] font-medium text-white">
            <div className="w-6 h-6 rounded-md bg-[#3c3d3e] flex items-center justify-center text-xs">A</div>
            <span>Arhi Chat</span>
          </div>
          <button onClick={() => setMessages([])} className="text-[13px] text-[#b4b4b4] hover:text-white transition">Conversație nouă</button>
        </header>

        {/* Zona Mesaje */}
        <div className="flex-1 overflow-y-auto w-full pb-32">
          {messages.length === 0 ? (
            <div className="max-w-2xl mx-auto h-full flex flex-col justify-center items-center px-4 pt-20">
              <h2 className="text-xl font-medium text-white mb-6 text-center">Cu ce te pot ajuta astăzi, arhitecte?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                <button onClick={() => executeChat("Care sunt indicii POT și CUT maximi în Târgoviște?")} className="text-left p-3.5 rounded-xl border border-[#2f2f2f] bg-[#2f2f2f]/30 text-[13.5px] hover:bg-[#2f2f2f]/80 transition">POT & CUT Dâmbovița</button>
                <button onClick={() => executeChat("Ce acte îmi trebuie pentru un Certificat de Urbanism?")} className="text-left p-3.5 rounded-xl border border-[#2f2f2f] bg-[#2f2f2f]/30 text-[13.5px] hover:bg-[#2f2f2f]/80 transition">Acte necesare CU</button>
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`w-full py-5 border-b border-[#2f2f2f]/20 ${m.role === 'user' ? 'bg-[#212121]' : 'bg-[#2f2f2f]/20'}`}>
                <div className="max-w-2xl mx-auto flex gap-4 px-4 text-[15px] leading-7">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${m.role === 'user' ? 'bg-[#543a3a]' : 'bg-[#10a37f]'}`}>{m.role === 'user' ? 'U' : 'A'}</div>
                  <div className="flex-1 whitespace-pre-wrap break-words">{m.content || <span className="inline-block w-1.5 h-4 bg-white animate-pulse" />}</div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Formular Input */}
        <div className="shrink-0 w-full absolute bottom-0 left-0 bg-gradient-to-t from-[#212121] via-[#212121] to-transparent pt-6 pb-4">
          <div className="max-w-2xl mx-auto px-4">
            <div className="relative flex items-end w-full rounded-2xl border border-[#2f2f2f] bg-[#2f2f2f] shadow-lg">
              <textarea
                ref={inputRef}
                rows={1}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Mesaj către Arhi..."
                disabled={isLoading}
                className="flex-1 w-full max-h-[160px] min-h-[44px] py-3 pl-4 pr-12 bg-transparent text-[15px] text-white placeholder-[#7d7d7d] resize-none focus:outline-none"
              />
              <button onClick={() => { if(textInput.trim()) { executeChat(textInput); setTextInput(''); } }} disabled={isLoading || !textInput.trim()} className="absolute right-2.5 bottom-2 w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center disabled:bg-[#3e3e3e] disabled:text-[#7d7d7d] transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 11l5-5 5 5M12 6v12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
