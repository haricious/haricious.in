# Admin (Decap / Netlify CMS) setup

1. Update the GitHub backend in `config.yml`:

   - Open `public/admin/config.yml` and replace `<GITHUB_USER>/<REPO>` with your repository `owner/name` and verify the `branch` value (e.g. `main`).

2. Migrate existing `field-notes.json` (one-time):

   From the project root run:

   ```bash
   node scripts/migrate-field-notes.mjs
   ```

   This will create `src/content/field-notes/*.json` files; the site already supports loading those with a fallback to the original `field-notes.json`.

3. Commit and push:

   ```bash
   git add src/content/field-notes public/admin
   git commit -m "chore: add admin UI and split field notes for CMS"
   git push
   ```

4. Access the admin UI:

   - Visit `https://<your-vercel-domain>/admin/` and sign in with GitHub to create/edit content.

Notes:

- The CMS is configured to create JSON files under `src/content/field-notes` and `src/content/projects`.
- You may wish to create `src/content/projects` directory and split `projects.json` if you want per-project files.
2b. Migrate other collections (optional but recommended):

```bash
node scripts/migrate-projects.mjs
node scripts/migrate-books.mjs
node scripts/migrate-repositories.mjs
```

After running these, the app will load per-item JSON files for `projects`, `books`, and `repositories` automatically (with fallback to the original files).

5. Commit and push:

```bash
git add src/content public/admin scripts
git commit -m "chore: add admin UI and migrate content for CMS"
git push
```
