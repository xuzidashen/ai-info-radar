import type { ReactNode } from "react";

type GradientBackgroundProps = {
  children: ReactNode;
};

export function GradientBackground({ children }: GradientBackgroundProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f7fbff_0%,#eef6ff_46%,#f8fbff_100%)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.52] [background-image:linear-gradient(rgba(14,165,233,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,.06)_1px,transparent_1px)] [background-size:44px_44px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_5%,rgba(56,189,248,.18),transparent_28%),radial-gradient(circle_at_82%_0%,rgba(99,102,241,.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,.72),transparent_32%)]"
      />
      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
}
