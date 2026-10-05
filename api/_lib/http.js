// Small helpers shared by the API functions: JSON body, per-IP rate limit (best effort, per instance), JSON replies.
export async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > 100_000) throw new Error('too large');
    chunks.push(c);
  }
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
}

export function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

const hits = new Map();
export function limited(req, key, max, windowMs) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'ip').split(',')[0].trim();
  const id = `${key}:${ip}`;
  const now = Date.now();
  const list = (hits.get(id) || []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(id, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return list.length > max;
}
