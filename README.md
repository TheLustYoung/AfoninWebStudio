# Afonin Web Studio

React + React Router DOM + Vite. Исходный дизайн главной сохранён.

## Запуск

```sh
npm install
npm run dev
```

## Маршруты

- `/` — главная.
- `/pricing` — полный прайс.
- `/pricing/websites` — сайты.
- `/pricing/automation` — боты, AI и автоматизация.
- `/pricing/webapps` — веб-приложения.
- `/pricing/support` — сопровождение.

Цены и состав работ: `src/pricing-data.js`, источник — предоставленная презентация, страницы 5–48.

## Сборка

`npm run build` создаёт `dist`. `npm run preview` обслуживает сборку с поддержкой BrowserRouter. Для размещения на другом сервере настройте SPA fallback: маршруты без существующего файла должны возвращать `index.html`. Vite dev/preview уже поддерживает прямое открытие и обновление вложенных маршрутов.
# AfoninWebStudio

## ИИ-калькулятор стоимости (чат на сайте)

Плавающая кнопка «Рассчитать стоимость» открывает чат: посетитель описывает проект (ТЗ), ИИ (Claude) называет примерную цену и срок по прайсу из `src/pricing-data.ru.js`, затем посетитель оставляет контакт, и заявка с оценкой приходит в Telegram.

- `src/EstimateChat.jsx`, `src/estimate-chat.css`, `src/i18n/estimate-chat.js` (тексты ru/en/hy) — виджет.
- `api/estimate.js` — запрос к Claude; `api/lead.js` — отправка заявки в Telegram; `api/_lib/prompt.js` — инструкция ИИ (прайс подтягивается из данных сайта).

Переменные окружения (Vercel → Project → Settings → Environment Variables, после добавления нужен redeploy), образец в `.env.example`:

| Переменная | Что это |
| --- | --- |
| `ANTHROPIC_API_KEY` | ключ API с console.anthropic.com |
| `TELEGRAM_BOT_TOKEN` | токен бота, который будет писать вам заявки |
| `TELEGRAM_CHAT_ID` | ваш числовой Telegram ID (бот должен быть запущен вами через /start) |
| `ESTIMATE_MODEL` | необязательно, по умолчанию `claude-haiku-4-5-20251001` |

Без ключей сайт работает, а чат честно сообщает, что калькулятор недоступен, и ведёт в Telegram. Локально: положите те же переменные в `.env.local` и запустите `npm run dev` (функции `/api/*` поднимаются из `vite.config.js`).
