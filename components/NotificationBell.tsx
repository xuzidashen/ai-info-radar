"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const response = await fetch("/api/notifications?read=false&limit=1", { cache: "no-store" });
        const data = (await response.json()) as { unreadCount?: number };

        if (mounted) {
          setUnreadCount(data.unreadCount ?? 0);
        }
      } catch {
        if (mounted) {
          setUnreadCount(0);
        }
      }
    }

    void load();
    const timer = window.setInterval(load, 30000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <Link
      href="/notifications"
      aria-label="通知中心"
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/82 text-slate-600 shadow-sm transition hover:border-sky-200 hover:text-sky-700"
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-amber-400 px-1.5 py-0.5 text-center text-[0.65rem] font-black leading-none text-slate-950">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
