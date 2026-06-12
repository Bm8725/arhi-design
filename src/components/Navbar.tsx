'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  ShoppingBag, 
  FolderGit2, 
  Briefcase, 
  User, 
  Users,
  Menu, 
  X, 
  ChevronDown 
} from 'lucide-react';
import Image from 'next/image'; //


export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeMobileMenu, setActiveMobileMenu] = useState<string | null>(null);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (isOpen) return;
        if (window.scrollY > lastScrollY && window.scrollY > 80) {
          setShowNavbar(false);
        } else {
          setShowNavbar(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY, isOpen]);

  const navigation = [
    { name: 'Acasă', href: '/', icon: Home },
    { name: 'shop', href: '/404', icon: ShoppingBag },
    { 
      name: 'Portofoliu', 
      href: '/dashboard',
      icon: FolderGit2,
      subOptions: [
        { name: 'Rezidențial', href: '/404' },
        { name: 'Comercial & Office', href: '/404' },
        { name: 'Peisagistică', href: '/404' },
      ]
    },
    { 
      name: 'Servicii', 
      href: '/servicii',
      icon: Briefcase,
      subOptions: [
        { name: 'Design Interior', href: '/DesignInterior' },
        { name: 'Proiectare & Arhitectură', href: '/404' },
        { name: 'Randări 3D & VR', href: '/404' },
        { name: 'Avize & Urbanism (PUD/PUZ)', href: '/UrbanismSection' },
      ]
    },
   { name: 'Noi', href: '/despre', icon: Users },

  ];

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP NAVBAR */}
      {/* ========================================================================= */}
      <div className={`fixed top-0 md:top-6 left-0 w-full z-50 px-0 md:px-6 transition-transform duration-500 hidden md:block ${
        showNavbar ? 'translate-y-0' : '-translate-y-full md:-translate-y-28'
      }`}>
        <nav className="w-full max-w-7xl mx-auto bg-black/40 backdrop-blur-xl border border-white/10 md:rounded-full transition-all duration-300">
          <div className="px-6 md:px-8 h-20 flex items-center justify-between">
            
       {/* LOGO DESKTOP ULTRA-MODERN CU IMAGINE ȘI EFECT DE GLOW */}
<Link href="/" className="flex items-center gap-3.5 group cursor-pointer focus:outline-none select-none">
  {/* Container imagine cu efect de zoom discret la hover */}
  <div className="relative w-9 h-9 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
    <Image
      src="/proarh4d.ro.png"
      alt="Proarh.4d Logo"
      fill
      className="object-contain"
      priority
    />
  </div>

  {/* Textul brandului cu spacing elegant */}
  <span className="text-xl font-light tracking-[0.25em] text-white uppercase transition-colors duration-300">
    Pro<span className="font-semibold text-amber-500 transition-shadow duration-300 group-hover:text-amber-400">arh.4d</span>
  </span>
</Link>


            <div className="flex items-center gap-10 text-xs font-semibold tracking-[0.15em] uppercase text-neutral-400">
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

            <div className="hidden md:block">
              <Link 
                href="/login" 
                className="relative inline-flex items-center justify-center bg-amber-500 text-black rounded-full px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase overflow-hidden transition-all duration-300 hover:bg-amber-400 active:scale-95"
              >
               Contul meu
              </Link>
            </div>

          </div>
        </nav>
      </div>

{/* ========================================================================= */}
{/* 2. MOBILE HEADER LOGO + MY ACCOUNT */}
{/* ========================================================================= */}
<div className="fixed top-0 left-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-white/5 md:hidden h-16 flex items-center justify-between px-4">
  
  {/* Logo-ul mărit și lipit complet în stânga */}
  <Link href="/" className="flex items-center gap-2.5 group">
    <div className="relative w-8 h-8"> {/* Am mărit dimensiunea imaginii aici */}
      <Image
        src="/proarh4d.ro.png"
        alt="Proarh.4d Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
    <span className="text-lg font-light tracking-[0.15em] text-white uppercase">
      Pro<span className="font-semibold text-amber-500">arh.4d</span>
    </span>
  </Link>

  {/* Butonul de cont rămâne fixat în dreapta */}
  <Link 
    href="/login" 
    className={`p-2 rounded-full border transition-all ${
      pathname === '/login' 
        ? 'bg-amber-500 text-black border-amber-500' 
        : 'text-white border-white/10 bg-white/5 hover:bg-white/10'
    }`}
    aria-label="Contul meu"
  >
    <User size={18} />
  </Link>
</div>


      {/* ========================================================================= */}
      {/* 3. MOBILE BOTTOM TAB BAR WITH SUBOPTIONS */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 w-full z-50 px-4 pb-5 pt-2 bg-gradient-to-t from-black via-black/90 to-transparent md:hidden">
        <nav className="w-full bg-[#0d0d0d]/90 backdrop-blur-2xl border border-white/10 rounded-2xl h-16 flex items-center justify-around px-2 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
          {navigation.map((item) => {
            const IconComponent = item.icon;
            const isTabActive = pathname === item.href || (item.subOptions?.some(sub => pathname === sub.href));

            return (
              <div key={item.name} className="flex-1 h-full flex items-center justify-center relative group">

                {/* SUBOPTIONS FLOATING BUBBLE */}
                {item.subOptions && activeMobileMenu === item.name && (
                  <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-52 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl p-2 flex flex-col gap-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] animate-fade-in z-50">
                    {item.subOptions.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          onClick={() => setActiveMobileMenu(null)}
                          className={`text-[10px] tracking-wider py-2 px-3 rounded-lg uppercase transition-all ${
                            isSubActive 
                              ? 'bg-amber-500 text-black font-bold' 
                              : 'text-neutral-400 active:text-white active:bg-white/5'
                          }`}
                        >
                          {sub.name}
                        </Link>
                      );
                    })}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-black border-r border-b border-white/10 rotate-45 -mt-[5px]" />
                  </div>
                )}

                {/* Tab button */}
                {item.subOptions ? (
                  <button
                    onClick={() => setActiveMobileMenu(activeMobileMenu === item.name ? null : item.name)}
                    className="flex flex-col items-center justify-center w-full h-full"
                  >
                    <IconComponent 
                      size={20} 
                      strokeWidth={isTabActive || activeMobileMenu === item.name ? 2.5 : 1.8} 
                      className={`transition-all duration-300 ${
                        isTabActive || activeMobileMenu === item.name ? 'text-amber-500 scale-110' : 'text-neutral-400'
                      }`} 
                    />
                    <span className={`text-[9px] font-medium tracking-wide uppercase mt-1 transition-colors duration-300 ${
                      isTabActive || activeMobileMenu === item.name ? 'text-white font-semibold' : 'text-neutral-500'
                    }`}>
                      {item.name}
                    </span>
                    {(isTabActive || activeMobileMenu === item.name) && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-500" />
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setActiveMobileMenu(null)}
                    className="flex flex-col items-center justify-center w-full h-full"
                  >
                    <IconComponent 
                      size={20} 
                      strokeWidth={isTabActive ? 2.5 : 1.8} 
                      className={`transition-all duration-300 ${
                        isTabActive ? 'text-amber-500 scale-110' : 'text-neutral-400'
                      }`} 
                    />
                    <span className={`text-[9px] font-medium tracking-wide uppercase mt-1 transition-colors duration-300 ${
                      isTabActive ? 'text-white font-semibold' : 'text-neutral-500'
                    }`}>
                      {item.name === 'shop' ? 'Shop' : item.name}
                    </span>
                    {isTabActive && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-500" />
                    )}
                  </Link>
                )}

              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}