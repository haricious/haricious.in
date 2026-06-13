import fs from "fs";
import path from "path";

// Use process.cwd() so the script works reliably across platforms when run from project root
const repoRoot = process.cwd();
const contentDir = path.join(repoRoot, "src", "content");
const inputFile = path.join(contentDir, "field-notes.json");
const outputDir = path.join(contentDir, "field-notes");

if (!fs.existsSync(inputFile)) {
  console.error("No field-notes.json file found at src/content/field-notes.json");
  process.exit(1);
}

const raw = fs.readFileSync(inputFile, "utf8");
let notes;
try {
  notes = JSON.parse(raw);
} catch (e) {
  console.error("Failed to parse JSON:", e.message);
  process.exit(1);
}

if (!Array.isArray(notes)) {
  console.error("Expected an array of notes in field-notes.json");
  process.exit(1);
}

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

for (let i = 0; i < notes.length; i++) {
  const note = notes[i];
  const slug = note.slug || note.title && slugify(note.title) || `note-${i + 1}`;
  const filename = `${slug}.json`;
  const outPath = path.join(outputDir, filename);
  fs.writeFileSync(outPath, JSON.stringify(note, null, 2) + "\n", "utf8");
  console.log(`Wrote ${outPath}`);
}

console.log(`Migration complete: wrote ${notes.length} files to ${outputDir}`);
