// Vercel serverless function to exchange GitHub OAuth code for an access token.
// Requires environment variable: GITHUB_OAUTH_CLIENT_SECRET
// (Optional) GITHUB_OAUTH_CLIENT_ID can be set if you don't want to include client_id in config.yml

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { code, client_id } = req.body || {};
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;

  if (!code) return res.status(400).json({ error: "Missing 'code' in request body" });
  if (!clientSecret) return res.status(500).json({ error: "Server misconfigured: missing GITHUB_OAUTH_CLIENT_SECRET" });

  const payload = {
    client_id: client_id || process.env.GITHUB_OAUTH_CLIENT_ID || "",
    client_secret: clientSecret,
    code,
  };

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await tokenRes.json();
    if (data.error) return res.status(400).json(data);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
