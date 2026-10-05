import { defineConfig, loadEnv } from 'vite';
import { pathToFileURL } from 'node:url';
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
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use(handle((name) => server.ssrLoadModule(`/api/${name}.js`)));
    },
    configurePreviewServer(server) {
      server.middlewares.use(handle((name) => import(pathToFileURL(resolve('api', `${name}.js`)).href)));
    },
  };
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  return { plugins: [localApi()] };
});
