'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
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
  ShoppingCart,
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
  const [userRole, setUserRole] = useState<string | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const desktopNotifRef = useRef<HTMLDivElement>(null);
  const mobileNotifRef = useRef<HTMLDivElement>(null);

  // Coș (produse din comanda "pending" a userului)
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const pendingOrderIdRef = useRef<string | null>(null);

  useEffect(() => {
    pendingOrderIdRef.current = pendingOrderId;
  }, [pendingOrderId]);

  // unreadCount se calculează mereu din notifications, nu se ține separat în state.
  // Așa nu se poate desincroniza niciodată de realitate.
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.citit).length,
    [notifications]
  );

  const supabase = createClient();

  // ── Dashboard href bazat pe rol ──────────────────────────────────────────
  const dashboardHref = !userId
    ? '/login'
    : userRole === 'superadmin' || userRole === 'angajat'
      ? '/dashboard/admin'
      : '/dashboard/client';

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('full_name, rol')
          .eq('id', user.id)
          .single();
        if (error) console.error('Eroare la fetch profil:', error);
        setUserName(profile?.full_name ?? user.email?.split('@')[0] ?? null);
        setUserRole(profile?.rol ?? null);
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        supabase
          .from('profiles')
          .select('full_name, rol')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) console.error('Eroare la fetch profil:', error);
            setUserName(data?.full_name ?? session.user!.email?.split('@')[0] ?? null);
            setUserRole(data?.rol ?? null);
          });
      } else {
        setUserId(null);
        setUserName(null);
        setUserRole(null);
        setNotifications([]);
        setPendingOrderId(null);
        setCartCount(0);
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
      .limit(30)
      .then(({ data, error }) => {
        if (error) {
          console.error('Eroare la fetch notificări:', error);
          return;
        }
        if (data) setNotifications(data);
      });

    const channel = supabase
      .channel(`navbar-notif-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        const n = payload.new as Notification;
        setNotifications((prev) => [n, ...prev]);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        const updated = payload.new as Notification;
        setNotifications((prev) =>
          prev.map((n) => (n.id === updated.id ? updated : n))
        );
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        const removedId = (payload.old as Partial<Notification>).id;
        setNotifications((prev) => prev.filter((n) => n.id !== removedId));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  // ── Coș: găsim comanda "pending" a userului ─────────────────────────────
  useEffect(() => {
    if (!userId) {
      setPendingOrderId(null);
      setCartCount(0);
      return;
    }

    const fetchPendingOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Eroare la fetch comandă în curs:', error);
        return;
      }
      setPendingOrderId(data?.id ?? null);
    };
    fetchPendingOrder();

    // Ne abonăm la schimbări pe orders, ca să prindem momentul în care
    // se creează o comandă "pending" nouă (primul produs adăugat în coș)
    // sau când comanda curentă își schimbă statusul (ex: a fost plătită).
    const ordersChannel = supabase
      .channel(`navbar-orders-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const removedId = (payload.old as { id?: string }).id;
          if (removedId === pendingOrderIdRef.current) {
            setPendingOrderId(null);
            setCartCount(0);
          }
          return;
        }

        const row = payload.new as { id: string; status: string };
        if (row.status === 'pending') {
          setPendingOrderId(row.id);
        } else if (row.id === pendingOrderIdRef.current) {
          // comanda curentă a fost plătită/anulată -> coșul se golește
          setPendingOrderId(null);
          setCartCount(0);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(ordersChannel); };
  }, [userId]);

  // ── Coș: numărăm produsele din comanda pending + realtime ──────────────
  useEffect(() => {
    if (!pendingOrderId) {
      setCartCount(0);
      return;
    }

    const fetchCartCount = async () => {
      const { count, error } = await supabase
        .from('order_items')
        .select('id', { count: 'exact', head: true })
        .eq('order_id', pendingOrderId);

      if (error) {
        console.error('Eroare la fetch produse din coș:', error);
        return;
      }
      setCartCount(count ?? 0);
    };
    fetchCartCount();

    const itemsChannel = supabase
      .channel(`navbar-cart-items-${pendingOrderId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'order_items',
        filter: `order_id=eq.${pendingOrderId}`,
      }, () => {
        setCartCount((c) => c + 1);
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'order_items',
        filter: `order_id=eq.${pendingOrderId}`,
      }, () => {
        setCartCount((c) => Math.max(0, c - 1));
      })
      .subscribe();

    return () => { supabase.removeChannel(itemsChannel); };
  }, [pendingOrderId]);

  // ── Click outside ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const clickedDesktop = desktopNotifRef.current?.contains(e.target as Node);
      const clickedMobile = mobileNotifRef.current?.contains(e.target as Node);
      if (!clickedDesktop && !clickedMobile) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAsRead = async (id: string) => {
    // Update optimist în UI, apoi trimitem cererea. Dacă eșuează, revenim.
    const prevState = notifications;
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, citit: true } : n)));

    const { error } = await supabase.from('notifications').update({ citit: true }).eq('id', id);
    if (error) {
      console.error('Eroare la marcare notificare ca citită:', error);
      setNotifications(prevState); // revert
    }
  };

  const markAllAsRead = async () => {
    if (!userId || unreadCount === 0) return;

    const prevState = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, citit: true })));

    const { error } = await supabase
      .from('notifications')
      .update({ citit: true })
      .eq('user_id', userId)
      .eq('citit', false);

    if (error) {
      console.error('Eroare la marcare toate ca citite:', error);
      setNotifications(prevState); // revert
    }
  };

  // ── Scroll ────────────────────────────────────────────────────────────────
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
    { name: 'Shop', href: '/shop', icon: ShoppingBag },
    { 
      name: 'Portofoliu', 
      href: '/dashboard',
      icon: FolderGit2,
      subOptions: [
        { name: 'Proiecte proarh.4d', href: '/portofoliu' },

      ]
    },
    { 
      name: 'Servicii', 
      href: '/servicii',
      icon: Briefcase,
      subOptions: [
     
        { name: 'Proiectare & Arhitectură', href: '/proiectare-arhitectura' },
        { name: 'Randări 3D ', href: '/randari-3d' },

      ]
    },
    { name: 'cart', href: '/shopping-cart', icon: ShoppingCart },
  ];

  // ── Lista notificări (shared) ─────────────────────────────────────────────
  const NotifList = () => (
    <>
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
          <button
            onClick={() => setShowNotifDropdown(false)}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
        {notifications.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-8">
            Nu ai nicio notificare.
          </p>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.citit && markAsRead(notif.id)}
              className={`px-4 py-3 cursor-pointer transition-colors hover:bg-white/5 ${
                notif.citit ? 'opacity-50' : 'border-l-2 border-amber-500'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-white text-xs leading-snug">{notif.titlu}</h4>
                {!notif.citit && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                )}
              </div>
              {notif.mesaj && (
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">{notif.mesaj}</p>
              )}
              {notif.link && (
                <a href={notif.link} className="text-[11px] text-amber-400 underline block mt-1">
                  Vezi detalii →
                </a>
              )}
              <span className="text-[10px] text-neutral-600 mt-1 block">
                {new Date(notif.created_at).toLocaleDateString('ro-RO', {
                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );

  return (
    <>
      {/* ================================================================= */}
      {/* 1. DESKTOP NAVBAR                                                  */}
      {/* ================================================================= */}
      <div className={`fixed top-0 md:top-6 left-0 w-full z-50 px-0 md:px-6 transition-transform duration-500 hidden md:block ${
        showNavbar ? 'translate-y-0' : '-translate-y-full md:-translate-y-28'
      }`}>
        <nav className="w-full max-w-7xl mx-auto bg-black/40 backdrop-blur-xl border border-white/10 md:rounded-full transition-all duration-300">
          <div className="px-6 md:px-8 h-20 flex items-center justify-between">

            {/* LOGO */}
            <Link href="/" className="flex items-center gap-3.5 group cursor-pointer focus:outline-none select-none">
              <div className="relative w-14 h-14 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                <Image src="/arhi4d.png" alt="Proarh.4d Logo" fill className="object-contain" priority />
              </div>
              <span className="text-xl font-light tracking-[0.25em] text-white uppercase">
                Pro<span className="font-semibold text-amber-500 group-hover:text-amber-400 transition-colors duration-300">arh.4d</span>
              </span>
            </Link>

            {/* NAV LINKS */}
            <div className="flex items-center gap-10 text-xs font-bold tracking-[0.15em] uppercase">
              {navigation.map((item) => (
                <div
                  key={item.name}
                  className="relative list-none"
                  onMouseEnter={() => item.subOptions && setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {item.subOptions ? (
                    <button className="flex items-center gap-1 py-2 cursor-pointer focus:outline-none text-white [text-shadow:0_0_10px_rgba(0,0,0,1),0_2px_8px_rgba(0,0,0,1),-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000] hover:text-amber-400 transition-colors duration-300">
                      {item.name}
                      <ChevronDown size={14} className={`transition-transform duration-300 ${activeDropdown === item.name ? 'rotate-180 text-amber-500' : ''}`} />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className="relative flex items-center gap-1.5 py-2 text-white [text-shadow:0_0_10px_rgba(0,0,0,1),0_2px_8px_rgba(0,0,0,1),-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000] hover:text-amber-400 transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-amber-500 hover:after:w-full after:transition-all after:duration-300"
                    >
                      {item.name}
                      {item.name === 'cart' && cartCount > 0 && (
                        <span className="flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-black text-[9px] font-bold leading-none">
                          {cartCount > 9 ? '9+' : cartCount}
                        </span>
                      )}
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

            {/* RIGHT: Bell + Buton cont */}
            <div className="hidden md:flex items-center gap-3">
              {userId && (
                <div ref={desktopNotifRef} className="relative">
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
                  {showNotifDropdown && (
                    <div className="absolute right-0 top-full mt-3 w-80 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-[100] overflow-hidden">
                      <NotifList />
                    </div>
                  )}
                </div>
              )}

              <Link
                href={dashboardHref}
                className="relative inline-flex items-center justify-center bg-amber-500 text-black rounded-full px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 hover:bg-amber-400 active:scale-95 max-w-[160px] truncate"
              >
                {userName ?? 'Contul meu'}
              </Link>
            </div>

          </div>
        </nav>
      </div>

      {/* ================================================================= */}
      {/* 2. MOBILE HEADER                                                   */}
      {/* ================================================================= */}
      <div className="fixed top-0 left-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-white/5 md:hidden h-16 flex items-center justify-between px-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-11 h-11">
            <Image src="/arhi4d.png" alt="Proarh.4d Logo" fill className="object-contain" priority />
          </div>
          <span className="text-lg font-light tracking-[0.15em] text-white uppercase">
            Pro<span className="font-semibold text-amber-500">arh.4d</span>
          </span>
        </Link>

        {/* Dreapta: Bell + User */}
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

              {/* Dropdown mobile — fixed, sub header, full width cu margini */}
              {showNotifDropdown && (
                <div className="fixed top-16 left-0 right-0 mx-3 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[100] overflow-hidden">
                  <NotifList />
                </div>
              )}
            </div>
          )}

          {/* Buton user */}
          <Link
            href={dashboardHref}
            className={`p-2 rounded-full border transition-all ${
              pathname === '/login' || pathname.startsWith('/dashboard')
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
      {/* 3. MOBILE BOTTOM TAB BAR                                           */}
      {/* ================================================================= */}
      <div className="fixed bottom-0 left-0 w-full z-50 px-4 pb-5 pt-2 bg-gradient-to-t from-black via-black/90 to-transparent md:hidden">
        <nav className="w-full bg-[#0d0d0d]/90 backdrop-blur-2xl border border-white/10 rounded-2xl h-16 flex items-center justify-around px-2 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
          {navigation.map((item) => {
            const IconComponent = item.icon;
            const isTabActive = pathname === item.href || (item.subOptions?.some(sub => pathname === sub.href));
            const isCartTab = item.name === 'cart';

            return (
              <div key={item.name} className="flex-1 h-full flex items-center justify-center relative">

                {item.subOptions && activeMobileMenu === item.name && (
                  <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-52 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl p-2 flex flex-col gap-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] z-50">
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
                    {(isTabActive || activeMobileMenu === item.name) && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-500" />
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setActiveMobileMenu(null)}
                    className="relative flex flex-col items-center justify-center w-full h-full"
                  >
                    <span className="relative">
                      <IconComponent size={20} strokeWidth={isTabActive ? 2.5 : 1.8}
                        className={`transition-all duration-300 ${isTabActive ? 'text-amber-500 scale-110' : 'text-neutral-400'}`}
                      />
                      {isCartTab && cartCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 bg-amber-500 text-black text-[9px] font-bold min-w-[15px] h-[15px] px-[3px] rounded-full flex items-center justify-center leading-none">
                          {cartCount > 9 ? '9+' : cartCount}
                        </span>
                      )}
                    </span>
                    <span className={`text-[9px] font-medium tracking-wide uppercase mt-1 transition-colors duration-300 ${
                      isTabActive ? 'text-white font-semibold' : 'text-neutral-500'
                    }`}>
                      {item.name}
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