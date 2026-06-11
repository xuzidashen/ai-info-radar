"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isNavActive, mobileNavigationItems } from "@/lib/design/navigation";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 rounded-full border border-white/80 bg-white/88 p-1.5 shadow-[0_-16px_44px_rgba(15,23,42,0.14)] backdrop-blur-2xl">
        {mobileNavigationItems.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={[
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-full text-[0.68rem] font-black transition",
                active ? "bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]" : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
