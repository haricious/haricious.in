// Serverless PIN auth for admin access.
// Set ADMIN_PIN in Vercel env vars to a 10-digit PIN. If not set, fallback PIN '0000000000' is accepted (dev only).

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { pin } = req.body || {};
    const serverPin = process.env.ADMIN_PIN || '0000000000';
    if (!pin) return res.status(400).json({ ok: false, error: 'Missing pin' });
    if (String(pin) === String(serverPin)) {
      return res.status(200).json({ ok: true });
    }
    return res.status(401).json({ ok: false, error: 'Invalid pin' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
}
