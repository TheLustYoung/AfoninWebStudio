import { defineConfig, loadEnv } from 'vite';

// Dev only: serve the /api functions (api/*.js, the same files Vercel runs in production) from the Vite dev server.
// Variables for local tests come from a local .env file, which is never committed (see .env.example).
function localApi() {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const m = /^\/api\/([a-z-]+)(\?.*)?$/.exec(req.url || '');
        if (!m) return next();
        try {
          const mod = await server.ssrLoadModule(`/api/${m[1]}.js`);
          await mod.default(req, res);
        } catch (err) {
          console.error(err);
          res.statusCode = 500;
          res.end('{"error":"dev"}');
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  return { plugins: [localApi()] };
});
