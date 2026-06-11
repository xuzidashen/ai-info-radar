# Deployment

AI 信息雷达支持两种模式。

## local

- `APP_ENV=local`
- `DATABASE_PROVIDER=sqlite`
- `DATABASE_URL=file:../data/dev.db`
- Provider 可保持 mock。
- APK 可通过 `CAPACITOR_SERVER_URL=http://LAN_IP:3000` 指向本地开发机。

## cloud

- `APP_ENV=cloud`
- 推荐 `DATABASE_PROVIDER=postgres`
- 使用 HTTPS 域名配置 `APP_BASE_URL` 和 `NEXT_PUBLIC_MOBILE_BASE_URL`
- 配置 `TAVILY_API_KEY`、`DEEPSEEK_API_KEY`
- 配置 `APP_ADMIN_TOKEN`、`INTERNAL_API_SECRET` 或 `CRON_SECRET`
- 设置 `ENABLE_PUBLIC_ACCESS=false`

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
