const fs = require("node:fs");
const { execSync } = require("node:child_process");

if (fs.existsSync("android")) {
  console.log("[mobile:init] android directory already exists; skip `cap add android`.");
  process.exit(0);
}

execSync("npx cap add android", { stdio: "inherit" });
