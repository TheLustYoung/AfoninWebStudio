// POST /api/lead  { name, phone, contact, service, notes, lang, page, hp }  ->  posts the request to the managers' Telegram group ("Заказы").
import { limited, readJson, send } from './_lib/http.js';

const SERVICES = { website: 'Сайт или магазин', bot: 'Telegram-бот', crm: 'CRM или админ-панель', automation: 'Автоматизация и интеграции', support: 'Проект после запуска', other: 'Другое' };

const clip = (v, n) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

export const newLeadId = (now = new Date()) =>
  `LD-${String(now.getUTCFullYear()).slice(2)}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export function buildText({ id, name, phone, contact, service, notes, lang, page }) {
  const lines = [
    `🆕 ЗАЯВКА ${id}`, 'Сайт Afonin Web Studio', '',
    `👤 ${name}`, ...(phone ? [`📞 ${phone}`] : []), ...(contact ? [`✉️ ${contact}`] : []), `🌐 Язык сайта: ${lang} · ${page || '/'}`, '',
    `Что нужно: ${SERVICES[service] || SERVICES.other}`, `Задача: ${notes || '—'}`,
    '', '👇 Возьмите заявку: ответьте на это сообщение словом «беру» и свяжитесь с клиентом.'
  ];
  const text = lines.join('\n');
  return text.length > 3900 ? text.slice(0, 3890) + '…' : text;
}

// Link buttons that open a chat with the client in one tap (Telegram allows only http(s) links in buttons, so no tel: here; a phone number gets a WhatsApp button).
export function contactButtons(phone, contact) {
  const buttons = [];
  const handle = /(?:t\.me\/|@)([A-Za-z][A-Za-z0-9_]{4,31})\b/.exec(contact);
  if (handle) buttons.push({ text: '✈️ Написать в Telegram', url: `https://t.me/${handle[1]}` });
  const digits = phone.replace(/[^\d]/g, '');
  if (digits.length >= 8 && digits.length <= 15) {
    buttons.push({ text: '💬 WhatsApp', url: `https://wa.me/${digits}` });
  }
  return buttons.length ? { inline_keyboard: [buttons] } : undefined;
}

// Sends the request to the managers' Telegram group. True when delivered.
async function sendToTelegram({ token, chat, text, phone, contact }) {
  const payload = { chat_id: chat, text, disable_web_page_preview: true, reply_markup: contactButtons(phone, contact) };
  if (process.env.TELEGRAM_THREAD_ID) payload.message_thread_id = Number(process.env.TELEGRAM_THREAD_ID); // optional: a topic of the group
  const r = await fetch(`${process.env.TELEGRAM_BASE_URL || 'https://api.telegram.org'}/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000),
  });
  if (!r.ok) console.error('telegram', r.status, (await r.text()).slice(0, 200));
  return r.ok;
}

// Stores the request in the studio's admin panel (the client base). True when stored.
async function sendToAdmin({ url, key, lead }) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify(lead),
    signal: AbortSignal.timeout(10_000),
  });
  if (!r.ok) console.error('admin', r.status, (await r.text()).slice(0, 200));
  return r.ok;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'method' });
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID; // a group id looks like -1001234567890
  const adminUrl = process.env.ADMIN_LEADS_URL;
  const adminKey = process.env.ADMIN_LEADS_KEY;
  const toTelegram = !!(token && chat);
  const toAdmin = !!(adminUrl && adminKey);
  if (!toTelegram && !toAdmin) return send(res, 503, { error: 'not_configured' });
  if (limited(req, 'lead', 5, 60 * 60_000)) return send(res, 429, { error: 'rate' });

  let body;
  try {
    body = await readJson(req);
  } catch {
    return send(res, 400, { error: 'bad_json' });
  }
  if (body.hp) return send(res, 200, { ok: true }); // honeypot: bots fill hidden fields
  const name = clip(body.name, 80);
  const phone = clip(body.phone, 24);
  const contact = clip(body.contact, 120);
  if (name.length < 2 || (phone.replace(/\D/g, '').length < 8 && contact.length < 5)) return send(res, 400, { error: 'bad_contact' });

  const lead = {
    id: newLeadId(),
    name,
    phone,
    contact,
    service: clip(body.service, 20),
    notes: clip(body.notes, 1500),
    lang: clip(body.lang, 4) || 'ru',
    page: clip(body.page, 80),
  };
  // Both channels run independently: the visitor sees success if at least one of them has the request.
  const results = await Promise.allSettled([
    toTelegram ? sendToTelegram({ token, chat, text: buildText(lead), phone, contact }) : false,
    toAdmin ? sendToAdmin({ url: adminUrl, key: adminKey, lead }) : false,
  ]);
  results.forEach(r => { if (r.status === 'rejected') console.error('lead channel failed', r.reason?.message); });
  if (results.some(r => r.status === 'fulfilled' && r.value)) return send(res, 200, { ok: true, id: lead.id });
  return send(res, 502, { error: 'upstream' });
}
