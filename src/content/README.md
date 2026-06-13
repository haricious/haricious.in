Editing site content (src/content/*.json)
=====================================

Where to edit
- The site's canonical content lives in the aggregated JSON files under `src/content/` (for example `field-notes.json`, `projects.json`, `books.json`, `repositories.json`).

How to edit
- Open the relevant file in `src/content/` and update or add entries. Keep the file valid JSON (use your editor's JSON formatter or a linter).
- Example: add a field note object to `field-notes.json` (it's an array of objects):

  {
    "slug": "my-new-note",
    "type": "FIELD NOTE",
    "title": "A short title",
    "date": "[2026.06.13]",
    "tags": ["tag1","tag2"],
    "body": ["Paragraph one.", "Paragraph two."]
  }

Committing and publishing
- After editing, commit your changes and push to `main`:

  git add src/content/*
  git commit -m "content: update <file>"
  git push origin main

- The Vercel deployment (if enabled) will pick up the pushed changes and redeploy the site.

Local preview
- Run the dev server to preview changes locally:

  npm install
  npm run dev

Notes and tips
- Don't include trailing commas; keep arrays/objects well-formed.
- For bulk edits you can edit the aggregated file directly or use scripts in `scripts/` if available.
- If you previously used per-item JSON files (under `src/content/<collection>/`), this site is now configured to read the aggregated files. Keep the aggregated files as the source of truth.

If you'd like, I can add a small validation script to check JSON schema before committing.
