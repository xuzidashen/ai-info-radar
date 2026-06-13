# Database

## Default Target

The default Prisma schema is now PostgreSQL for Vercel + Neon deployment:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Prisma datasource `provider` is not switched with `env()`. Do not use `provider = env("DATABASE_PROVIDER")`.

## Why `migrate deploy` Failed

The old schema used `provider = "sqlite"`, while Neon provides a `postgresql://...` connection string. SQLite requires `DATABASE_URL` to start with `file:`, so Prisma raised P1012.

The existing `prisma/migrations` history was generated for SQLite. It includes SQLite-only SQL such as `PRAGMA`, `DATETIME`, and `REAL`, and `migration_lock.toml` says `provider = "sqlite"`. Do not run those migrations against Neon.

## Initialize A New Neon Database

For the current empty cloud database, initialize from the Prisma schema:

```powershell
npx prisma generate
npx prisma db push
```

After the cloud database is stable, create a fresh PostgreSQL migration baseline for future schema changes.

## Commands

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

## Safety

Do not commit `DATABASE_URL` to GitHub. Do not post screenshots that expose it. Put the same PostgreSQL `DATABASE_URL` in Vercel Environment Variables.

Local development should use Neon or another PostgreSQL database. If you need SQLite as a reference later, keep it in a separate schema such as `prisma/schema.sqlite.prisma`; do not mix providers in `prisma/schema.prisma`.
