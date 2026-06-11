# aileida.zh.kg DNS Setup

目标：

- Web 浏览器打开 `https://aileida.zh.kg`
- Android APK 的 `server.url` 指向同一个 HTTPS 服务
- Topic、报告、通知、运行日志和 Provider 质量数据都写入同一个 PostgreSQL 数据库

## 1. 在 Vercel 添加域名

进入 Vercel 项目：

```text
Settings -> Domains
```

添加：

```text
aileida.zh.kg
```

Vercel 会显示需要添加的 DNS 记录。

## 2. 在 dnsneko 添加记录

打开：

```text
https://www.dnsneko.com/user/domain/list
```

找到：

```text
aileida.zh.kg
```

点击 DNS 管理，然后按照 Vercel 页面显示的内容添加记录。

不要自己猜记录类型，以 Vercel 页面显示为准。

常见情况：

- 如果 Vercel 要 A 记录，按它给的 IP 填。
- 如果 Vercel 要 CNAME，按它给的 CNAME 填。
- 如果 Vercel 要 TXT 验证，必须添加 TXT 后再回 Vercel 点 Verify。
- DNS 生效需要等待，通常几分钟到数小时。
- HTTPS 证书由 Vercel 自动签发，域名验证通过后再生效。

## 3. 不要使用 GitHub Pages 部署完整系统

GitHub Pages 只适合纯静态页面，不适合当前完整系统。

当前项目依赖：

- Next.js API Routes
- Prisma 服务端逻辑
- PostgreSQL 数据库写入
- Tavily / DeepSeek provider 代理
- 报告生成
- 运行日志
- 定时任务
- 通知中心
- Provider 质量监控

GitHub Pages 不支持这些服务端能力。完整系统应部署到 Vercel，并连接 PostgreSQL。

## 4. 验证

DNS 生效后检查：

```text
https://aileida.zh.kg
https://aileida.zh.kg/system/health
https://aileida.zh.kg/provider-lab
```

APK 重新打包时使用：

```powershell
$env:NEXT_PUBLIC_MOBILE_BASE_URL="https://aileida.zh.kg"
$env:CAPACITOR_SERVER_URL="https://aileida.zh.kg"
npm run mobile:sync
npm run mobile:build:debug:win
```
