import { defineConfig, loadEnv } from 'vite';
import { pathToFileURL } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Local only: serve the /api functions (api/*.js, the same files Vercel runs in production) from `npm run dev` and `npm run preview`.
// Variables for local tests come from a local .env.local file, which is never committed (see .env.example).
function localApi() {
  const handle = (load) => async (req, res, next) => {
    const m = /^\/api\/([a-z-]+)(\?.*)?$/.exec(req.url || '');
    if (!m) return next();
    try {
      const mod = await load(m[1]);
      await mod.default(req, res);
    } catch (err) {
      console.error('[api]', m[1], err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end('{"error":"local"}');
    }
  };
  // `npm run preview` answers like Vercel with cleanUrls: /en/services -> dist/en/services.html, unknown address -> 404.html with status 404.
  const cleanUrls = (req, res, next) => {
    const path = (req.url || '/').split('?')[0];
    if (path === '/' || path.startsWith('/api/') || /\.[a-z0-9]+$/i.test(path)) return next();
    const clean = path.replace(/\/+$/, '');
    if (existsSync(resolve('dist', `.${clean}.html`))) {
      req.url = `${clean}.html`;
      return next();
    }
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(readFileSync(resolve('dist', '404.html')));
  };
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use(handle((name) => server.ssrLoadModule(`/api/${name}.js`)));
    },
    configurePreviewServer(server) {
      server.middlewares.use(handle((name) => import(pathToFileURL(resolve('api', `${name}.js`)).href)));
      server.middlewares.use(cleanUrls);
    },
  };
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  return {
    plugins: [localApi()],
    // Older phones keep working: syntax is lowered and CSS gets vendor prefixes for these versions.
    build: { target: ['es2020', 'chrome87', 'edge88', 'firefox78', 'safari14'], cssTarget: ['chrome87', 'edge88', 'firefox78', 'safari14', 'ios14'] },
  };
});
