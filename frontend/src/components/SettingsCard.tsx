import { FormEvent, useState } from 'react';
import { AlertTriangle, KeyRound, ServerCog, ShieldCheck } from 'lucide-react';

import type { ProviderStatus } from '../api/client';

interface SettingsCardProps {
  apiBaseUrl: string;
  providerStatus: ProviderStatus | null;
  onSave: (url: string) => void;
}

function KeyStatus({
  label,
  provider,
  configured,
}: {
  label: string;
  provider: string;
  configured: boolean;
}) {
  const isMock = provider === 'mock';
  const healthy = isMock || configured;

  return (
    <div className="rounded-md border border-stone-200 bg-[#faf8f1] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase text-stone-500">{label}</p>
          <p className="mt-1 break-words text-sm font-black text-stone-950">{provider}</p>
        </div>
        <span
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
            healthy ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}
        >
          {healthy ? <ShieldCheck size={16} /> : <AlertTriangle size={16} />}
        </span>
      </div>
      <p
        className={`mt-2 text-xs font-semibold ${
          healthy ? 'text-emerald-800' : 'text-rose-800'
        }`}
      >
        {isMock ? 'mock 无需 API Key' : configured ? 'API Key 已在后端配置' : '缺少后端 API Key'}
      </p>
    </div>
  );
}

export function SettingsCard({ apiBaseUrl, providerStatus, onSave }: SettingsCardProps) {
  const [draft, setDraft] = useState(apiBaseUrl);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(draft);
  }

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-center gap-2">
        <ServerCog size={18} className="text-emerald-700" aria-hidden="true" />
        <h2 className="text-lg font-bold text-stone-950">设置</h2>
      </div>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <label className="block text-xs font-bold uppercase text-stone-500" htmlFor="api-url">
          Backend URL
        </label>
        <input
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-[14px] text-stone-950 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
          id="api-url"
          inputMode="url"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button
          className="inline-flex h-11 w-full items-center justify-center rounded-md bg-stone-950 px-4 text-sm font-bold text-white transition active:scale-[0.99]"
          type="submit"
        >
          保存
        </button>
      </form>

      {providerStatus ? (
        <div className="mt-4 grid gap-2">
          <KeyStatus
            label="Search"
            provider={providerStatus.search_provider}
            configured={providerStatus.search_key_configured}
          />
          <KeyStatus
            label="Summary"
            provider={providerStatus.summary_provider}
            configured={providerStatus.summary_key_configured}
          />
        </div>
      ) : (
        <div className="mt-4 rounded-md border border-dashed border-stone-300 px-3 py-4 text-sm text-stone-500">
          Provider 状态等待后端连接
        </div>
      )}

      <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3">
        <div className="flex items-start gap-2">
          <KeyRound className="mt-0.5 shrink-0 text-amber-800" size={16} aria-hidden="true" />
          <p className="text-xs font-semibold leading-5 text-amber-900">
            API Key 必须放在后端 .env，不能放进 APK 或前端代码。
          </p>
        </div>
      </div>
    </section>
  );
}
