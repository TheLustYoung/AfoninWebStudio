// POST /api/lead  { name, contact, answers, notes, lang, page, hp }  ->  sends the request to the owner's Telegram.
// The price is recalculated here from `answers` with the same rules as in the browser, so the client cannot send a made-up estimate.
import { limited, readJson, send } from './_lib/http.js';
import { calc, cleanAnswers, summaryRu } from '../src/estimate-engine.js';

const clip = (v, n) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

export function buildText({ name, contact, answers, notes, lang, page }) {
  const result = calc(answers);
  const lines = ['🆕 Заявка с сайта (калькулятор)', `👤 ${name}`, `📞 ${contact}`, `🌐 Язык сайта: ${lang} · ${page || '/'}`, ''];
  lines.push(result ? summaryRu(answers, result, notes) : `Описание клиента: ${notes || '—'}`);
  const text = lines.join('\n');
  return text.length > 3900 ? text.slice(0, 3890) + '…' : text;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'method' });
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return send(res, 503, { error: 'not_configured' });
  if (limited(req, 'lead', 5, 60 * 60_000)) return send(res, 429, { error: 'rate' });

  let body;
  try {
    body = await readJson(req);
  } catch {
    return send(res, 400, { error: 'bad_json' });
  }
  if (body.hp) return send(res, 200, { ok: true }); // honeypot: bots fill hidden fields
  const name = clip(body.name, 80);
  const contact = clip(body.contact, 120);
  if (name.length < 2 || contact.length < 5) return send(res, 400, { error: 'bad_contact' });

  const text = buildText({
    name,
    contact,
    answers: cleanAnswers(body.answers),
    notes: clip(body.notes, 800),
    lang: clip(body.lang, 4) || 'ru',
    page: clip(body.page, 80),
  });
  try {
    const r = await fetch(`${process.env.TELEGRAM_BASE_URL || 'https://api.telegram.org'}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!r.ok) {
      console.error('telegram', r.status, (await r.text()).slice(0, 200));
      return send(res, 502, { error: 'upstream' });
    }
    return send(res, 200, { ok: true });
  } catch (err) {
    console.error('lead failed', err?.message);
    return send(res, 502, { error: 'upstream' });
  }
}
