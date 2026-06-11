import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

type Finding = {
  level: "info" | "warning" | "review";
  title: string;
  file?: string;
  detail: string;
};

const root = process.cwd();
const sourceRoots = ["app", "components", "lib", "public", "docs", "android/app/src/main/res"];
const ignoredDirs = new Set(["node_modules", ".next", "build", ".gradle", "dist", "coverage"]);
const textExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".md", ".json", ".xml", ".svg", ".html"]);
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

const findings: Finding[] = [];

function extension(file: string) {
  const match = file.match(/\.[^.]+$/);
  return match?.[0]?.toLowerCase() ?? "";
}

function walk(dir: string): string[] {
  const items: string[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) {
      continue;
    }

    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      items.push(...walk(fullPath));
    } else {
      items.push(fullPath);
    }
  }

  return items;
}

function add(level: Finding["level"], title: string, detail: string, file?: string) {
  findings.push({
    level,
    title,
    detail,
    file: file ? relative(root, file).replace(/\\/g, "/") : undefined
  });
}

const files = sourceRoots.flatMap((sourceRoot) => {
  try {
    return walk(join(root, sourceRoot));
  } catch {
    return [];
  }
});

const textFiles = files.filter((file) => textExtensions.has(extension(file)));
const publicImages = files.filter((file) => file.includes(`${join(root, "public")}\\`) || file.includes(`${join(root, "public")}/`)).filter((file) => imageExtensions.has(extension(file)));

const oldStylePatterns = [
  { pattern: /bg-white\/\[[0-9.]+\]/g, label: "legacy translucent card background" },
  { pattern: /border-white\/10/g, label: "legacy low-contrast border" },
  { pattern: /text-white\/[0-9]+/g, label: "legacy dark-surface text token" },
  { pattern: /rounded-\[1\.(15|25)rem\]/g, label: "old custom radius" },
  { pattern: /shadow-\[0_(18|24)px_(55|70)px/g, label: "old heavy shadow" }
];

const placeholderPatterns = [
  { pattern: /lorem ipsum/i, label: "lorem ipsum placeholder" },
  { pattern: /todo:|fixme:/i, label: "developer placeholder" },
  { pattern: /coming soon|敬请期待/i, label: "unfinished feature copy" },
  { pattern: /AI[- ]?powered magical|革命性|颠覆性|重新定义/i, label: "generic launch copy" }
];

const referencePatterns = [
  { pattern: /unsplash|pexels|pixabay|midjourney|reference image/i, label: "external/reference image mention" },
  { pattern: /https?:\/\/[^"')\s]+\.(png|jpg|jpeg|webp|gif)/i, label: "remote raster image URL" }
];

let hardcodedRadiusCount = 0;
let hardcodedShadowCount = 0;

for (const file of textFiles) {
  const content = readFileSync(file, "utf8");
  const ext = extension(file);

  for (const { pattern, label } of oldStylePatterns) {
    const matches = content.match(pattern);
    if (matches?.length) {
      add("review", "Old visual token", `${label}: ${matches.length} occurrence(s). Prefer the current light product tokens.`, file);
    }
  }

  for (const { pattern, label } of placeholderPatterns) {
    if (pattern.test(content)) {
      add("warning", "Placeholder or weak copy", `Found ${label}. Replace with user-facing release copy.`, file);
    }
  }

  for (const { pattern, label } of referencePatterns) {
    if (ext === ".md" && label === "external/reference image mention") {
      continue;
    }

    if (pattern.test(content)) {
      add("review", "Asset provenance check", `Found ${label}. Confirm it is not a copied or unknown-license asset.`, file);
    }
  }

  hardcodedRadiusCount += content.match(/rounded-\[[^\]]+\]/g)?.length ?? 0;
  hardcodedShadowCount += content.match(/shadow-\[[^\]]+\]/g)?.length ?? 0;
}

for (const image of publicImages) {
  const size = statSync(image).size;
  if (size > 350 * 1024) {
    add("warning", "Large public image", `${Math.round(size / 1024)}KB. Confirm compression and license before release.`, image);
  } else {
    add("info", "Public raster image", `${Math.round(size / 1024)}KB. Confirm this file is intentional and licensed.`, image);
  }
}

if (hardcodedRadiusCount > 80) {
  add("review", "Many hardcoded radii", `${hardcodedRadiusCount} arbitrary radius tokens found. Consider centralizing common card/button radii.`);
}

if (hardcodedShadowCount > 80) {
  add("review", "Many hardcoded shadows", `${hardcodedShadowCount} arbitrary shadow tokens found. Consider centralizing common elevations.`);
}

console.log("\nUI Audit: Design QA + Release Polish");
console.log("====================================");
console.log(`Scanned ${textFiles.length} text files and ${publicImages.length} public raster images.`);

if (!findings.length) {
  console.log("\nNo obvious UI release issues found.");
  process.exit(0);
}

const groups: Finding["level"][] = ["warning", "review", "info"];
for (const level of groups) {
  const items = findings.filter((finding) => finding.level === level);
  if (!items.length) {
    continue;
  }

  console.log(`\n${level.toUpperCase()} (${items.length})`);
  for (const item of items.slice(0, 40)) {
    console.log(`- ${item.title}${item.file ? ` [${item.file}]` : ""}`);
    console.log(`  ${item.detail}`);
  }
  if (items.length > 40) {
    console.log(`  ... ${items.length - 40} more item(s) omitted.`);
  }
}

console.log("\nAudit completed. Findings are advisory; fix warnings before release builds when practical.");
