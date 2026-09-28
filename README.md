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
