// Price calculator without AI: fixed rules built from the studio price list (src/pricing-data.ru.js).
// Used by the chat widget (EstimateChat.jsx) in the browser and by api/lead.js on the server, so a request can never carry a made-up price.

export const PROJECTS = {
  landing: { price: 120000, from: false, days: [7, 7], langs: 1 },
  company: { price: 280000, from: false, days: [14, 14], langs: 2 },
  shop: { price: 480000, from: true, days: [25, 35], langs: 3 },
  'booking-bot': { price: 90000, from: true, days: [7, 10] },
  'catalog-bot': { price: 180000, from: true, days: [14, 20] },
  'ai-assistant': { price: 200000, from: true, days: [14, 14], monthly: 15000 },
  leads: { price: 40000, from: true, days: [2, 3] },
  admin: { price: 350000, from: true, days: [20, 30] },
  integrations: { price: 60000, from: true, days: [5, 10] },
  'custom-app': { price: 800000, from: true, days: null },
};
export const PROJECT_IDS = Object.keys(PROJECTS);

// One-time extras (prices from the "extras" of the price list). `monthly` is a recurring fee.
export const ADDONS = {
  'booking-bot': { price: 90000, days: [7, 10] },
  'catalog-bot': { price: 180000, days: [14, 20] },
  'ai-assistant': { price: 200000, days: [14, 14], monthly: 15000 },
  leads: { price: 40000, days: [2, 3] },
  integrations: { price: 60000, days: [5, 10] },
  'ads-meta': { price: 60000, days: [3, 5] },
  'ads-google': { price: 70000, days: [3, 5] },
  'ads-maps': { price: 50000, days: [3, 5] },
  'ads-manage': { price: 0, days: [0, 0], monthly: 90000 },
};
export const ADDON_IDS = Object.keys(ADDONS);
export const SUPPORT = { none: 0, basic: 20000, standard: 40000, growth: 80000 };
export const SUPPORT_IDS = Object.keys(SUPPORT);

export const LABELS_RU = {
  landing: 'Лендинг', company: 'Сайт компании', shop: 'Интернет-магазин', 'booking-bot': 'Telegram-бот записи', 'catalog-bot': 'Бот-каталог с заказами',
  'ai-assistant': 'AI-ассистент 24/7', leads: 'Заявки в таблицу или CRM', admin: 'Админ-панель и учёт', integrations: 'Интеграции и API', 'custom-app': 'Веб-приложение',
  'ads-meta': 'Запуск таргета Meta', 'ads-google': 'Запуск Google Ads', 'ads-maps': 'Реклама и карточки на Яндекс Картах', 'ads-manage': 'Ведение рекламы',
  basic: 'Сопровождение «Базовый»', standard: 'Сопровождение «Стандарт»', growth: 'Сопровождение «Рост»', lang: 'Дополнительные языки', pages: 'Запас на объём (больше 8 страниц)',
};

const round5k = (n) => Math.round(n / 5000) * 5000;

// answers: { project, langs (1..3), bigPages (bool), addons: [ids], support: 'none'|'basic'|'standard'|'growth' }
export function calc(answers) {
  const project = PROJECTS[answers?.project];
  if (!project) return null;
  const items = [{ id: answers.project, amount: project.price, from: project.from }];
  let min = project.price;
  let dMin = project.days ? project.days[0] : 0;
  let dMax = project.days ? project.days[1] : 0;
  let monthly = project.monthly || 0;

  const langs = Math.min(3, Math.max(1, Number(answers.langs) || project.langs || 1));
  if (project.langs && langs > project.langs) {
    const extra = round5k((langs - project.langs) * 0.3 * project.price);
    items.push({ id: 'lang', amount: extra, count: langs - project.langs });
    min += extra;
  }
  for (const id of new Set(answers.addons || [])) {
    const a = ADDONS[id];
    if (!a || id === answers.project) continue;
    if (a.price) {
      items.push({ id, amount: a.price });
      min += a.price;
    }
    if (a.monthly) {
      items.push({ id: `${id}:monthly`, amount: a.monthly, monthly: true });
      monthly += a.monthly;
    }
    dMin += a.days[0];
    dMax += a.days[1];
  }
  if (SUPPORT[answers.support]) {
    items.push({ id: answers.support, amount: SUPPORT[answers.support], monthly: true });
    monthly += SUPPORT[answers.support];
  }
  const custom = answers.project === 'custom-app';
  let factor = project.from ? 1.35 : 1.15;
  if (answers.project === 'company' && answers.bigPages) factor += 0.2;
  if (custom) factor = 2;
  const max = round5k(min * factor);
  return { min, max, monthly, items, daysMin: dMin, daysMax: dMax, custom };
}

