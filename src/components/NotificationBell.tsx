"use client";

import { useEffect, useState } from "react";
import { createClient } from '@/lib/supabase/client'

interface Notification {
  id: string;
  titlu: string;
  mesaj: string | null;
  citit: boolean;
  link: string | null;
  created_at: string;
}

export default function NotificationBell({ currentUserId }: { currentUserId: string }) {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // 1. Preluarea notificărilor existente la încărcarea paginii
  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false });

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.citit).length);
      }
    };

    fetchNotifications();

    // 2. Ascultarea în timp real (Realtime) pentru notificări NOI
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT", // Ascultă doar când se adaugă rânduri noi
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${currentUserId}`, // Doar notificările utilizatorului curent
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
          
          // Opțional: Poți folosi Web Notifications API pentru a trimite notificare pe desktop:
          if (Notification.permission === "granted") {
            new Notification(newNotif.titlu, { body: newNotif.mesaj || "" });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, supabase]);

  // 3. Funcție pentru a marca o notificare ca citită
  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ citit: true })
      .eq("id", id);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, citit: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  return (
    <div className="relative p-4 bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Notificări</h3>
        {unreadCount > 0 && (
          <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
            {unreadCount} noi
          </span>
        )}
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-4">Nu ai nicio notificare.</p>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={`p-3 rounded-lg text-sm transition cursor-pointer ${
                notif.citit ? "bg-zinc-950 text-zinc-400" : "bg-zinc-800 text-white border-l-4 border-amber-500"
              }`}
            >
              <h4 className="font-semibold">{notif.titlu}</h4>
              {notif.mesaj && <p className="text-xs mt-1 text-zinc-300">{notif.mesaj}</p>}
              {notif.link && (
                <a href={notif.link} className="text-xs text-amber-400 underline block mt-2">
                  Vezi detalii
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
