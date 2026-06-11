import { AlertTriangle, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

import { ActionButton } from "@/components/ui/ActionButton";

export function ErrorState({
  title = "暂时无法加载",
  description = "请稍后重试，或检查本地服务和 Provider 配置。",
  action,
  retryHref
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  retryHref?: string;
}) {
  return (
    <div className="rounded-[28px] border border-rose-200 bg-rose-50/88 p-6 text-center shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-rose-700 shadow-sm">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-xl font-black text-slate-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm font-bold leading-6 text-rose-700">{description}</p>
      <div className="mt-5 flex justify-center">
        {action ?? (
          retryHref ? (
            <ActionButton href={retryHref} variant="secondary">
              <RefreshCw className="h-4 w-4" />
              重新打开
            </ActionButton>
          ) : null
        )}
      </div>
    </div>
  );
}
