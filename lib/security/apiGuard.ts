import { NextResponse } from "next/server";

export function isPublicAccessEnabled() {
  return process.env.ENABLE_PUBLIC_ACCESS === "true";
}

export function appEnv() {
  return process.env.APP_ENV === "cloud" ? "cloud" : "local";
}

function tokenFromRequest(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";

  return request.headers.get("x-admin-token") || request.headers.get("x-internal-secret") || bearer;
}

export function requireAdminToken(request: Request) {
  if (isPublicAccessEnabled()) {
    return { ok: true as const, warning: null };
  }

  if (appEnv() === "local" && !process.env.APP_ADMIN_TOKEN) {
    return {
      ok: true as const,
      warning: "本地模式未配置 APP_ADMIN_TOKEN，已宽松放行。"
    };
  }

  const expected = process.env.APP_ADMIN_TOKEN;
  const provided = tokenFromRequest(request);

  if (!expected || provided !== expected) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "APP_ADMIN_TOKEN 校验失败" }, { status: 401 })
    };
  }

  return { ok: true as const, warning: null };
}

export function requireInternalSecret(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const internalSecret = process.env.INTERNAL_API_SECRET;
  const expectedSecrets = [internalSecret, cronSecret].filter((value): value is string => Boolean(value));
  const provided = request.headers.get("x-internal-secret") || request.headers.get("x-cron-secret") || tokenFromRequest(request);

  if (isPublicAccessEnabled()) {
    return { ok: true as const, warning: null };
  }

  if (appEnv() === "local" && expectedSecrets.length === 0) {
    return {
      ok: true as const,
      warning: "本地模式未配置 INTERNAL_API_SECRET/CRON_SECRET，已宽松放行。"
    };
  }

  if (!expectedSecrets.length || !expectedSecrets.includes(provided ?? "")) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "内部接口密钥校验失败" }, { status: 401 })
    };
  }

  return { ok: true as const, warning: null };
}
