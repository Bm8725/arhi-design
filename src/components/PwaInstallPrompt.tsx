'use client';

import { useEffect, useState } from 'react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Verifică dacă utilizatorul a închis recent pop-up-ul (în ultimele 7 zile)
    const dismissTime = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissTime) {
      const now = new Date().getTime();
      const diffInDays = (now - parseInt(dismissTime, 10)) / (1000 * 60 * 60 * 24);
      if (diffInDays < 7) {
        return; // Ascunde pop-up-ul dacă nu au trecut 7 zile
      }
    }

    // 2. Detectează dacă dispozitivul este iOS (iPhone/iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIphoneOrIpad = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIphoneOrIpad);

    // 3. Verifică dacă aplicația rulează deja ca PWA standalone (deja instalată)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone;

    if (isStandalone) return; 

    if (isIphoneOrIpad) {
      // Pe iOS afișăm instrucțiunile după 3 secunde
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    } else {
      // Pentru Android/PC ascultăm evenimentul nativ de instalare
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault(); 
        setDeferredPrompt(e); 
        setIsVisible(true); 
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  // Funcție apelată când utilizatorul apasă pe ✕ (Închide)
  const handleDismiss = () => {
    localStorage.setItem('pwa-prompt-dismissed', new Date().getTime().toString());
    setIsVisible(false);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt(); 
    
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('Utilizatorul a instalat aplicația.');
    }
    
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-96 bg-zinc-950 border border-zinc-800 text-white p-4 rounded-xl shadow-2xl z-50 flex flex-col gap-3 backdrop-blur-md bg-opacity-95">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          {/* Iconița aplicației în interiorul pop-up-ului */}
          <img 
            src="/proarh4d.ro-192x192.png" 
            alt="Proarh.4d" 
            className="w-12 h-12 rounded-lg object-cover border border-zinc-800"
          />
          <div>
            <h4 className="font-semibold text-sm md:text-base text-zinc-100">Instalează Proarh.4d</h4>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
              {isIOS 
                ? "Apasă pe iconița 'Share' (Trimite) din Safari și alege 'Add to Home Screen'."
                : "Adaugă aplicația pe ecranul tău pentru un acces rapid și randări fluide."}
            </p>
          </div>
        </div>
        <button 
          onClick={handleDismiss} 
          className="text-zinc-500 hover:text-white text-sm p-1 transition-colors"
          title="Închide pentru 7 zile"
        >
          ✕
        </button>
      </div>

      {!isIOS && (
        <button
          onClick={handleInstallClick}
          className="w-full bg-white text-black font-semibold text-sm py-2 px-4 rounded-lg hover:bg-zinc-200 transition-colors shadow-md"
        >
          Instalează Acum
        </button>
      )}
    </div>
  );
}
