'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileSubOpen, setMobileSubOpen] = useState<string | null>(null);
  
  // Stări pentru auto-ascundere la scroll
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        // Dacă meniul mobil este deschis, NU ascunde navbar-ul
        if (isOpen) return;

        if (window.scrollY > lastScrollY && window.scrollY > 80) {
          // Scroll în jos -> ascunde navbar
          setShowNavbar(false);
        } else {
          // Scroll în sus -> arată navbar
          setShowNavbar(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY, isOpen]);

  const navigation = [
    { name: 'Acasă', href: '/' },
    { 
      name: 'Portofoliu', 
      href: '/dashboard',
      subOptions: [
        { name: 'Rezidențial', href: '/404' },
        { name: 'Comercial & Office', href: '/404' },
        { name: 'Peisagistică', href: '/dashboard' },
      ]
    },
    { 
      name: 'Servicii', 
      href: '/servicii',
      subOptions: [
        { name: 'Design Interior', href: '/DesignInterior' },
        { name: 'Proiectare & Arhitectură', href: '/Arhiservices' },
        { name: 'Randări 3D & VR', href: '/404' },
        { name: 'Avize & Urbanism (PUD/PUZ)', href: '/UrbanismSection' },
      ]
    },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      {/* WRAPPER INSULĂ: Margini md:top-6 și lățime max-w-7xl pentru efectul plutitor */}
      <div className={`fixed top-0 md:top-6 left-0 w-full z-50 px-0 md:px-6 transition-transform duration-500 ${
        showNavbar ? 'translate-y-0' : '-translate-y-full md:-translate-y-28'
      }`}>
        
        {/* STRUCTURA NAV TIP INSULĂ CYBER/PREMIUM */}
        <nav className="w-full max-w-7xl mx-auto bg-black/40 backdrop-blur-xl border border-white/10 md:rounded-full transition-all duration-300">
          <div className="px-6 md:px-8 h-20 flex items-center justify-between">
            
            {/* LOGO */}
            <Link href="/" className="text-xl font-light tracking-[0.25em] text-white uppercase group">
              Arhi<span className="font-semibold text-amber-500 transition-colors duration-300">.Design</span>
            </Link>

            {/* DESKTOP NAVIGATION */}
            <div className="hidden md:flex items-center gap-10 text-xs font-semibold tracking-[0.15em] uppercase text-neutral-400">
              {navigation.map((item) => (
                <div 
                  key={item.name} 
                  className="relative list-none"
                  onMouseEnter={() => item.subOptions && setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {item.subOptions ? (
                    <button className="flex items-center gap-1 py-2 hover:text-white transition-colors duration-300 cursor-pointer focus:outline-none">
                      {item.name}
                      <ChevronDown size={14} className={`transition-transform duration-300 ${activeDropdown === item.name ? 'rotate-180 text-amber-500' : ''}`} />
                    </button>
                  ) : (
                    <Link 
                      href={item.href} 
                      className="relative py-2 hover:text-white transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-amber-500 hover:after:w-full after:transition-all after:duration-300"
                    >
                      {item.name}
                    </Link>
                  )}

                  {/* DESKTOP DROPDOWN MENU (Tip Insulă Asortat) */}
                  {item.subOptions && (
                    <div className={`absolute left-0 top-full pt-4 w-64 transition-all duration-300 ${
                      activeDropdown === item.name ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
                    }`}>
                      <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        {item.subOptions.map((sub) => (
                          <Link 
                            key={sub.name} 
                            href={sub.href}
                            className="text-[11px] tracking-wider text-neutral-400 hover:text-white transition-colors duration-200 py-1 border-b border-transparent hover:border-white/5"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* DESKTOP CTA BUTTON (Rotunjit ca Insula) */}
            <div className="hidden md:block">
              <Link 
                href="/contact" 
                className="relative inline-flex items-center justify-center bg-amber-500 text-black rounded-full px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase overflow-hidden transition-all duration-300 hover:bg-amber-400 active:scale-95"
              >
                Consultanță
              </Link>
            </div>

            {/* MOBILE HAMBURGER BUTTON */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-white hover:text-amber-500 transition-colors focus:outline-none z-50"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
            </button>
          </div>
        </nav>
      </div>

      {/* MOBILE MENU CURTAIN (Adaptat la fundalul întunecat al site-ului) */}
      <div className={`fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl md:hidden transition-all duration-500 ease-in-out ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="flex flex-col h-full justify-between px-8 pt-28 pb-8 overflow-y-auto">
          
          {/* MOBILE LINKS */}
          <div className="flex flex-col gap-4">
            {navigation.map((item, index) => (
              <div key={item.name} className="flex flex-col">
                {item.subOptions ? (
                  <>
                    <button
                      onClick={() => setMobileSubOpen(mobileSubOpen === item.name ? null : item.name)}
                      className={`text-2xl font-light tracking-wide text-white uppercase flex items-center justify-between py-2 border-b border-white/10 transition-all duration-300 ${
                        isOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                      }`}
                      style={{ transitionDelay: `${index * 40}ms` }}
                    >
                      {item.name}
                      <ChevronDown size={20} className={`transition-transform duration-300 ${mobileSubOpen === item.name ? 'rotate-180 text-amber-500' : 'text-white'}`} />
                    </button>
                    
                    {/* MOBILE SUBOPTIONS (ACCORDION) */}
                    <div className={`flex flex-col gap-3 pl-4 overflow-hidden transition-all duration-300 ease-in-out ${
                      mobileSubOpen === item.name ? 'max-h-60 opacity-100 pt-3 pb-2' : 'max-h-0 opacity-0'
                    }`}>
                      {item.subOptions.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          onClick={() => setIsOpen(false)}
                          className="text-sm tracking-wide text-neutral-400 hover:text-white uppercase"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-2xl font-light tracking-wide text-white uppercase py-2 border-b border-white/10 transition-all duration-300 ${
                      isOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                    }`}
                    style={{ transitionDelay: `${index * 40}ms` }}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* MOBILE CTA */}
          <div className={`w-full transition-all duration-500 delay-200 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="w-full inline-flex items-center justify-center bg-amber-500 text-black font-bold py-4 text-xs tracking-widest uppercase rounded-full"
            >
              Consultanță
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
