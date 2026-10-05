// POST /api/estimate  { messages: [{role:'user'|'assistant', content}], lang }  ->  { reply, estimate? }
// Calls the Claude API with the studio price list and returns an approximate price for the visitor's brief.
import { SYSTEM, TOOL } from './_lib/prompt.js';
import { limited, readJson, send } from './_lib/http.js';

const MODEL = process.env.ESTIMATE_MODEL || 'claude-haiku-4-5-20251001';
const MAX_MESSAGES = 14;
const MAX_CHARS = 2000;

export function cleanMessages(input) {
  if (!Array.isArray(input)) return null;
  const out = [];
  for (const m of input.slice(-MAX_MESSAGES)) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') return null;
    const content = m.content.trim().slice(0, MAX_CHARS);
    if (!content) continue;
    if (out.length && out[out.length - 1].role === m.role) out[out.length - 1].content += `\n${content}`;
    else out.push({ role: m.role, content });
  }
  while (out.length && out[0].role !== 'user') out.shift();
  return out.length && out[out.length - 1].role === 'user' ? out : null;
}

export function cleanEstimate(e) {
  if (!e || typeof e !== 'object') return null;
  let min = Math.round(Number(e.min));
  let max = Math.round(Number(e.max));
  if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0) return null;
  if (max < min) [min, max] = [max, min];
  const str = (v, n) => String(v ?? '').slice(0, n);
  return {
    min,
    max,
    duration: str(e.duration, 80),
    summary: str(e.summary, 120),
    items: (Array.isArray(e.items) ? e.items : []).slice(0, 12).map((i) => ({ name: str(i?.name, 120), price: str(i?.price, 60) })),
    assumptions: (Array.isArray(e.assumptions) ? e.assumptions : []).slice(0, 8).map((a) => str(a, 200)),
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'method' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return send(res, 503, { error: 'not_configured' });
  if (limited(req, 'estimate', 25, 10 * 60_000)) return send(res, 429, { error: 'rate' });

  let body;
  try {
    body = await readJson(req);
  } catch {
    return send(res, 400, { error: 'bad_json' });
  }
  const messages = cleanMessages(body.messages);
  if (!messages) return send(res, 400, { error: 'bad_messages' });

  try {
    const r = await fetch((process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com') + '/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        temperature: 0.3,
        system: SYSTEM,
        tools: [TOOL],
        tool_choice: { type: 'tool', name: 'respond' },
        messages,
      }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!r.ok) {
      console.error('anthropic', r.status, (await r.text()).slice(0, 300));
      return send(res, 502, { error: 'upstream' });
    }
    const data = await r.json();
    const block = (data.content || []).find((b) => b.type === 'tool_use' && b.name === 'respond');
    const reply = String(block?.input?.reply || '').trim().slice(0, 3000);
    if (!reply) return send(res, 502, { error: 'empty' });
    return send(res, 200, { reply, estimate: cleanEstimate(block.input.estimate) });
  } catch (err) {
    console.error('estimate failed', err?.message);
    return send(res, 502, { error: 'upstream' });
  }
}
