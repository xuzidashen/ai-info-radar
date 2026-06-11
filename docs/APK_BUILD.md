# APK Preview Build Notes

This project now uses Capacitor to wrap the running Next.js workspace in an Android WebView.
The APK preview is not a pure offline app. Next.js API Routes, Prisma, SQLite, and real providers still run on a server.

## Server URL

Capacitor reads `server.url` from `capacitor.config.ts`:

```text
CAPACITOR_SERVER_URL
NEXT_PUBLIC_MOBILE_BASE_URL
http://10.0.2.2:3000
```

Use `10.0.2.2:3000` for Android Emulator. Use your computer LAN IP for a real phone.

## Real Phone Preview

Start Next.js on all interfaces:

```powershell
npm.cmd run dev -- -H 0.0.0.0
```

Set the phone-facing URL:

```powershell
$env:CAPACITOR_SERVER_URL="http://YOUR_COMPUTER_LAN_IP:3000"
npm run mobile:sync
npm run mobile:open
```

The phone and the computer must be on the same Wi-Fi. If the phone cannot connect, check Windows Firewall and confirm the URL works in the phone browser.

## Android Emulator Preview

Start the dev server:

```powershell
npm.cmd run dev
```

Then sync/open:

```powershell
npm run mobile:sync
npm run mobile:open
```

The default `http://10.0.2.2:3000` lets the emulator access the host computer.

## Debug APK

```powershell
npm run mobile:build:debug:win
```

Expected output:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

If the command fails with `JAVA_HOME is not set`, install a JDK and set `JAVA_HOME`. If Gradle cannot find Android SDK, install Android Studio and complete SDK setup.

Current verified local setup:

```text
JAVA_HOME=D:\Android studio\jbr
java 21.0.10
Android Studio: D:\Android studio
Debug APK: android/app/build/outputs/apk/debug/app-debug.apk
```

Run diagnostics:

```powershell
npm run android:check
```

If Gradle asks for Android SDK Platform 36, install it from Android Studio SDK Manager. This local machine also has an `android-36` platform prepared from the installed API 36.1 base SDK for debug preview builds.

## HTTP Cleartext

The Android project includes:

```text
android/app/src/main/res/xml/network_security_config.xml
```

and the manifest enables development cleartext traffic. This is only for local preview. Production should use HTTPS.

## Security

Do not put provider API keys in Android code or frontend code. Tavily, DeepSeek, OpenAI, and other provider keys must remain in server-side `.env`.

## Cloud APK for aileida.zh.kg

多人同步 APK 必须打开同一个云端 HTTPS 服务：

```powershell
$env:NEXT_PUBLIC_MOBILE_BASE_URL="https://aileida.zh.kg"
$env:CAPACITOR_SERVER_URL="https://aileida.zh.kg"
npm run mobile:sync
npm run mobile:build:debug:win
```

云端模式下：

- `server.url` 指向 `https://aileida.zh.kg`
- `cleartext` 会关闭
- `allowMixedContent` 会关闭
- API Key 仍只存在 Vercel 环境变量里，不会打进 APK

验证：

- 手机浏览器能打开 `https://aileida.zh.kg`
- APK 能打开同一套页面
- Web 和 APK 创建/运行 Topic 后能看到同一份报告、通知和运行日志

## Round 8 Icon and Splash Status

Current debug APK polish:

- Android app name: `AI信息雷达`.
- Adaptive launcher icon now points to the project radar foreground and soft radar-grid background resources.
- Web brand sources live in `public/brand`, `public/icons`, and `public/splash`.
- Status bar and navigation bar use the light app background color to reduce the WebView shell feel.

Current limitation:

- Existing legacy `mipmap-*` PNG fallback assets are still present for older launchers.
- Native splash PNGs under `android/app/src/main/res/drawable*` are still the Capacitor-generated preview resources.
- The debug APK is for local preview and is not Play Store ready.

Next release steps:

1. Export density-specific PNG launcher icons from `public/icons/app-icon.svg`.
2. Replace all `mipmap-*` launcher PNGs, including round variants.
3. Export splash PNGs from `public/splash/splash-light.svg`.
4. Switch production preview to HTTPS server URL.
5. Generate a release keystore and configure Gradle signing.
6. Build `assembleRelease`, then verify install, startup, provider fallback, and mobile safe-area behavior on a real device.
