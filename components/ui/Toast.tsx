"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

type ToastTone = "success" | "error" | "info" | "warning";

type ToastItem = {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastInput = Omit<ToastItem, "id">;

const ToastContext = createContext<{ showToast: (input: ToastInput) => void } | null>(null);

const toneClasses: Record<ToastTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  info: "border-sky-200 bg-sky-50 text-sky-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800"
};

const icons: Record<ToastTone, ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4" />,
  error: <AlertTriangle className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback((input: ToastInput) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setItems((current) => [{ ...input, id }, ...current].slice(0, 4));
    window.setTimeout(() => remove(id), 3200);
  }, [remove]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[70] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
        {items.map((item) => (
          <div key={item.id} className={`rounded-[22px] border p-4 shadow-[0_18px_48px_rgba(15,23,42,0.14)] backdrop-blur-xl ${toneClasses[item.tone]}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 gap-2">
                <span className="mt-0.5 shrink-0">{icons[item.tone]}</span>
                <div className="min-w-0">
                  <p className="font-black leading-5">{item.title}</p>
                  {item.description ? <p className="mt-1 text-sm font-bold leading-5 opacity-75">{item.description}</p> : null}
                </div>
              </div>
              <button type="button" onClick={() => remove(item.id)} className="rounded-full p-1 opacity-60 transition hover:bg-white/60 hover:opacity-100" aria-label="关闭提示">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: () => undefined
    };
  }
  return context;
}
