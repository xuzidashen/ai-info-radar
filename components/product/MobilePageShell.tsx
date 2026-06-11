import type { ReactNode } from "react";

export function MobilePageShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[92rem] space-y-6 ${className}`}>{children}</div>;
}
