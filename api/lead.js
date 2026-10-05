// POST /api/lead  { name, contact, answers, notes, lang, page, hp }  ->  posts the request to the managers' Telegram group ("Заказы").
// The price is recalculated here from `answers` with the same rules as in the browser, so the client cannot send a made-up estimate.
import { limited, readJson, send } from './_lib/http.js';
import { calc, cleanAnswers, summaryRu } from '../src/estimate-engine.js';

const clip = (v, n) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

export const newLeadId = (now = new Date()) =>
  `LD-${String(now.getUTCFullYear()).slice(2)}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export function buildText({ id, name, contact, answers, notes, lang, page }) {
  const result = calc(answers);
  const lines = [`🆕 ЗАЯВКА ${id}`, 'Сайт Afonin Web Studio · калькулятор', '', `👤 ${name}`, `📞 ${contact}`, `🌐 Язык сайта: ${lang} · ${page || '/'}`, ''];
  lines.push(result ? summaryRu(answers, result, notes) : `Описание клиента: ${notes || '—'}`);
  lines.push('', '👇 Возьмите заявку: ответьте на это сообщение словом «беру» и свяжитесь с клиентом.');
  const text = lines.join('\n');
  return text.length > 3900 ? text.slice(0, 3890) + '…' : text;
}

// Link buttons that open a chat with the client in one tap (Telegram allows only http(s) links in buttons, so no tel: here; a phone number gets a WhatsApp button).
export function contactButtons(contact) {
  const buttons = [];
  const handle = /(?:t\.me\/|@)([A-Za-z][A-Za-z0-9_]{4,31})\b/.exec(contact);
  if (handle) buttons.push({ text: '✈️ Написать в Telegram', url: `https://t.me/${handle[1]}` });
  const digits = contact.replace(/[^\d]/g, '');
  if (!handle && digits.length >= 8 && digits.length <= 15) {
    buttons.push({ text: '💬 WhatsApp', url: `https://wa.me/${digits}` });
  }
  return buttons.length ? { inline_keyboard: [buttons] } : undefined;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'method' });
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID; // a group id looks like -1001234567890
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

  const id = newLeadId();
  const text = buildText({
    id,
    name,
    contact,
    answers: cleanAnswers(body.answers),
    notes: clip(body.notes, 800),
    lang: clip(body.lang, 4) || 'ru',
    page: clip(body.page, 80),
  });
  const payload = { chat_id: chat, text, disable_web_page_preview: true, reply_markup: contactButtons(contact) };
  if (process.env.TELEGRAM_THREAD_ID) payload.message_thread_id = Number(process.env.TELEGRAM_THREAD_ID); // optional: a topic of the group
  try {
    const r = await fetch(`${process.env.TELEGRAM_BASE_URL || 'https://api.telegram.org'}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });
    if (!r.ok) {
      console.error('telegram', r.status, (await r.text()).slice(0, 200));
      return send(res, 502, { error: 'upstream' });
    }
    return send(res, 200, { ok: true, id });
  } catch (err) {
    console.error('lead failed', err?.message);
    return send(res, 502, { error: 'upstream' });
  }
}
