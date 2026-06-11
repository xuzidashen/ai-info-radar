import { ArrowRight, Route } from "lucide-react";

type LinkagePath = {
  from: string;
  to: string;
  relationType: string;
  impact: string;
  strength: number;
  evidence: string[];
};

function parsePaths(value: string | null): LinkagePath[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.flatMap((item): LinkagePath[] => {
      if (typeof item !== "object" || item === null) {
        return [];
      }

      const candidate = item as {
        from?: unknown;
        to?: unknown;
        relationType?: unknown;
        impact?: unknown;
        strength?: unknown;
        evidence?: unknown;
      };

      if (typeof candidate.from !== "string" || typeof candidate.to !== "string" || typeof candidate.impact !== "string") {
        return [];
      }

      return [
        {
          from: candidate.from,
          to: candidate.to,
          relationType: typeof candidate.relationType === "string" ? candidate.relationType : "relation",
          impact: candidate.impact,
          strength: typeof candidate.strength === "number" ? candidate.strength : 0,
          evidence: Array.isArray(candidate.evidence) ? candidate.evidence.filter((entry): entry is string => typeof entry === "string") : []
        }
      ];
    });
  } catch {
    return [];
  }
}

function percent(value: number | null | undefined) {
  return Math.max(0, Math.min(100, Math.round((value ?? 0) * 100)));
}

export function LinkagePathView({ keyPaths }: { keyPaths: string | null }) {
  const paths = parsePaths(keyPaths);

  if (paths.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/72 p-6 text-sm font-bold text-slate-500">
        暂无关键路径。运行联动分析后会生成 keyPaths。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {paths.map((path, index) => {
        const strength = percent(path.strength);

        return (
          <article key={`${path.from}-${path.to}-${index}`} className="rounded-2xl border border-slate-200/70 bg-slate-50/88 p-4">
            <div className="flex flex-wrap items-center gap-2 text-sm font-black text-slate-950">
              <Route className="h-4 w-4 text-radar-500" />
              <span>{path.from}</span>
              <ArrowRight className="h-4 w-4 text-radar-500" />
              <span>{path.to}</span>
              <span className="rounded-full border border-radar-500/25 bg-radar-500/10 px-2.5 py-1 text-xs text-radar-500">
                {path.relationType || "relation"}
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-radar-500" style={{ width: `${strength}%` }} />
            </div>
            <p className="mt-2 text-xs font-bold text-slate-400">strength {strength}%</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{path.impact}</p>
            {path.evidence.length > 0 ? (
              <div className="mt-3 space-y-2">
                {path.evidence.map((item) => (
                  <p key={item} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold leading-5 text-slate-500">
                    证据：{item}
                  </p>
                ))}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
