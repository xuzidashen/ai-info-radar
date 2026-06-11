import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
  meta?: ReactNode;
  className?: string;
};

export function PageHeader({ title, subtitle, eyebrow, actions, meta, className = "" }: PageHeaderProps) {
  return (
    <section className={`relative overflow-hidden rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-7 ${className}`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/80 to-transparent" />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.26em] text-sky-700">{eyebrow}</p> : null}
          <h1 className="mt-3 max-w-5xl text-3xl font-black leading-tight text-slate-950 sm:text-5xl">{title}</h1>
          {subtitle ? <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">{subtitle}</p> : null}
          {meta ? <div className="mt-4 flex flex-wrap items-center gap-2">{meta}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2 lg:justify-end">{actions}</div> : null}
      </div>
    </section>
  );
}
