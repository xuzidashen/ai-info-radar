import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { getFactorProviderStatus } from "@/lib/providers/factor";
import { getLinkageProviderStatus } from "@/lib/providers/linkage";
import { getSearchProviderStatus } from "@/lib/providers/search";
import { getSummaryProviderStatus } from "@/lib/providers/summary";

export type EnvHealthStatus = "pass" | "warning" | "danger";

export type EnvHealthCheck = {
  status: EnvHealthStatus;
  appEnv: "local" | "cloud";
  items: Array<{
    key: string;
    label: string;
    status: EnvHealthStatus;
    message: string;
    fix?: string;
    maskedValue?: string | null;
  }>;
};

const recommendedDomain = "https://aileida.zh.kg";

function mask(value?: string | null) {
  if (!value) {
    return null;
  }
  if (value.length <= 8) {
    return "****";
  }
  return `${value.slice(0, 3)}****${value.slice(-4)}`;
}

function maskDatabaseUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  if (value.startsWith("file:")) {
    return value;
  }

  try {
    const url = new URL(value);
    const database = url.pathname ? url.pathname.replace(/^\/+/, "") : "";
    const query = url.search ? "?..." : "";
    return `${url.protocol}//***:***@${url.host}/${database}${query}`;
  } catch {
    return mask(value);
  }
}

function item(input: EnvHealthCheck["items"][number]) {
  return input;
}

function syncedCapacitorServerUrl() {
  const configPath = join(process.cwd(), "android", "app", "src", "main", "assets", "capacitor.config.json");
  if (!existsSync(configPath)) {
    return "";
  }

  try {
    const parsed = JSON.parse(readFileSync(configPath, "utf8")) as { server?: { url?: string } };
    return parsed.server?.url ?? "";
  } catch {
    return "";
  }
}

function providerItem(
  key: string,
  label: string,
  status: {
    requestedProvider: string;
    activeProvider: string;
    fallbackWillBeUsed: boolean;
  },
  keyConfigured: boolean
) {
  if (status.requestedProvider !== "mock" && status.fallbackWillBeUsed) {
    return item({
      key,
      label,
      status: "warning",
      message: `请求 ${status.requestedProvider}，但当前会回退到 ${status.activeProvider}。`,
      fix: keyConfigured ? "检查 provider 初始化错误。" : "配置对应 API Key，或切回 mock。"
    });
  }

  return item({
    key,
    label,
    status: "pass",
    message: `active=${status.activeProvider}, requested=${status.requestedProvider}`
  });
}

