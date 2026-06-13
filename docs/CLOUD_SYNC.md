# Cloud Sync

Cloud sync requires every browser and APK to use the same deployed Web/API service and the same Neon PostgreSQL database.

## Cause Of The Prisma Error

The old Prisma datasource was SQLite:

```prisma
provider = "sqlite"
```

Neon provides a PostgreSQL URL:

```text
postgresql://...
```

Those do not match. SQLite expects `DATABASE_URL` to start with `file:`, so `npx prisma migrate deploy` failed with P1012.

## Current Fix

- `prisma/schema.prisma` now defaults to `provider = "postgresql"`.
- Vercel and Neon use `DATABASE_URL` from environment variables.
- The existing SQLite migrations are not used for Neon.
- A new empty Neon database should be initialized with `npx prisma db push`.

## Initialize Neon

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

## Vercel

Add the same `DATABASE_URL` to Vercel Environment Variables:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

Do not run `prisma db push` in the build step. Vercel build should only install dependencies, run `prisma generate`, and build Next.js.

## Safety

Do not commit `.env`. Do not commit real `DATABASE_URL` values. Do not publish screenshots containing the connection string.

After initialization, open `https://aileida.zh.kg` and the APK pointed to the same URL. Both should read and write the same Neon database.
