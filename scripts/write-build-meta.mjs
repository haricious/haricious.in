import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const outputPath = resolve("src/generated/site-meta.json");

function toStamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "[2024.03.15]";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `[${yyyy}.${mm}.${dd}]`;
}

function gitDateFor(file) {
  try {
    return execSync(`git log -1 --format=%cI -- ${file}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

const nowDate = gitDateFor("src/App.jsx");
const meta = {
  generatedAt: toStamp(new Date().toISOString()),
  nowLastUpdated: nowDate ? toStamp(nowDate) : "[2024.03.15]",
  nowLastUpdatedSource: nowDate
    ? "git commit date for src/App.jsx"
    : "manual fallback because this workspace is not a git repository",
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(meta, null, 2)}\n`);