export function getEnvHealthCheck(): EnvHealthCheck {
  const appEnv = process.env.APP_ENV === "cloud" ? "cloud" : "local";
  const databaseProvider = process.env.DATABASE_PROVIDER || "sqlite";
  const databaseUrl = process.env.DATABASE_URL;
  const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const mobileUrl = process.env.NEXT_PUBLIC_MOBILE_BASE_URL || "";
  const capacitorUrl = process.env.CAPACITOR_SERVER_URL || mobileUrl || syncedCapacitorServerUrl() || "http://10.0.2.2:3000";
  const isCloudDomain = appBaseUrl === recommendedDomain;
  const isMobileCloudDomain = mobileUrl === recommendedDomain || capacitorUrl === recommendedDomain;
  const githubPagesRisk = [appBaseUrl, mobileUrl, capacitorUrl].some((value) => value.includes("github.io") || value.includes("github.com/pages"));
  const usesEmulatorUrl = [appBaseUrl, mobileUrl, capacitorUrl].some((value) => value.includes("10.0.2.2"));
  const search = getSearchProviderStatus();
  const summary = getSummaryProviderStatus();
  const factor = getFactorProviderStatus();
  const linkage = getLinkageProviderStatus();
  const items: EnvHealthCheck["items"] = [
    item({
      key: "app_env",
      label: "部署模式",
      status: appEnv === "cloud" ? "pass" : "warning",
      message: `APP_ENV=${appEnv}`,
      fix: "云端多人同步部署应设置 APP_ENV=cloud；本地开发可以保持 local。"
    }),
    item({
      key: "node_env",
      label: "Node 环境",
      status: process.env.NODE_ENV === "production" || process.env.NODE_ENV === "development" ? "pass" : "warning",
      message: `NODE_ENV=${process.env.NODE_ENV || "未设置"}`
    }),
    item({
      key: "database_url",
      label: "DATABASE_URL",
      status: databaseUrl ? "pass" : "danger",
      message: databaseUrl ? "已配置数据库连接。" : "缺少 DATABASE_URL。",
      fix: "本地使用 file:../data/dev.db；云端使用 Neon/Supabase/Railway PostgreSQL 连接串，并带 sslmode=require。",
      maskedValue: maskDatabaseUrl(databaseUrl)
    }),
    item({
      key: "database_provider",
      label: "DATABASE_PROVIDER",
      status:
        appEnv === "cloud"
          ? databaseProvider === "postgres" && Boolean(databaseUrl?.startsWith("postgres"))
            ? "pass"
            : "danger"
          : (databaseProvider === "sqlite" && databaseUrl?.startsWith("file:")) ||
              (databaseProvider === "postgres" && databaseUrl?.startsWith("postgres"))
          ? "pass"
          : "warning",
      message: `DATABASE_PROVIDER=${databaseProvider}`,
      fix: "本地 sqlite 对应 file:；云端多人同步必须使用 postgres + postgresql:// 或 postgres://。"
    }),
    providerItem("search_provider", "SearchProvider", search, Boolean(process.env.TAVILY_API_KEY)),
    providerItem("summary_provider", "SummaryProvider", summary, Boolean(process.env.DEEPSEEK_API_KEY)),
    providerItem("factor_provider", "FactorProvider", factor, Boolean(process.env.DEEPSEEK_API_KEY)),
    providerItem("linkage_provider", "LinkageProvider", linkage, Boolean(process.env.DEEPSEEK_API_KEY)),
    item({
      key: "tavily_key",
      label: "Tavily Key",
      status: process.env.TAVILY_API_KEY ? "pass" : search.requestedProvider === "tavily" || appEnv === "cloud" ? "danger" : "warning",
      message: process.env.TAVILY_API_KEY ? "TAVILY_API_KEY 已配置。" : "TAVILY_API_KEY 未配置。",
      fix: "真实搜索需要配置 Tavily Key；mock 模式可以留空。",
      maskedValue: mask(process.env.TAVILY_API_KEY)
    }),
    item({
      key: "deepseek_key",
      label: "DeepSeek Key",
      status: process.env.DEEPSEEK_API_KEY ? "pass" : summary.requestedProvider === "deepseek" || factor.requestedProvider === "deepseek" || linkage.requestedProvider === "deepseek" || appEnv === "cloud" ? "danger" : "warning",
      message: process.env.DEEPSEEK_API_KEY ? "DEEPSEEK_API_KEY 已配置。" : "DEEPSEEK_API_KEY 未配置。",
      fix: "真实总结、因子和联动分析需要配置 DeepSeek Key；mock 模式可以留空。",
      maskedValue: mask(process.env.DEEPSEEK_API_KEY)
    }),
    item({
      key: "cron_secret",
      label: "Cron Secret",
      status: process.env.CRON_SECRET ? "pass" : appEnv === "cloud" ? "danger" : "warning",
      message: process.env.CRON_SECRET ? "CRON_SECRET 已配置。" : "CRON_SECRET 未配置。",
      fix: "Vercel Cron 调用 /api/schedules/run-due 时需要 CRON_SECRET；外部定时服务也应携带 x-cron-secret 或 Bearer token。",
      maskedValue: mask(process.env.CRON_SECRET)
    }),
    item({
      key: "internal_api_secret",
      label: "Internal API Secret",
      status: process.env.INTERNAL_API_SECRET ? "pass" : appEnv === "cloud" ? "danger" : "warning",
      message: process.env.INTERNAL_API_SECRET ? "INTERNAL_API_SECRET 已配置。" : "INTERNAL_API_SECRET 未配置。",
      fix: "云端内部接口建议配置 INTERNAL_API_SECRET，避免公网误触发。",
      maskedValue: mask(process.env.INTERNAL_API_SECRET)
    }),
    item({
      key: "app_admin_token",
      label: "App Admin Token",
      status: process.env.APP_ADMIN_TOKEN ? "pass" : appEnv === "cloud" ? "danger" : "warning",
      message: process.env.APP_ADMIN_TOKEN ? "APP_ADMIN_TOKEN 已配置。" : "APP_ADMIN_TOKEN 未配置。",
      fix: "云端查看详细系统健康信息和管理接口建议配置 APP_ADMIN_TOKEN。",
      maskedValue: mask(process.env.APP_ADMIN_TOKEN)
    }),
    item({
      key: "app_base_url",
      label: "APP_BASE_URL",
      status: appEnv === "cloud" ? (isCloudDomain ? "pass" : "danger") : appBaseUrl ? "pass" : "warning",
      message: `APP_BASE_URL=${appBaseUrl}`,
      fix: `云端部署目标应设置 APP_BASE_URL=${recommendedDomain}。`
    }),
    item({
      key: "mobile_base_url",
      label: "NEXT_PUBLIC_MOBILE_BASE_URL",
      status: appEnv === "cloud" ? (isMobileCloudDomain ? "pass" : "danger") : mobileUrl ? (mobileUrl.startsWith("https://") ? "pass" : "warning") : "warning",
      message: mobileUrl ? `移动端远程地址已配置：${mobileUrl}` : "未配置移动端远程地址，将使用 Capacitor fallback。",
      fix: `多人同步 APK 必须指向云端 HTTPS，推荐 NEXT_PUBLIC_MOBILE_BASE_URL=${recommendedDomain}。`
    }),
    item({
      key: "capacitor_server_url",
      label: "Capacitor Server URL",
      status: capacitorUrl === recommendedDomain ? "pass" : capacitorUrl.startsWith("https://") ? "warning" : appEnv === "cloud" ? "danger" : "warning",
      message: `当前 Capacitor server url=${capacitorUrl}`,
      fix: `真机多人同步 APK 应使用 CAPACITOR_SERVER_URL=${recommendedDomain}，不要使用 10.0.2.2 或局域网 HTTP。`
    }),
    item({
      key: "emulator_url_risk",
      label: "10.0.2.2 风险",
      status: appEnv === "cloud" && usesEmulatorUrl ? "danger" : usesEmulatorUrl ? "warning" : "pass",
      message: usesEmulatorUrl ? "当前配置仍包含 Android Emulator fallback 地址。" : "未发现 10.0.2.2 云端误用。",
      fix: "10.0.2.2 只能给 Android Emulator 访问开发机 localhost，云端 APK 必须改为 HTTPS 域名。"
    }),
    item({
      key: "github_pages_risk",
      label: "GitHub Pages 误用风险",
      status: githubPagesRisk ? "danger" : "pass",
      message: githubPagesRisk ? "检测到 GitHub Pages 地址迹象。" : "未检测到 GitHub Pages 部署地址。",
      fix: "完整系统需要 Next.js API Routes、Prisma 和数据库，不能用 GitHub Pages 承载完整应用。"
    }),
    item({
      key: "public_access",
      label: "Public Access",
      status: process.env.ENABLE_PUBLIC_ACCESS === "true" ? "warning" : "pass",
      message: `ENABLE_PUBLIC_ACCESS=${process.env.ENABLE_PUBLIC_ACCESS || "false"}`,
      fix: "云端部署建议保持 false，并配置 APP_ADMIN_TOKEN / INTERNAL_API_SECRET。"
    }),
    item({
      key: "setup_wizard",
      label: "Setup Wizard",
      status: process.env.ENABLE_SETUP_WIZARD === "false" ? "pass" : "warning",
      message: `ENABLE_SETUP_WIZARD=${process.env.ENABLE_SETUP_WIZARD || "true"}`,
      fix: "生产环境完成部署后可关闭 setup wizard。"
    })
  ];
  const status: EnvHealthStatus = items.some((entry) => entry.status === "danger")
    ? "danger"
    : items.some((entry) => entry.status === "warning")
      ? "warning"
      : "pass";

  return {
    status,
    appEnv,
    items
  };
}
