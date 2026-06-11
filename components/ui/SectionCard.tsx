import type { ReactNode } from "react";

type SectionCardProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function SectionCard({ children, title, description, actions, className = "", contentClassName = "" }: SectionCardProps) {
  const hasHeader = title || description || actions;

  return (
    <section className={`rounded-[28px] border border-white/80 bg-white/88 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl ${className}`}>
      {hasHeader ? (
        <div className="flex flex-col gap-4 border-b border-slate-200/70 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div>
            {title ? <h2 className="text-xl font-black text-slate-950">{title}</h2> : null}
            {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div className={`p-5 sm:p-6 ${contentClassName}`}>{children}</div>
    </section>
  );
}
