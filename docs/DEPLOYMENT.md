# Deployment

AI 信息雷达当前默认按 PostgreSQL 部署。

## Local

- `APP_ENV=local`
- `DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require`
- Provider 可保持 mock。
- APK 可通过 `CAPACITOR_SERVER_URL=http://LAN_IP:3000` 指向本地开发机。

本地开发建议直接使用 Neon 或本地 PostgreSQL。不要在默认 `prisma/schema.prisma` 里切回 SQLite。

## Cloud

- `APP_ENV=cloud`
- `APP_BASE_URL=https://aileida.zh.kg`
- `NEXT_PUBLIC_MOBILE_BASE_URL=https://aileida.zh.kg`
- `DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require`
- 配置 `TAVILY_API_KEY`、`DEEPSEEK_API_KEY`
- 配置 `APP_ADMIN_TOKEN`、`INTERNAL_API_SECRET` 或 `CRON_SECRET`
- 设置 `ENABLE_PUBLIC_ACCESS=false`

`DATABASE_PROVIDER` 是可选旧标志位，Prisma 不依赖它。

## Database

旧 migrations 是 SQLite 生成的 SQL，不要对 Neon 执行 `npx prisma migrate deploy`。新空库先手动初始化：

```powershell
npx prisma generate
npx prisma db push
```

## Health Check

打开：

```text
/system/health
```

或调用：

```text
GET /api/system/health
```

接口不会返回完整 API Key，只返回是否配置和 masked 值。

## APK 云端路径

1. 部署 Web 到 HTTPS。
2. 设置 `NEXT_PUBLIC_MOBILE_BASE_URL=https://your-domain.com`。
3. 执行 `npm run mobile:sync`。
4. 执行 `npm run mobile:build:debug:win`。
5. 安装 `android/app/build/outputs/apk/debug/app-debug.apk`。
