export const designTokens = {
  surfaces: {
    page: "bg-[linear-gradient(180deg,#f7fbff_0%,#eef6ff_48%,#f8fbff_100%)]",
    shell: "bg-white/72 backdrop-blur-2xl border border-white/80",
    card: "bg-white/86 backdrop-blur-xl border border-white/80",
    cardMuted: "bg-[#f6f9fd]/86 border border-slate-200/70",
    hero: "bg-slate-950 text-white",
    inset: "bg-slate-950/[0.035] border border-slate-200/70",
    darkInset: "bg-slate-950/86 border border-white/10 text-white"
  },
  colors: {
    ink: "text-slate-950",
    muted: "text-slate-500",
    subtle: "text-slate-400",
    brand: "text-sky-700",
    cyan: "text-cyan-700",
    success: "text-emerald-700",
    warning: "text-amber-700",
    danger: "text-rose-700"
  },
  radius: {
    card: "rounded-[28px]",
    panel: "rounded-[22px]",
    small: "rounded-2xl",
    pill: "rounded-full"
  },
  shadow: {
    soft: "shadow-[0_18px_48px_rgba(15,23,42,0.08)]",
    card: "shadow-[0_10px_28px_rgba(15,23,42,0.06)]",
    hero: "shadow-[0_28px_80px_rgba(15,23,42,0.24)]",
    nav: "shadow-[0_20px_60px_rgba(15,23,42,0.12)]"
  },
  spacing: {
    page: "px-4 py-5 sm:px-6 lg:px-9 lg:py-8",
    section: "space-y-6",
    grid: "grid gap-5"
  },
  typography: {
    eyebrow: "text-xs font-black uppercase tracking-[0.22em]",
    h1: "text-3xl font-black leading-tight tracking-[0] text-slate-950 sm:text-5xl",
    h2: "text-xl font-black leading-tight tracking-[0] text-slate-950",
    h3: "text-lg font-black leading-7 tracking-[0] text-slate-950",
    body: "text-sm leading-7 text-slate-600",
    caption: "text-xs font-bold leading-5 text-slate-500"
  },
  statusStyles: {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    danger: "border-rose-200 bg-rose-50 text-rose-700",
    info: "border-sky-200 bg-sky-50 text-sky-700",
    neutral: "border-slate-200 bg-slate-100/80 text-slate-600"
  },
  chartColors: ["#0ea5e9", "#14b8a6", "#6366f1", "#f59e0b", "#ef4444", "#64748b"]
} as const;

export type DesignTokenKey = keyof typeof designTokens;
