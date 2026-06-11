# Vercel Deploy

Vercel 适合部署 Web 访问入口，但不适合使用本地 SQLite 持久化。

## 建议配置

- 使用外部 PostgreSQL。
- 设置 `APP_ENV=cloud`。
- 设置 `APP_BASE_URL=https://aileida.zh.kg`。
- 设置 `NEXT_PUBLIC_MOBILE_BASE_URL=https://aileida.zh.kg`。
- 配置 provider Key 和内部密钥。
- 不使用 GitHub Pages 承载完整系统。

## Vercel Build

本仓库保留本地 SQLite schema。云端构建使用 `vercel.json` 指定的命令：

```powershell
npm run build:cloud
```

它会临时生成 `.prisma-cloud/schema.prisma`，将 Prisma datasource provider 切换为 PostgreSQL，然后执行 Prisma Client generate 和 Next.js build。

## Prisma

首次云端初始化数据库建议执行：

```powershell
npm run prisma:db:push:cloud
```

当前 SQLite migrations 不直接用于 PostgreSQL。后续正式多人版本可以为 PostgreSQL 建立单独 migration baseline。

## Cron

使用 Vercel Cron 调用：

```text
GET /api/schedules/run-due
```

Vercel Cron 会发送 GET 请求。项目同时保留 POST，便于外部定时服务调用。请求应带：

```text
x-cron-secret: your_secret
```

或：

```text
Authorization: Bearer your_secret
```

## APK

APK 的 server url 指向 HTTPS 域名：

```powershell
$env:NEXT_PUBLIC_MOBILE_BASE_URL="https://aileida.zh.kg"
$env:CAPACITOR_SERVER_URL="https://aileida.zh.kg"
npm run mobile:sync
npm run mobile:build:debug:win
```

不要把 provider API Key 写入 Android 或前端代码。
