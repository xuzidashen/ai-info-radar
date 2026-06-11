import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

type Level = "pass" | "warning" | "danger";

type Check = {
  level: Level;
  label: string;
  value: string;
  fix?: string;
};

const recommendedDomain = "https://aileida.zh.kg";
const root = process.cwd();

function loadDotEnv() {
  const envPath = join(root, ".env");
  if (!existsSync(envPath)) {
    return;
  }

  const content = readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separator = line.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function mask(value?: string) {
  if (!value) {
    return "missing";
  }

  if (value.startsWith("postgres")) {
    try {
      const url = new URL(value);
      const database = url.pathname.replace(/^\/+/, "");
      return `${url.protocol}//***:***@${url.host}/${database}${url.search ? "?..." : ""}`;
    } catch {
      return "configured";
    }
  }

  if (value.length <= 10) {
    return "configured";
  }

  return `${value.slice(0, 4)}****${value.slice(-4)}`;
}

function add(checks: Check[], level: Level, label: string, value: string, fix?: string) {
  checks.push({ level, label, value, fix });
}

function inferMobileUrl() {
  const syncedConfigPath = join(root, "android", "app", "src", "main", "assets", "capacitor.config.json");
  if (process.env.CAPACITOR_SERVER_URL || process.env.NEXT_PUBLIC_MOBILE_BASE_URL) {
    return process.env.CAPACITOR_SERVER_URL || process.env.NEXT_PUBLIC_MOBILE_BASE_URL || "";
  }

  if (existsSync(syncedConfigPath)) {
    try {
      const parsed = JSON.parse(readFileSync(syncedConfigPath, "utf8")) as { server?: { url?: string } };
      if (parsed.server?.url) {
        return parsed.server.url;
      }
    } catch {
      // Fall back to emulator URL below.
    }
  }

  return "http://10.0.2.2:3000";
}

loadDotEnv();

const checks: Check[] = [];
const appEnv = process.env.APP_ENV || "local";
const appBaseUrl = process.env.APP_BASE_URL || "";
const mobileBaseUrl = process.env.NEXT_PUBLIC_MOBILE_BASE_URL || "";
const databaseProvider = process.env.DATABASE_PROVIDER || "sqlite";
const databaseUrl = process.env.DATABASE_URL || "";
const capacitorServerUrl = inferMobileUrl();
const capacitorConfig = existsSync(join(root, "capacitor.config.ts"))
  ? readFileSync(join(root, "capacitor.config.ts"), "utf8")
  : "";

add(
  checks,
  appEnv === "cloud" ? "pass" : "warning",
  "APP_ENV",
  appEnv,
  "云端多人同步部署应设置 APP_ENV=cloud。"
);

add(
  checks,
  appBaseUrl === recommendedDomain ? "pass" : "danger",
  "APP_BASE_URL",
  appBaseUrl || "missing",
  `Vercel 生产环境应设置 APP_BASE_URL=${recommendedDomain}。`
);

add(
  checks,
  mobileBaseUrl === recommendedDomain ? "pass" : "danger",
  "NEXT_PUBLIC_MOBILE_BASE_URL",
  mobileBaseUrl || "missing",
  `APK 云端同步应设置 NEXT_PUBLIC_MOBILE_BASE_URL=${recommendedDomain}。`
);

add(
  checks,
  databaseProvider === "postgres" ? "pass" : "danger",
  "DATABASE_PROVIDER",
  databaseProvider,
  "云端多人同步必须使用 PostgreSQL：DATABASE_PROVIDER=postgres。"
);

add(
  checks,
  databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://") ? "pass" : "danger",
  "DATABASE_URL",
  mask(databaseUrl),
  "填写 Neon / Supabase / Railway PostgreSQL 连接串，通常需要 sslmode=require。"
);

add(
  checks,
  process.env.TAVILY_API_KEY ? "pass" : "warning",
  "TAVILY_API_KEY",
  process.env.TAVILY_API_KEY ? "configured" : "missing",
  "真实搜索需要 Tavily Key；不配置会 fallback 到 mock。"
);

add(
  checks,
  process.env.DEEPSEEK_API_KEY ? "pass" : "warning",
  "DEEPSEEK_API_KEY",
  process.env.DEEPSEEK_API_KEY ? "configured" : "missing",
  "真实总结、因子和联动分析需要 DeepSeek Key；不配置会 fallback 到 mock。"
);

add(
  checks,
  process.env.CRON_SECRET ? "pass" : "danger",
  "CRON_SECRET",
  process.env.CRON_SECRET ? "configured" : "missing",
  "Vercel Cron 或外部定时服务调用 /api/schedules/run-due 时必须配置。"
);

add(
  checks,
  process.env.INTERNAL_API_SECRET ? "pass" : "danger",
  "INTERNAL_API_SECRET",
  process.env.INTERNAL_API_SECRET ? "configured" : "missing",
  "云端内部接口建议配置 INTERNAL_API_SECRET。"
);

add(
  checks,
  process.env.APP_ADMIN_TOKEN ? "pass" : "danger",
  "APP_ADMIN_TOKEN",
  process.env.APP_ADMIN_TOKEN ? "configured" : "missing",
  "云端查看详细健康检查和管理接口需要 APP_ADMIN_TOKEN。"
);

add(
  checks,
  capacitorServerUrl.includes("10.0.2.2") ? "danger" : capacitorServerUrl.startsWith("https://") ? "pass" : "warning",
  "Capacitor server.url",
  capacitorServerUrl,
  `云端 APK 应设置 CAPACITOR_SERVER_URL=${recommendedDomain}。10.0.2.2 只适合 Android Emulator。`
);

add(
  checks,
  capacitorConfig.includes("CAPACITOR_SERVER_URL") && capacitorConfig.includes("NEXT_PUBLIC_MOBILE_BASE_URL") ? "pass" : "danger",
  "capacitor.config.ts priority",
  capacitorConfig ? "checked" : "missing",
  "server.url 优先级应为 CAPACITOR_SERVER_URL -> NEXT_PUBLIC_MOBILE_BASE_URL -> 10.0.2.2 fallback。"
);

add(
  checks,
  [appBaseUrl, mobileBaseUrl, capacitorServerUrl].some((value) => value.includes("github.io")) ? "danger" : "pass",
  "GitHub Pages risk",
  "checked",
  "不要使用 GitHub Pages 部署完整系统；它不能运行 Next.js API Routes、Prisma 和 provider 代理。"
);

const counts = {
  pass: checks.filter((check) => check.level === "pass").length,
  warning: checks.filter((check) => check.level === "warning").length,
  danger: checks.filter((check) => check.level === "danger").length
};

console.log("\nCloud Deployment Check");
console.log("======================");
console.log(`Target domain: ${recommendedDomain}`);
console.log(`Result: pass=${counts.pass} warning=${counts.warning} danger=${counts.danger}`);

for (const level of ["danger", "warning", "pass"] as const) {
  const group = checks.filter((check) => check.level === level);
  if (!group.length) {
    continue;
  }

  console.log(`\n${level.toUpperCase()}`);
  for (const check of group) {
    console.log(`- ${check.label}: ${check.value}`);
    if (check.fix && level !== "pass") {
      console.log(`  fix: ${check.fix}`);
    }
  }
}

console.log("\nCloud check completed. Danger items mean the cloud environment is not ready yet; local mock mode can still run.");