const RULES = [
  ['custom-app', /приложен|личн\S* кабинет|портал|платформ|saas|crm-систем|web ?app|dashboard|cabinet|portal|platform|հավելված/i],
  ['catalog-bot', /(бот|bot|բոտ).{0,40}(каталог|заказ|товар|order|catalog)|(каталог|заказ|order).{0,40}(telegram|телеграм|бот|bot)/i],
  ['booking-bot', /запис[ьи]|бронир|booking|appointment|reservation|ամրագր|գրանց/i],
  ['shop', /магазин|корзин|интернет-?магазин|товар|\bshop\b|\bstore\b|e-?commerce|խանութ/i],
  ['ai-assistant', /ассистент|чат-?бот|\bии\b|нейро|\bai\b|chatbot|assistant|ասիստենտ/i],
  ['leads', /\bcrm\b|google sheets|таблиц|выгрузк|sheets|աղյուսակ/i],
  ['admin', /админ|складск|\bсклад|учёт|учет|\berp\b|admin|inventory|ադմին|հաշվառ/i],
  ['integrations', /интеграц|\bapi\b|webhook|эквайринг|idram|arca|оплат|payment|integration|ինտեգր/i],
  ['landing', /лендинг|одностраничн|landing|one-?page|լենդինգ/i],
  ['company', /сайт|веб-?сайт|визитк|корпоратив|website|web site|company site|business site|կայք/i],
  ['booking-bot', /\bбот\b|\bbot\b|telegram|телеграм|բոտ/i],
];
// Picks a project type by keywords in the visitor's free text. Returns an id or null.
export function detect(text) {
  const s = String(text || '');
  if (s.trim().length < 3) return null;
  const hit = RULES.find(([, re]) => re.test(s));
  return hit ? hit[0] : null;
}

const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
export const formatAmd = (n) => `${fmt(n)} ֏`;

export function itemLabelRu(it) {
  if (it.id.endsWith(':monthly')) return `${LABELS_RU[it.id.split(':')[0]]} (в месяц)`;
  if (it.id === 'lang') return `${LABELS_RU.lang} (${it.count})`;
  return LABELS_RU[it.id] || it.id;
}

// Plain-text summary in Russian: goes to the owner's Telegram and into the pre-filled message of the fallback links.
export function summaryRu(answers, result, notes) {
  const lines = [`Проект: ${LABELS_RU[answers.project]}`];
  if (PROJECTS[answers.project]?.langs) lines.push(`Языков: ${Math.min(3, Math.max(1, Number(answers.langs) || PROJECTS[answers.project].langs))}`);
  if (answers.bigPages) lines.push('Объём: больше 8 страниц');
  lines.push(`Оценка: ${formatAmd(result.min)} – ${formatAmd(result.max)}${result.custom ? ' (точнее по ТЗ)' : ''}`);
  if (result.daysMax) lines.push(`Срок: ${result.daysMin === result.daysMax ? result.daysMin : `${result.daysMin}–${result.daysMax}`} рабочих дней`);
  else lines.push('Срок: по ТЗ');
  if (result.monthly) lines.push(`Ежемесячно: ${formatAmd(result.monthly)}`);
  for (const it of result.items) lines.push(`• ${itemLabelRu(it)}: ${it.from ? 'от ' : ''}${formatAmd(it.amount)}`);
  if (notes) lines.push('', `Описание клиента: ${String(notes).replace(/\s+/g, ' ').trim().slice(0, 800)}`);
  return lines.join('\n');
}

export function cleanAnswers(a) {
  if (!a || !PROJECTS[a.project]) return null;
  return {
    project: a.project,
    langs: Math.min(3, Math.max(1, Number(a.langs) || 1)),
    bigPages: !!a.bigPages,
    addons: (Array.isArray(a.addons) ? a.addons : []).filter((id) => ADDONS[id] && id !== a.project).slice(0, 12),
    support: SUPPORT_IDS.includes(a.support) ? a.support : 'none',
  };
}
