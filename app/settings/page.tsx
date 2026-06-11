import Link from "next/link";
import { BarChart3, KeyRound, LockKeyhole, PlugZap, ShieldCheck } from "lucide-react";

const providerRows = [
  {
    name: "Tavily",
    usage: "真实网页搜索。设置 SEARCH_PROVIDER=tavily 且配置 TAVILY_API_KEY 后启用。"
  },
  {
    name: "DeepSeek Summary",
    usage: "真实中文结构化总结。设置 SUMMARY_PROVIDER=deepseek 且配置 DEEPSEEK_API_KEY 后启用。"
  },
  {
    name: "DeepSeek Factor",
    usage: "真实信息因子评分。设置 FACTOR_PROVIDER=deepseek 且配置 DEEPSEEK_API_KEY 后启用。"
  },
  {
    name: "DeepSeek Linkage",
    usage: "真实产业链联动分析。设置 LINKAGE_PROVIDER=deepseek 且配置 DEEPSEEK_API_KEY 后启用。"
  },
  {
    name: "Mock Providers",
    usage: "默认兜底 provider。没有 Key 或外部 API 报错时自动使用。"
  }
];

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.22em] text-radar-600">Settings</p>
        <h1 className="mt-2 text-3xl font-black text-ink-950 sm:text-4xl">设置</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-700">
          真实搜索、真实总结和信息因子评分只在服务端执行。API Key 只允许放在 `.env`，前端不会直接请求 Tavily 或 DeepSeek。
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="radar-card rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-950 text-radar-500">
              <LockKeyhole className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-black text-ink-950">密钥只放后端</h2>
          </div>
          <p className="mt-4 text-sm leading-7 text-ink-700">
            API Key 不应该写在前端代码里，也不应该通过浏览器暴露。真实 provider 只在 Next.js API Routes 中执行，
            从根目录 <code className="mx-1 rounded bg-ink-950/8 px-1.5 py-0.5">.env</code> 读取密钥。
          </p>
        </div>

        <div className="radar-card rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-radar-500 text-ink-950">
              <PlugZap className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-black text-ink-950">自动 fallback</h2>
          </div>
          <p className="mt-4 text-sm leading-7 text-ink-700">
            设置真实 provider 但没有配置 Key，或者外部 API 报错时，系统会自动回退 mock，不会让页面崩溃。
            生成和分析接口会返回 <code className="mx-1 rounded bg-ink-950/8 px-1.5 py-0.5">fallbackUsed</code>。
          </p>
        </div>
      </section>

      <section className="radar-card rounded-2xl p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-ink-950">Provider 测试页</h2>
            <p className="mt-2 text-sm leading-7 text-ink-700">
              测试 Tavily 搜索和 DeepSeek 总结是否生效，只显示 Key 是否配置，不展示 Key 原文。
            </p>
          </div>
          <Link href="/settings/provider-test" className="radar-button bg-ink-950 text-white hover:bg-ink-800">
            打开测试页
          </Link>
        </div>
      </section>

      <section className="radar-card rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-radar-600" />
          <h2 className="text-xl font-black text-ink-950">Factor Provider 配置</h2>
        </div>
        <div className="mt-4 rounded-xl border border-danger-500/20 bg-danger-500/8 p-4 text-sm font-bold leading-7 text-danger-500">
          因子评分只用于公开信息整理和辅助研究，不构成投资建议；系统不会输出具体交易方向、价格预测或交易执行指令。
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-ink-950/8 bg-white/65 p-4">
            <p className="font-black text-ink-950">Mock 因子分析</p>
            <p className="mt-2 text-sm leading-6 text-ink-700">
              设置 <code className="rounded bg-ink-950/8 px-1.5 py-0.5">FACTOR_PROVIDER=&quot;mock&quot;</code>。
              使用本地关键词规则估算情绪、影响、风险、政策、技术、财经和关注度。
            </p>
          </div>
          <div className="rounded-xl border border-ink-950/8 bg-white/65 p-4">
            <p className="font-black text-ink-950">DeepSeek 因子分析</p>
            <p className="mt-2 text-sm leading-6 text-ink-700">
              设置 <code className="rounded bg-ink-950/8 px-1.5 py-0.5">FACTOR_PROVIDER=&quot;deepseek&quot;</code> 并配置
              <code className="mx-1 rounded bg-ink-950/8 px-1.5 py-0.5">DEEPSEEK_API_KEY</code>。缺少 Key 时自动回退 mock。
            </p>
          </div>
          <div className="rounded-xl border border-ink-950/8 bg-white/65 p-4">
            <p className="font-black text-ink-950">DeepSeek 联动分析</p>
            <p className="mt-2 text-sm leading-6 text-ink-700">
              设置 <code className="rounded bg-ink-950/8 px-1.5 py-0.5">LINKAGE_PROVIDER=&quot;deepseek&quot;</code> 并配置
              <code className="mx-1 rounded bg-ink-950/8 px-1.5 py-0.5">DEEPSEEK_API_KEY</code>。缺少 Key 时自动回退 mock。
            </p>
          </div>
        </div>
      </section>

      <section className="radar-card rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <KeyRound className="h-5 w-5 text-radar-600" />
          <h2 className="text-xl font-black text-ink-950">Provider 配置</h2>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {providerRows.map((provider) => (
            <div key={provider.name} className="rounded-xl border border-ink-950/8 bg-white/65 p-4">
              <p className="font-black text-ink-950">{provider.name}</p>
              <p className="mt-2 text-sm leading-6 text-ink-700">{provider.usage}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-ink-950 bg-ink-950 p-5 text-white shadow-2xl">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-radar-500" />
          <h2 className="text-xl font-black">.env 示例</h2>
        </div>
        <pre className="mt-5 overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-4 text-sm leading-7 text-white/82">
{`DATABASE_URL="file:../data/dev.db"

SEARCH_PROVIDER="mock"
SUMMARY_PROVIDER="mock"
FACTOR_PROVIDER="mock"
LINKAGE_PROVIDER="mock"

TAVILY_API_KEY=""
DEEPSEEK_API_KEY=""
DEEPSEEK_MODEL="deepseek-v4-flash"`}
        </pre>
        <div className="mt-4 space-y-2 text-sm leading-7 text-white/68">
          <p>启用 Tavily：填写 TAVILY_API_KEY，并设置 SEARCH_PROVIDER=tavily。</p>
          <p>启用 DeepSeek 总结：填写 DEEPSEEK_API_KEY，并设置 SUMMARY_PROVIDER=deepseek。</p>
          <p>启用 DeepSeek 因子分析：填写 DEEPSEEK_API_KEY，并设置 FACTOR_PROVIDER=deepseek。</p>
          <p>启用 DeepSeek 联动分析：填写 DEEPSEEK_API_KEY，并设置 LINKAGE_PROVIDER=deepseek。</p>
          <p>没有 Key 时仍然可以生成和分析，因为 mock provider 会自动兜底。</p>
        </div>
      </section>
    </div>
  );
}
