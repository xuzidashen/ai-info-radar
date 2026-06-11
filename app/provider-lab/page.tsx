"use client";

import { FormEvent, useState } from "react";
import { FlaskConical, Play, RefreshCw } from "lucide-react";

import { ActionButton } from "@/components/ui/ActionButton";
import { AppContainer } from "@/components/ui/AppContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { keywordCategories, categoryLabels, type KeywordCategory } from "@/lib/types";

type LabKind = "search" | "summary" | "factor" | "linkage";

const samples = ["广西公务员考试", "OpenAI", "中芯国际", "AI + PCB + 光模块"];

export default function ProviderLabPage() {
  const [kind, setKind] = useState<LabKind>("search");
  const [keywordName, setKeywordName] = useState("OpenAI");
  const [category, setCategory] = useState<KeywordCategory>("ai-tech");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/provider-lab/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, keywordName, category })
      });
      const data = (await response.json()) as Record<string, unknown> & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Provider Lab 测试失败");
      }

      setResult(data);
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "Provider Lab 测试失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppContainer size="xl">
      <PageHeader
        eyebrow="Provider Lab"
        title="Provider Lab"
        subtitle="测试 Search / Summary / Factor / Linkage provider，记录质量快照，并观察 latency、fallback、错误和结果数量。"
        meta={
          <>
            <StatusPill tone="info">mock safe</StatusPill>
            <StatusPill tone="neutral">records quality snapshot</StatusPill>
          </>
        }
      />

      <SectionCard title="运行测试" description="无 Key 时会走 mock 或 fallback；有 Tavily / DeepSeek Key 时会测试真实 provider。">
        <form onSubmit={run} className="grid gap-3 lg:grid-cols-[0.8fr_1fr_1fr_auto]">
          <select value={kind} onChange={(event) => setKind(event.target.value as LabKind)} className="radar-input">
            <option value="search">Search Provider</option>
            <option value="summary">Summary Provider</option>
            <option value="factor">Factor Provider</option>
            <option value="linkage">Linkage Provider</option>
          </select>
          <input value={keywordName} onChange={(event) => setKeywordName(event.target.value)} className="radar-input" list="provider-lab-samples" />
          <datalist id="provider-lab-samples">
            {samples.map((sample) => <option key={sample} value={sample} />)}
          </datalist>
          <select value={category} onChange={(event) => setCategory(event.target.value as KeywordCategory)} className="radar-input">
            {keywordCategories.map((item) => (
              <option key={item} value={item}>
                {categoryLabels[item]}
              </option>
            ))}
          </select>
          <ActionButton type="submit" loading={loading} disabled={!keywordName.trim()}>
            {loading ? <RefreshCw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            运行
          </ActionButton>
        </form>
      </SectionCard>

      {error ? <ErrorState title="Provider 测试失败" description={error} /> : null}

      <SectionCard title="测试结果" description="完整 JSON 用于调试 provider 质量。">
        {result ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="info">{String(result.kind ?? kind)}</StatusPill>
              <StatusPill tone={result.fallbackUsed ? "warning" : "success"}>{result.fallbackUsed ? "fallback" : "direct"}</StatusPill>
              <StatusPill tone="neutral">{String(result.provider ?? result.searchProvider ?? "provider")}</StatusPill>
              <StatusPill tone="neutral">{String(result.latencyMs ?? "unknown")}ms</StatusPill>
            </div>
            <pre className="max-h-[34rem] overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-200/70 bg-slate-50/88 p-4 text-xs leading-6 text-slate-600">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        ) : (
          <EmptyState title="还没有测试结果" description="选择 provider 和关键词后运行测试，结果会显示 provider、fallback、延迟和 JSON。" icon={<FlaskConical className="h-5 w-5" />} />
        )}
      </SectionCard>
    </AppContainer>
  );
}
