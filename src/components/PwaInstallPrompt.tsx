"use client";

import { useEffect, useState } from 'react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isRo, setIsRo] = useState(true);

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const dismissTimeStorage = localStorage.getItem('pwa-prompt-dismissed');
    const dismissCookie = getCookie('pwa-prompt-dismissed');
    const dismissTime = dismissTimeStorage || dismissCookie;

    if (dismissTime) {
      const now = new Date().getTime();
      const diffInDays = (now - parseInt(dismissTime, 10)) / (1000 * 60 * 60 * 24);
      if (diffInDays < 7) return; 
    }

    const currentLang = window.navigator.language.toLowerCase();
    setIsRo(currentLang.startsWith('ro'));

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIphoneOrIpad = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIphoneOrIpad);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone;

    if (isStandalone) return; 

    if (isIphoneOrIpad) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    } else {
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault(); 
        setDeferredPrompt(e); 
        setIsVisible(true); 
      };
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }
  }, []);

  const handleDismiss = () => {
    const timestamp = new Date().getTime().toString();
    localStorage.setItem('pwa-prompt-dismissed', timestamp);
    const maxAge = 7 * 24 * 60 * 60; 
    document.cookie = `pwa-prompt-dismissed=${timestamp}; max-age=${maxAge}; path=/; SameSite=Lax`;
    setIsVisible(false);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt(); 
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') console.log('Utilizatorul a instalat aplicația.');
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    /* FUNDAL STICLĂ PREMIUM ACUM */
    <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-96 bg-zinc-900/75 border border-white/10 text-white p-4 rounded-xl shadow-2xl z-50 flex flex-col gap-3 backdrop-blur-xl ring-1 ring-black/20">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <img 
            src="/proarh4d.ro-192x192.png" 
            alt="Proarh.4d" 
            className="w-12 h-12 rounded-lg object-cover border border-white/10 bg-zinc-950"
          />
          <div>
            <h4 className="font-semibold text-sm md:text-base text-zinc-100">
              {isRo ? "Instalează Proarh.4d" : "Install Proarh.4d"}
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
              {isIOS ? (
                isRo 
                  ? "Apasă pe iconița 'Share' din Safari și alege 'Add to Home Screen'."
                  : "Tap the 'Share' icon in Safari and choose 'Add to Home Screen'."
              ) : (
                isRo
                  ? "Adaugă aplicația pe ecranul tău pentru un acces rapid și randări fluide."
                  : "Add the app to your home screen for quick access and smooth renders."
              )}
            </p>
          </div>
        </div>
        <button 
          onClick={handleDismiss} 
          className="text-zinc-500 hover:text-white text-sm p-1 transition-colors"
          title={isRo ? "Închide pentru 7 zile" : "Dismiss for 7 days"}
        >
          ✕
        </button>
      </div>
      {!isIOS && (
        <button 
          onClick={handleInstallClick} 
          className="w-full bg-white text-black font-semibold text-sm py-2 px-4 rounded-lg hover:bg-zinc-200 transition-colors shadow-md"
        >
          {isRo ? "Instalează Acum" : "Install Now"}
        </button>
      )}
    </div>
  );
}
