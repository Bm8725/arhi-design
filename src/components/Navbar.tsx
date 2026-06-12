'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  ShoppingBag, 
  FolderGit2, 
  Briefcase, 
  User, 
  Users,
  ChevronDown,
  Bell,
  X
} from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

interface Notification {
  id: string;
  titlu: string;
  mesaj: string | null;
  citit: boolean;
  link: string | null;
  created_at: string;
}

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeMobileMenu, setActiveMobileMenu] = useState<string | null>(null);

  // Auth
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const mobileNotifRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        setUserName(profile?.full_name ?? user.email?.split('@')[0] ?? null);
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            setUserName(data?.full_name ?? session.user!.email?.split('@')[0] ?? null);
          });
      } else {
        setUserId(null);
        setUserName(null);
        setNotifications([]);
        setUnreadCount(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Notifications ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setNotifications(data);
          setUnreadCount(data.filter((n) => !n.citit).length);
        }
      });

    const channel = supabase
      .channel('navbar-notif')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        const n = payload.new as Notification;
        setNotifications((prev) => [n, ...prev]);
        setUnreadCount((prev) => prev + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  // ── Click outside notif dropdown ──────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        notifRef.current && !notifRef.current.contains(e.target as Node) &&
        mobileNotifRef.current && !mobileNotifRef.current.contains(e.target as Node)
      ) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ citit: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, citit: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    await supabase.from('notifications').update({ citit: true }).eq('user_id', userId).eq('citit', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, citit: true })));
    setUnreadCount(0);
  };

  // ── Scroll hide/show ──────────────────────────────────────────────────────
  useEffect(() => {
    const controlNavbar = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 80) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(window.scrollY);
    };
    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  const navigation = [
    { name: 'Acasă', href: '/', icon: Home },
    { name: 'shop', href: '/shop', icon: ShoppingBag },
    { 
      name: 'Portofoliu', 
      href: '/dashboard',
      icon: FolderGit2,
      subOptions: [
        { name: 'Rezidențial', href: '/noi' },
        { name: 'Comercial & Office', href: '/noi' },
        { name: 'Peisagistică', href: '/noi' },
      ]
    },
    { 
      name: 'Servicii', 
      href: '/servicii',
      icon: Briefcase,
      subOptions: [
        { name: 'Design Interior', href: '/DesignInterior' },
        { name: 'Proiectare & Arhitectură', href: '/noi' },
        { name: 'Randări 3D & VR', href: '/noi' },
        { name: 'Avize & Urbanism (PUD/PUZ)', href: '/UrbanismSection' },
      ]
    },
    { name: 'Noi', href: '/noi', icon: Users },
  ];

  // ── Dropdown notificări (shared UI) ───────────────────────────────────────
  const NotifDropdown = () => (
    <div className="absolute right-0 top-full mt-3 w-80 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-[100] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-sm font-semibold text-white">Notificări</span>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[10px] text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider"
            >
              Marchează toate
            </button>
          )}
          <button onClick={() => setShowNotifDropdown(false)} className="text-neutral-500 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
        {notifications.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-8">Nu ai nicio notificare.</p>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={`px-4 py-3 text-sm cursor-pointer transition-colors hover:bg-white/5 ${
                notif.citit ? 'opacity-50' : 'border-l-2 border-amber-500'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-white text-xs">{notif.titlu}</h4>
                {!notif.citit && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0" />}
              </div>
              {notif.mesaj && <p className="text-[11px] text-neutral-400 mt-0.5">{notif.mesaj}</p>}
              {notif.link && (
                <a href={notif.link} className="text-[11px] text-amber-400 underline block mt-1">
                  Vezi detalii →
                </a>
              )}
              <span className="text-[10px] text-neutral-600 mt-1 block">
                {new Date(notif.created_at).toLocaleDateString('ro-RO', {
                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ================================================================= */}
      {/* 1. DESKTOP NAVBAR — nemodificat structural față de original        */}
      {/* ================================================================= */}
      <div className={`fixed top-0 md:top-6 left-0 w-full z-50 px-0 md:px-6 transition-transform duration-500 hidden md:block ${
        showNavbar ? 'translate-y-0' : '-translate-y-full md:-translate-y-28'
      }`}>
        <nav className="w-full max-w-7xl mx-auto bg-black/40 backdrop-blur-xl border border-white/10 md:rounded-full transition-all duration-300">
          <div className="px-6 md:px-8 h-20 flex items-center justify-between">

            {/* LOGO */}
            <Link href="/" className="flex items-center gap-3.5 group cursor-pointer focus:outline-none select-none">
              <div className="relative w-9 h-9 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                <Image src="/proarh4d.ro.png" alt="Proarh.4d Logo" fill className="object-contain" priority />
              </div>
              <span className="text-xl font-light tracking-[0.25em] text-white uppercase transition-colors duration-300">
                Pro<span className="font-semibold text-amber-500 transition-shadow duration-300 group-hover:text-amber-400">arh.4d</span>
              </span>
            </Link>

            {/* NAV LINKS */}
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
                    <Link href={item.href} className="relative py-2 hover:text-white transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-amber-500 hover:after:w-full after:transition-all after:duration-300">
                      {item.name}
                    </Link>
                  )}

                  {item.subOptions && (
                    <div className={`absolute left-0 top-full pt-4 w-64 transition-all duration-300 ${
                      activeDropdown === item.name ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
                    }`}>
                      <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        {item.subOptions.map((sub) => (
                          <Link key={sub.name} href={sub.href} className="text-[11px] tracking-wider text-neutral-400 hover:text-white transition-colors duration-200 py-1 border-b border-transparent hover:border-white/5">
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* RIGHT: Bell + Buton cont */}
            <div className="hidden md:flex items-center gap-3">
              {/* Bell — apare doar dacă e logat */}
              {userId && (
                <div ref={notifRef} className="relative">
                  <button
                    onClick={() => setShowNotifDropdown((v) => !v)}
                    className="relative p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all"
                  >
                    <Bell size={16} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifDropdown && <NotifDropdown />}
                </div>
              )}

              {/* Buton login / nume */}
              <Link
                href="/login"
                className="relative inline-flex items-center justify-center bg-amber-500 text-black rounded-full px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase overflow-hidden transition-all duration-300 hover:bg-amber-400 active:scale-95 max-w-[160px] truncate"
              >
                {userName ?? 'Contul meu'}
              </Link>
            </div>

          </div>
        </nav>
      </div>

      {/* ================================================================= */}
      {/* 2. MOBILE HEADER — identic cu originalul, + bell dacă e logat     */}
      {/* ================================================================= */}
      <div className="fixed top-0 left-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-white/5 md:hidden h-16 flex items-center justify-between px-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8">
            <Image src="/proarh4d.ro.png" alt="Proarh.4d Logo" fill className="object-contain" priority />
          </div>
          <span className="text-lg font-light tracking-[0.15em] text-white uppercase">
            Pro<span className="font-semibold text-amber-500">arh.4d</span>
          </span>
        </Link>

        {/* Dreapta: Bell (dacă logat) + buton user */}
        <div className="flex items-center gap-2">

          {/* Bell mobile */}
          {userId && (
            <div ref={mobileNotifRef} className="relative">
              <button
                onClick={() => setShowNotifDropdown((v) => !v)}
                className="relative p-2 rounded-full border border-white/10 bg-white/5 text-white"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {/* Dropdown aliniat la dreapta ecranului pe mobile */}
              {showNotifDropdown && (
                <div className="absolute right-0 top-full mt-3 w-[calc(100vw-2rem)] max-w-sm bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-[100] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <span className="text-sm font-semibold text-white">Notificări</span>
                    <div className="flex items-center gap-3">
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-[10px] text-amber-400 uppercase tracking-wider">
                          Marchează toate
                        </button>
                      )}
                      <button onClick={() => setShowNotifDropdown(false)} className="text-neutral-500 hover:text-white">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-neutral-500 text-center py-8">Nu ai nicio notificare.</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className={`px-4 py-3 text-sm cursor-pointer transition-colors hover:bg-white/5 ${
                            notif.citit ? 'opacity-50' : 'border-l-2 border-amber-500'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-white text-xs">{notif.titlu}</h4>
                            {!notif.citit && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0" />}
                          </div>
                          {notif.mesaj && <p className="text-[11px] text-neutral-400 mt-0.5">{notif.mesaj}</p>}
                          {notif.link && <a href={notif.link} className="text-[11px] text-amber-400 underline block mt-1">Vezi detalii →</a>}
                          <span className="text-[10px] text-neutral-600 mt-1 block">
                            {new Date(notif.created_at).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Buton user — exact ca originalul, href mereu /login */}
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
      </div>

      {/* ================================================================= */}
      {/* 3. MOBILE BOTTOM TAB BAR — identic cu originalul                  */}
      {/* ================================================================= */}
      <div className="fixed bottom-0 left-0 w-full z-50 px-4 pb-5 pt-2 bg-gradient-to-t from-black via-black/90 to-transparent md:hidden">
        <nav className="w-full bg-[#0d0d0d]/90 backdrop-blur-2xl border border-white/10 rounded-2xl h-16 flex items-center justify-around px-2 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
          {navigation.map((item) => {
            const IconComponent = item.icon;
            const isTabActive = pathname === item.href || (item.subOptions?.some(sub => pathname === sub.href));

            return (
              <div key={item.name} className="flex-1 h-full flex items-center justify-center relative group">

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
                            isSubActive ? 'bg-amber-500 text-black font-bold' : 'text-neutral-400 active:text-white active:bg-white/5'
                          }`}
                        >
                          {sub.name}
                        </Link>
                      );
                    })}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-black border-r border-b border-white/10 rotate-45 -mt-[5px]" />
                  </div>
                )}

                {item.subOptions ? (
                  <button
                    onClick={() => setActiveMobileMenu(activeMobileMenu === item.name ? null : item.name)}
                    className="flex flex-col items-center justify-center w-full h-full"
                  >
                    <IconComponent size={20} strokeWidth={isTabActive || activeMobileMenu === item.name ? 2.5 : 1.8}
                      className={`transition-all duration-300 ${isTabActive || activeMobileMenu === item.name ? 'text-amber-500 scale-110' : 'text-neutral-400'}`}
                    />
                    <span className={`text-[9px] font-medium tracking-wide uppercase mt-1 transition-colors duration-300 ${
                      isTabActive || activeMobileMenu === item.name ? 'text-white font-semibold' : 'text-neutral-500'
                    }`}>
                      {item.name}
                    </span>
                    {(isTabActive || activeMobileMenu === item.name) && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-500" />}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setActiveMobileMenu(null)}
                    className="flex flex-col items-center justify-center w-full h-full"
                  >
                    <IconComponent size={20} strokeWidth={isTabActive ? 2.5 : 1.8}
                      className={`transition-all duration-300 ${isTabActive ? 'text-amber-500 scale-110' : 'text-neutral-400'}`}
                    />
                    <span className={`text-[9px] font-medium tracking-wide uppercase mt-1 transition-colors duration-300 ${
                      isTabActive ? 'text-white font-semibold' : 'text-neutral-500'
                    }`}>
                      {item.name === 'shop' ? 'Shop' : item.name}
                    </span>
                    {isTabActive && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-500" />}
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