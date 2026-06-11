# Database

## SQLite

本地默认使用 SQLite：

```env
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:../data/dev.db"
```

优点是简单、无需额外服务。缺点是不适合多人并发和 Serverless 持久化。

## PostgreSQL

云端部署建议使用 PostgreSQL：

```env
DATABASE_PROVIDER="postgres"
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
```

可选服务：

- Neon Postgres
- Supabase Postgres
- Railway Postgres

在云端初始化数据库时执行：

```powershell
npm run prisma:db:push:cloud
```

原因：当前仓库已有 SQLite migrations，不能直接拿这些 SQL 在 PostgreSQL 上 `migrate deploy`。本轮保留本地 SQLite migrations，不删除历史迁移；云端初始库先用 PostgreSQL schema 执行 `db push`，后续正式多人版本再单独建立 PostgreSQL migration baseline。

## 迁移注意

当前 `prisma/schema.prisma` 保持本地 SQLite 兼容。Prisma datasource `provider` 不能可靠地通过 `env()` 动态切换，所以云端构建使用：

```powershell
npm run build:cloud
```

该命令会执行 `scripts/prepare-cloud-prisma.ts`，临时生成 `.prisma-cloud/schema.prisma`，将 datasource provider 改为 PostgreSQL，再运行 Prisma Client generate 和 Next.js build。

未来从 SQLite 数据迁移到 PostgreSQL 可采用：

1. 导出 SQLite 数据。
2. 在 PostgreSQL 执行 Prisma migration。
3. 编写一次性导入脚本映射 Keyword、InfoItem、Summary、ZoneReport、RunLog 等表。
4. 校验报告数量、运行日志数量和标签关系。
