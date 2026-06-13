import fs from "fs";
import path from "path";

const repoRoot = process.cwd();
const contentDir = path.join(repoRoot, "src", "content");
const inputFile = path.join(contentDir, "projects.json");
const outputDir = path.join(contentDir, "projects");

if (!fs.existsSync(inputFile)) {
  console.error("No projects.json file found at src/content/projects.json");
  process.exit(1);
}

const raw = fs.readFileSync(inputFile, "utf8");
let items;
try {
  items = JSON.parse(raw);
} catch (e) {
  console.error("Failed to parse JSON:", e.message);
  process.exit(1);
}

if (!Array.isArray(items)) {
  console.error("Expected an array of projects in projects.json");
  process.exit(1);
}

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

for (let i = 0; i < items.length; i++) {
  const item = items[i];
  const slug = item.slug || item.title && slugify(item.title) || `project-${i + 1}`;
  const filename = `${slug}.json`;
  const outPath = path.join(outputDir, filename);
  fs.writeFileSync(outPath, JSON.stringify(item, null, 2) + "\n", "utf8");
  console.log(`Wrote ${outPath}`);
}

console.log(`Migration complete: wrote ${items.length} files to ${outputDir}`);
