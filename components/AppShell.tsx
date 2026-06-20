"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { NotificationBell } from "@/components/NotificationBell";
import { DesktopSidebar, ProductMark } from "@/components/product/DesktopSidebar";
import { MobileBottomNav } from "@/components/product/MobileBottomNav";
import { GradientBackground } from "@/components/ui/GradientBackground";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/" || pathname.startsWith("/redesign")) {
    return children;
  }

  return (
    <GradientBackground>
      <DesktopSidebar />

      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/78 px-4 py-3 backdrop-blur-2xl lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <ProductMark compact />
          <NotificationBell />
        </div>
      </header>

      <main className="px-4 pb-[calc(7.5rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 lg:ml-72 lg:px-9 lg:py-8">{children}</main>
      <MobileBottomNav />
    </GradientBackground>
  );
}
