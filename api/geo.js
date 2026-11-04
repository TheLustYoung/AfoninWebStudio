// GET /api/geo -> { country: 'AM' | null }. Vercel adds the visitor's country to each request; nothing is stored.
import { send } from './_lib/http.js';

export default function handler(req, res) {
  const raw = String(req.headers['x-vercel-ip-country'] || '').toUpperCase();
  send(res, 200, { country: /^[A-Z]{2}$/.test(raw) ? raw : null });
}
