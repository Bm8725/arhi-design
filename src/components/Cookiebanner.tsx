/**
 * components/Cookiebanner.tsx
 */

'use client';

import React, { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('proarh_governance_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (status: 'all' | 'custom' | 'denied', payload: typeof preferences) => {
    localStorage.setItem('proarh_governance_consent', status);
    localStorage.setItem('proarh_cookie_matrix', JSON.stringify(payload));
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    saveConsent('all', { essential: true, analytics: true, marketing: true });
  };

  const handleSaveCustom = () => {
    saveConsent('custom', preferences);
  };

  const handleDeclineAll = () => {
    saveConsent('denied', { essential: true, analytics: false, marketing: false });
  };

  // MINI-ICON PERMANENT când bannerul principal este ascuns
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-24 md:bottom-6 left-6 w-11 h-11 bg-[#0d0d0d]/90 backdrop-blur-xl border border-neutral-800 hover:border-amber-500/50 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-[9999] flex items-center justify-center text-neutral-400 hover:text-amber-500 transition-all duration-300 group"
        title="Setări Cookie"
      >
        <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-13.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 md:bottom-6 left-6 max-w-md w-[calc(100vw-3rem)] bg-[#0d0d0d]/90 backdrop-blur-xl border border-neutral-800/80 rounded-xl shadow-[0_30px_70px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.05)] z-[9999] overflow-hidden transition-all duration-500 font-sans">
      
      <div className="w-full h-[2px] bg-gradient-to-r from-neutral-900 via-amber-500/50 to-neutral-900" />
      
      <div className="p-5 md:p-6 flex flex-col gap-5">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <h4 className="text-xs font-mono tracking-wider text-neutral-200 uppercase">
              Privacy Settings
            </h4>
          </div>
        </div>

        {!showPreferences ? (
          <p className="text-neutral-400 text-xs leading-relaxed font-light">
            Utilizăm cookie-uri pentru a optimiza performanța platformei, a securiza sesiunile și a analiza traficul complet anonim.
          </p>
        ) : (
          <div className="space-y-2.5 bg-neutral-950/40 p-3 rounded-lg border border-neutral-900">
            <div className="flex items-center justify-between gap-4 py-1">
              <div className="flex flex-col">
                <span className="text-xs font-mono text-neutral-300">Tehnice</span>
                <span className="text-[10px] text-neutral-500">Sesiuni și securitate.</span>
              </div>
              <span className="text-[9px] font-mono text-amber-500/80 bg-amber-500/5 px-2 py-0.5 rounded">Activ</span>
            </div>

            <div className="flex items-center justify-between gap-4 py-1 border-t border-neutral-900/50">
              <div className="flex flex-col">
                <span className="text-xs font-mono text-neutral-300">Analitice</span>
                <span className="text-[10px] text-neutral-500">Performanță și trafic anonim.</span>
              </div>
              <input 
                type="checkbox" 
                checked={preferences.analytics}
                onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})}
                className="w-4 h-4 rounded border-neutral-800 bg-neutral-900 text-amber-500 focus:ring-0 cursor-pointer accent-amber-500"
              />
            </div>

            <div className="flex items-center justify-between gap-4 py-1 border-t border-neutral-900/50">
              <div className="flex flex-col">
                <span className="text-xs font-mono text-neutral-300">Marketing</span>
                <span className="text-[10px] text-neutral-500">Personalizare experiență.</span>
              </div>
              <input 
                type="checkbox" 
                checked={preferences.marketing}
                onChange={(e) => setPreferences({...preferences, marketing: e.target.checked})}
                className="w-4 h-4 rounded border-neutral-800 bg-neutral-900 text-amber-500 focus:ring-0 cursor-pointer accent-amber-500"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 pt-3 border-t border-neutral-950">
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="text-neutral-500 hover:text-amber-400 text-[11px] font-mono transition-colors"
          >
            {showPreferences ? '[ Închide ]' : '[ Opțiuni ]'}
          </button>

          <div className="flex items-center gap-2">
            {!showPreferences ? (
              <>
                <button
                  onClick={handleDeclineAll}
                  className="px-2.5 py-1.5 border border-neutral-800 hover:border-neutral-700 bg-neutral-900/20 text-neutral-400 hover:text-white text-xs font-mono rounded-md transition-all"
                >
                  Refuză
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-medium text-xs font-mono rounded-md shadow-md shadow-amber-500/5 transition-all"
                >
                  Acceptă
                </button>
              </>
            ) : (
              <button
                onClick={handleSaveCustom}
                className="px-4 py-1.5 bg-white hover:bg-neutral-200 text-black font-medium text-xs font-mono rounded-md transition-all"
              >
                Salvează
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}