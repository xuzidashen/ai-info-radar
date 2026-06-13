# Node Server Deploy

VPS / 云服务器适合以常驻 Node 进程运行。

## 基础步骤

配置 PostgreSQL `DATABASE_URL` 后执行：

```bash
npm install
npx prisma generate
npx prisma db push
npm run build
npm run start
```

旧 migrations 是 SQLite 历史，不要对 PostgreSQL 执行 `npx prisma migrate deploy`。后续稳定后再建立 PostgreSQL migration baseline。

建议使用 PM2：

```bash
pm2 start npm --name ai-info-radar -- run start
pm2 save
```

## Nginx + HTTPS

使用 Nginx 反代到 Next.js 端口，并配置 HTTPS 证书。然后设置：

```env
APP_ENV="cloud"
APP_BASE_URL="https://your-domain.com"
NEXT_PUBLIC_MOBILE_BASE_URL="https://your-domain.com"
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
```

## Cron

Linux cron 可执行：

```bash
cd /path/to/project && npm run schedules:run-due
```

也可以调用：

```bash
curl https://your-domain.com/api/schedules/run-due -H "x-cron-secret: your_secret"
```

## Database

长期部署使用 PostgreSQL，尤其是有多设备访问、定时任务和报告积累时。不要把真实 `DATABASE_URL` 写入代码或提交到 GitHub。
