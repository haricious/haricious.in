// Serverless PIN auth for admin access.
// Set ADMIN_PIN in Vercel env vars to a 10-digit PIN. If not set, fallback PIN '0000000000' is accepted (dev only).

// Basic in-memory rate limiting per IP (best-effort for serverless warm instances).
// For robust production use a persistent store (Redis) or a real rate-limiter service.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

const attemptsMap = global.__pinAttemptsMap || new Map();
global.__pinAttemptsMap = attemptsMap;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    const { pin } = req.body || {};
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
    const now = Date.now();

    let record = attemptsMap.get(ip);
    if (!record || now - record.first > WINDOW_MS) {
      record = { count: 0, first: now };
    }

    if (record.count >= MAX_ATTEMPTS) {
      const retryAfterSec = Math.ceil((WINDOW_MS - (now - record.first)) / 1000);
      res.setHeader('X-RateLimit-Limit', String(MAX_ATTEMPTS));
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({ ok: false, error: 'Too many attempts', retryAfter: retryAfterSec, remaining: 0 });
    }

    if (!pin) {
      // increment attempt for missing pin as well
      record.count += 1;
      attemptsMap.set(ip, record);
      const remaining = Math.max(0, MAX_ATTEMPTS - record.count);
      res.setHeader('X-RateLimit-Limit', String(MAX_ATTEMPTS));
      res.setHeader('X-RateLimit-Remaining', String(remaining));
      return res.status(400).json({ ok: false, error: 'Missing pin', remaining });
    }

    const serverPin = process.env.ADMIN_PIN || '0000000000';

    if (String(pin) === String(serverPin)) {
      // success: clear attempts for IP
      attemptsMap.delete(ip);
      res.setHeader('X-RateLimit-Limit', String(MAX_ATTEMPTS));
      res.setHeader('X-RateLimit-Remaining', String(MAX_ATTEMPTS));
      return res.status(200).json({ ok: true });
    }

    // failure: record attempt
    record.count += 1;
    attemptsMap.set(ip, record);
    const remaining = Math.max(0, MAX_ATTEMPTS - record.count);
    const retryAfterSec = remaining === 0 ? Math.ceil((WINDOW_MS - (now - record.first)) / 1000) : 0;
    res.setHeader('X-RateLimit-Limit', String(MAX_ATTEMPTS));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    if (retryAfterSec) res.setHeader('Retry-After', String(retryAfterSec));
    return res.status(401).json({ ok: false, error: 'Invalid pin', remaining, retryAfter: retryAfterSec });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
}
