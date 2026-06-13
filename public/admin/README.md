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

5. Configure GitHub OAuth (recommended)

Decap (Netlify) CMS needs GitHub OAuth to allow editors to commit changes. Follow these steps:

1. Create a GitHub OAuth App

   - Go to: https://github.com/settings/developers -> OAuth Apps -> New OAuth App
   - Application name: e.g. `haricious.in Admin`
   - Homepage URL: `https://<your-vercel-domain>/`
   - Authorization callback URL: `https://<your-vercel-domain>/admin/`
   - Register the app and copy the **Client ID** and **Client Secret**.

2. Keep the Client Secret private

   - Do NOT commit the Client Secret to the repository.
   - Recommended approaches:
     - Add a small OAuth proxy/serverless function on Vercel to perform the code->token exchange server-side using the Client Secret.
     - Or use a maintained OAuth proxy project (search "netlify-cms github oauth proxy").

3. Add the Client ID to `public/admin/config.yml`

   - Edit `public/admin/config.yml` and add the `auth.client_id` field under `backend` (see the commented example in the file).

4. Deploy and test

   - Deploy to Vercel after adding the OAuth proxy and environment variables for the client secret.
   - Visit `https://<your-vercel-domain>/admin/` and authenticate with GitHub.

6. Commit and push (final)

```bash
git add src/content public/admin scripts
git commit -m "chore: add CMS admin + migrate content for Decap CMS"
git push
```

If you'd like, I can create a Vercel serverless OAuth proxy for you that securely exchanges the GitHub code for a token and keeps the Client Secret out of the repo. Would you like me to implement that now?

7. Vercel environment variable (required)

   - In your Vercel project settings for `haricious-in`, add the following environment variable:

      - `GITHUB_OAUTH_CLIENT_SECRET` = (the Client Secret from GitHub)

   - Optionally add `GITHUB_OAUTH_CLIENT_ID` with the Client ID if you prefer the function to read it from env.

8. Deploy the site

   - Push the changes and redeploy on Vercel. The OAuth proxy endpoint will be available at:

      `https://haricious-in.vercel.app/api/github-oauth`

   - The admin UI connects to this endpoint for the token exchange; the secret is kept in Vercel and not committed to the repo.

Local testing notes

- The CMS config enables a `local_backend` which lets you exercise the admin UI locally without GitHub OAuth for quick edits and testing. This is intended for development only — production authentication still requires the OAuth proxy and `GITHUB_OAUTH_CLIENT_SECRET`.
- To test locally:

```bash
npm run dev
# open http://localhost:5173/admin/index.html
```

- When using the local backend, `Publish` will apply changes locally in the browser/editor and attempt to write files; for full commit-to-GitHub behavior deploy to Vercel with the OAuth proxy configured.

Deploy checklist

- Add `GITHUB_OAUTH_CLIENT_SECRET` to the Vercel project for `haricious-in`.
- Push these changes to the `main` branch and deploy on Vercel.
- Visit `https://haricious-in.vercel.app/admin/` and sign in with GitHub to confirm commits are created in the repo.
