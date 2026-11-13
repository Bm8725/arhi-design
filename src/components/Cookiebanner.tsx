/**
 * components/Cookiebanner.tsx
 *
 * Consimțământ cookie – PROARH.4D (PROIECTEARH 4D S.R.L.)
 *
 * - Cheile din localStorage sunt cele existente (compatibilitate):
 *     proarh_governance_consent  -> 'all' | 'custom' | 'denied'
 *     proarh_cookie_matrix       -> { essential, analytics, marketing }
 *   + nouă: proarh_consent_meta  -> { date, version } (reafișare după 12 luni
 *     sau la schimbarea versiunii).
 * - Emite evenimentul "cookie-consent-changed" (detail = matrix) – încarcă
 *   scripturile de analiză/marketing doar după el, pe categoria acceptată.
 * - Redeschidere din orice loc (ex. link în Footer):
 *     window.dispatchEvent(new Event('open-cookie-settings'))
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const KEY_STATUS = 'proarh_governance_consent';
const KEY_MATRIX = 'proarh_cookie_matrix';
const KEY_META = 'proarh_consent_meta';
const CONSENT_VERSION = 2; // crește când se schimbă categoriile / politicile
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 365; // 12 luni

type Matrix = { essential: true; analytics: boolean; marketing: boolean };

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  // Opt-in: orice categorie neesențială pornește dezactivată
  const [preferences, setPreferences] = useState<Matrix>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    try {
      const status = localStorage.getItem(KEY_STATUS);
      const meta = JSON.parse(localStorage.getItem(KEY_META) || 'null');
      const matrix = JSON.parse(localStorage.getItem(KEY_MATRIX) || 'null');

      if (matrix) {
        setPreferences({
          essential: true,
          analytics: !!matrix.analytics,
          marketing: !!matrix.marketing,
        });
      }

      const expired =
        !meta ||
        meta.version !== CONSENT_VERSION ||
        Date.now() - new Date(meta.date).getTime() > MAX_AGE_MS;

      if (!status || expired) {
        // Consimțământ vechi sau inexistent: pornim de la zero
        if (status && expired) {
          setPreferences({ essential: true, analytics: false, marketing: false });
        }
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    const reopen = () => {
      setShowPreferences(true);
      setIsVisible(true);
    };
    window.addEventListener('open-cookie-settings', reopen);
    return () => window.removeEventListener('open-cookie-settings', reopen);
  }, []);

  const saveConsent = (status: 'all' | 'custom' | 'denied', payload: Matrix) => {
    try {
      localStorage.setItem(KEY_STATUS, status);
      localStorage.setItem(KEY_MATRIX, JSON.stringify(payload));
      localStorage.setItem(
        KEY_META,
        JSON.stringify({ date: new Date().toISOString(), version: CONSENT_VERSION })
      );
    } catch {
      /* storage indisponibil: alegerea ține doar pentru sesiunea curentă */
    }
    setPreferences(payload);
    window.dispatchEvent(new CustomEvent('cookie-consent-changed', { detail: payload }));
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () =>
    saveConsent('all', { essential: true, analytics: true, marketing: true });

  const handleSaveCustom = () => saveConsent('custom', preferences);

  const handleDeclineAll = () =>
    saveConsent('denied', { essential: true, analytics: false, marketing: false });

  // MINI-ICON PERMANENT când bannerul principal este ascuns
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-[9.5rem] md:bottom-6 left-6 w-11 h-11 bg-[#0d0d0d]/90 backdrop-blur-xl border border-neutral-800 hover:border-amber-500/50 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-[9999] flex items-center justify-center text-neutral-400 hover:text-amber-500 transition-all duration-300 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
        title="Setări Cookie"
        aria-label="Deschide setările de cookie"
      >
        <svg
          className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-13.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286z"
          />
        </svg>
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      className="fixed bottom-24 md:bottom-6 left-6 max-w-md w-[calc(100vw-3rem)] bg-[#0d0d0d]/95 backdrop-blur-xl border border-neutral-800/80 rounded-xl shadow-[0_30px_70px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.05)] z-[9999] overflow-hidden transition-all duration-500 font-sans max-h-[calc(100vh-7rem)] overflow-y-auto"
    >
      <div className="w-full h-[2px] bg-gradient-to-r from-neutral-900 via-amber-500/50 to-neutral-900" />

      <div className="p-5 md:p-6 flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse motion-reduce:animate-none" />
          <h4
            id="cookie-title"
            className="text-xs font-mono tracking-wider text-neutral-200 uppercase"
          >
            Setări cookie
          </h4>
        </div>

        {!showPreferences ? (
          <p className="text-neutral-400 text-xs leading-relaxed font-light">
            PROARH.4D (PROIECTEARH 4D S.R.L.) folosește cookie-uri tehnice pentru funcționarea
            site-ului, a contului Smart Connect și a coșului de cumpărături. Cele analitice și de
            marketing se activează doar cu acordul dumneavoastră, pe care îl puteți schimba oricând.{' '}
            <Link
              href="/politica-cookie"
              className="text-amber-500/90 hover:text-amber-400 underline underline-offset-2"
            >
              Politica de Cookie
            </Link>
            {' · '}
            <Link
              href="/politica-confidentialitate"
              className="text-amber-500/90 hover:text-amber-400 underline underline-offset-2"
            >
              Confidențialitate
            </Link>
          </p>
        ) : (
          <div className="space-y-2.5 bg-neutral-950/40 p-3 rounded-lg border border-neutral-900">
            <div className="flex items-center justify-between gap-4 py-1">
              <div className="flex flex-col">
                <span className="text-xs font-mono text-neutral-300">Tehnice</span>
                <span className="text-[10px] text-neutral-500">
                  Autentificare, coș, securitate. Necesare, mereu active.
                </span>
              </div>
              <span className="text-[9px] font-mono text-amber-500/80 bg-amber-500/5 px-2 py-0.5 rounded">
                Activ
              </span>
            </div>

            <label className="flex items-center justify-between gap-4 py-1 border-t border-neutral-900/50 cursor-pointer">
              <span className="flex flex-col">
                <span className="text-xs font-mono text-neutral-300">Analitice</span>
                <span className="text-[10px] text-neutral-500">
                  Statistici despre utilizarea site-ului, pentru îmbunătățiri.
                </span>
              </span>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                className="w-4 h-4 rounded border-neutral-800 bg-neutral-900 text-amber-500 focus:ring-0 cursor-pointer accent-amber-500"
              />
            </label>

            <label className="flex items-center justify-between gap-4 py-1 border-t border-neutral-900/50 cursor-pointer">
              <span className="flex flex-col">
                <span className="text-xs font-mono text-neutral-300">Marketing</span>
                <span className="text-[10px] text-neutral-500">
                  Măsurarea campaniilor și conținut personalizat de la terți.
                </span>
              </span>
              <input
                type="checkbox"
                checked={preferences.marketing}
                onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                className="w-4 h-4 rounded border-neutral-800 bg-neutral-900 text-amber-500 focus:ring-0 cursor-pointer accent-amber-500"
              />
            </label>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 pt-3 border-t border-neutral-900">
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            aria-expanded={showPreferences}
            className="text-neutral-500 hover:text-amber-400 text-[11px] font-mono transition-colors"
          >
            {showPreferences ? '[ Închide ]' : '[ Opțiuni ]'}
          </button>

          <div className="flex items-center gap-2">
            {!showPreferences ? (
              <>
                {/* Refuză și Acceptă au aceeași dimensiune și vizibilitate */}
                <button
                  onClick={handleDeclineAll}
                  className="px-3.5 py-1.5 bg-white hover:bg-neutral-200 text-black font-medium text-xs font-mono rounded-md transition-all"
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
              <>
                <button
                  onClick={handleDeclineAll}
                  className="px-3.5 py-1.5 border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white text-xs font-mono rounded-md transition-all"
                >
                  Refuză
                </button>
                <button
                  onClick={handleSaveCustom}
                  className="px-3.5 py-1.5 bg-white hover:bg-neutral-200 text-black font-medium text-xs font-mono rounded-md transition-all"
                >
                  Salvează
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}