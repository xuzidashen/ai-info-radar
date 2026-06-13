# Vercel Deploy

Vercel is the web and API host. Neon PostgreSQL is the cloud database. SQLite is not suitable for the deployed serverless app.

## Environment Variables

Set these in Vercel Project Settings -> Environment Variables:

```env
APP_ENV=cloud
APP_BASE_URL=https://aileida.zh.kg
NEXT_PUBLIC_MOBILE_BASE_URL=https://aileida.zh.kg

DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require

SEARCH_PROVIDER=mock
SUMMARY_PROVIDER=mock
FACTOR_PROVIDER=mock
LINKAGE_PROVIDER=mock

TAVILY_API_KEY=
DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-v4-flash

CRON_SECRET=
INTERNAL_API_SECRET=
APP_ADMIN_TOKEN=

ENABLE_PUBLIC_ACCESS=false
ENABLE_SETUP_WIZARD=false
DEFAULT_TIMEZONE=Asia/Shanghai
```

`DATABASE_PROVIDER=postgres` may appear in older docs or health checks, but Prisma does not depend on it.

## Build

Vercel should build with:

```powershell
npm run build
```

The build runs `prisma generate` before `next build`. `postinstall` also runs `prisma generate`, which helps Vercel produce the Prisma Client after dependency installation.

Do not run `prisma db push` during Vercel build. Database initialization is a one-time manual operation.

## Database Initialization

The previous failure happened because `prisma/schema.prisma` used SQLite while Neon uses `postgresql://...`. The default schema is now PostgreSQL and reads the Neon connection from `DATABASE_URL`.

The old migrations are SQLite migrations and should not be deployed to Neon with `npx prisma migrate deploy`. For a new empty Neon database, run:

```powershell
npx prisma generate
npx prisma db push
```

CMD:

```cmd
cd /d "D:\vibe ing\shousuo"
set "DATABASE_URL=你的 Neon PostgreSQL 连接串"
npx prisma generate
npx prisma db push
```

PowerShell:

```powershell
cd "D:\vibe ing\shousuo"
$env:DATABASE_URL="你的 Neon PostgreSQL 连接串"
npx prisma generate
npx prisma db push
```

Do not commit `DATABASE_URL`, expose it in screenshots, or put it in frontend code.

## Cron

Use Vercel Cron or another scheduler to call:

```text
GET /api/schedules/run-due
```

Protect the endpoint with `CRON_SECRET` via `x-cron-secret` or `Authorization: Bearer ...`.

## APK

The APK is a Capacitor WebView entrypoint. For cloud testing, point it at the HTTPS site:

```powershell
$env:NEXT_PUBLIC_MOBILE_BASE_URL="https://aileida.zh.kg"
$env:CAPACITOR_SERVER_URL="https://aileida.zh.kg"
npm run mobile:sync
npm run mobile:build:debug:win
```

Provider API keys stay in Vercel Environment Variables, not Android or frontend code.
