import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, icon, className = "" }: EmptyStateProps) {
  return (
    <div className={`rounded-[28px] border border-dashed border-slate-300 bg-white/72 p-8 text-center ${className}`}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sky-700 shadow-sm">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
