import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

function run(command: string, args: string[] = []) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    shell: false
  });

  return {
    ok: result.status === 0,
    output: `${result.stdout ?? ""}${result.stderr ?? ""}`.trim()
  };
}

function executableFromJavaHome(name: "java" | "javac") {
  if (!process.env.JAVA_HOME) {
    return name;
  }

  const executable = join(process.env.JAVA_HOME, "bin", process.platform === "win32" ? `${name}.exe` : name);
  return existsSync(executable) ? executable : name;
}

function sdkFromLocalProperties() {
  const localPropertiesPath = join(process.cwd(), "android", "local.properties");
  if (!existsSync(localPropertiesPath)) {
    return "";
  }

  const content = readFileSync(localPropertiesPath, "utf8");
  const line = content.split(/\r?\n/).find((item) => item.trim().startsWith("sdk.dir="));
  if (!line) {
    return "";
  }

  return line
    .replace(/^sdk\.dir=/, "")
    .replace(/\\\\/g, "\\")
    .replace(/\\:/g, ":")
    .trim();
}

function line(label: string, ok: boolean, value: string, fix?: string) {
  console.log(`${label}: ${ok ? "found" : "missing"}${value ? ` - ${value}` : ""}`);
  if (!ok && fix) {
    console.log(`  fix: ${fix}`);
  }
}

const cwd = process.cwd();
const androidDir = join(cwd, "android");
const gradlew = join(androidDir, process.platform === "win32" ? "gradlew.bat" : "gradlew");
const apkPath = join(androidDir, "app", "build", "outputs", "apk", "debug", "app-debug.apk");
const serverUrl = process.env.CAPACITOR_SERVER_URL || process.env.NEXT_PUBLIC_MOBILE_BASE_URL || "http://10.0.2.2:3000";
const java = run(executableFromJavaHome("java"), ["-version"]);
const javac = run(executableFromJavaHome("javac"), ["-version"]);
const androidSdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || sdkFromLocalProperties();

console.log("Android Environment Check");
console.log("=========================");
line("Java", java.ok, java.output.split("\n")[0] ?? "", "安装 Android Studio/JDK 21，并设置 JAVA_HOME。");
line("Javac", javac.ok, javac.output.split("\n")[0] ?? "", "确保 JAVA_HOME/bin 在 PATH 中。");
line("JAVA_HOME", Boolean(process.env.JAVA_HOME), process.env.JAVA_HOME ?? "", "设置 JAVA_HOME，例如 D:\\Android studio\\jbr。");
line("Android SDK", Boolean(androidSdk), androidSdk, "安装 Android SDK，或在 android/local.properties 写入 sdk.dir。");
line("Android project", existsSync(androidDir), androidDir, "执行 npm run mobile:init。");
line("Gradle wrapper", existsSync(gradlew), gradlew, "重新执行 npx cap add android。");
line("Server URL", Boolean(serverUrl), serverUrl, "真机使用 CAPACITOR_SERVER_URL，云端使用 NEXT_PUBLIC_MOBILE_BASE_URL。");

if (existsSync(apkPath)) {
  const size = statSync(apkPath).size;
  line("Debug APK", true, `${apkPath} (${size} bytes)`);
} else {
  line("Debug APK", false, apkPath, "执行 npm run mobile:build:debug:win。");
}

console.log("");
console.log("建议:");
console.log("1. JDK 使用 Android Studio 自带 JBR 21 或独立 JDK 21。");
console.log("2. 设置 JAVA_HOME 后重新打开 PowerShell，或在当前终端手动刷新环境变量。");
console.log("3. 执行 java -version，确认输出 21.x。");
console.log("4. 执行 npm run mobile:sync，然后执行 npm run mobile:build:debug:win。");
