// The smoke test's dev server (tools/smoke/run.mjs starts it as a process of its own): Vite, the project's config, no
// file watching: everything ignored (the watcher crawls tools/voices/cache's ~28k files for minutes on Windows, then
// trips over one and takes the server down; `watch: null` doesn't do it, Vite's config merge drops nulls).
import { createServer } from 'vite';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const server = await createServer({ root: ROOT, configFile: join(ROOT, 'vite.config.ts'), logLevel: 'error', optimizeDeps: { noDiscovery: true, include: ['react', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime'] }, server: { port: +(process.argv[2] ?? 5181), strictPort: true, watch: { ignored: () => true }, hmr: false } });
await server.listen();
console.log('ready');
