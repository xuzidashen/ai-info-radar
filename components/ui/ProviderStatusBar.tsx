"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, RadioTower } from "lucide-react";

import { StatusPill } from "@/components/ui/StatusPill";

type ProviderStatusItem = {
  requestedProvider: string;
  activeProvider: string;
  fallbackWillBeUsed: boolean;
  model?: string;
};

type ProviderStatusResponse = {
  search: ProviderStatusItem;
  summary: ProviderStatusItem;
  factor: ProviderStatusItem;
  linkage: ProviderStatusItem;
};

const providerLabels: Record<keyof ProviderStatusResponse, string> = {
  search: "Search",
  summary: "Summary",
  factor: "Factor",
  linkage: "Linkage"
};

export function ProviderStatusBar() {
  const [status, setStatus] = useState<ProviderStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadStatus() {
      try {
        const response = await fetch("/api/providers/status", { cache: "no-store" });
        const data = (await response.json()) as ProviderStatusResponse;

        if (!response.ok) {
          throw new Error("Provider 状态读取失败");
        }

        if (mounted) {
          setStatus(data);
          setError(null);
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : "Provider 状态读取失败");
        }
      }
    }

    void loadStatus();

    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/88 px-4 py-3 text-sm font-bold text-rose-700 shadow-sm">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    );
  }

  if (!status) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white/88 px-4 py-3 text-sm font-bold text-slate-500 shadow-sm">
        正在读取 Provider 状态
      </div>
    );
  }

  const entries = Object.entries(status) as Array<[keyof ProviderStatusResponse, ProviderStatusItem]>;
  const fallbackCount = entries.filter(([, item]) => item.fallbackWillBeUsed).length;

  return (
    <div className="rounded-2xl border border-white/80 bg-white/88 px-4 py-3 shadow-[0_14px_36px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-2 text-sm font-black text-slate-950">
          <RadioTower className="h-4 w-4 text-radar-500" />
          Provider 状态
          <StatusPill tone={fallbackCount > 0 ? "warning" : "success"}>
            {fallbackCount > 0 ? `${fallbackCount} 项可能 fallback` : "active"}
          </StatusPill>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {entries.map(([key, item]) => (
            <div key={key} className="rounded-xl border border-slate-200/70 bg-slate-50/88 px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black text-slate-600">{providerLabels[key]}</p>
                {item.fallbackWillBeUsed ? <AlertCircle className="h-3.5 w-3.5 text-signal-500" /> : <CheckCircle2 className="h-3.5 w-3.5 text-radar-500" />}
              </div>
              <p className="mt-1 text-xs font-bold text-slate-500">
                {item.requestedProvider} → <span className="text-slate-800">{item.activeProvider}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
