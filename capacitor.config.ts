import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl =
  process.env.CAPACITOR_SERVER_URL ||
  process.env.NEXT_PUBLIC_MOBILE_BASE_URL ||
  "http://10.0.2.2:3000";
const isCloudServerUrl = serverUrl.startsWith("https://");

const config: CapacitorConfig = {
  appId: "com.aiinforadar.app",
  appName: "AI信息雷达",
  webDir: "public",
  server: {
    url: serverUrl,
    cleartext: !isCloudServerUrl
  },
  android: {
    allowMixedContent: !isCloudServerUrl
  }
};

export default config;
