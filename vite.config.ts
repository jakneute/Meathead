import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { m2Stub } from './tools/m2Stub';

// `vite build --mode release` packs the whole game into one self-contained HTML file; `--mode public` the same, for
// players (no cheats, the intro always: see src/m1/build.ts), into a folder of its own.
export default defineConfig(({ mode }) => ({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react(), tailwindcss(), ...(mode === 'release' || mode === 'public' || mode === 'm2' ? [viteSingleFile()] : []), ...(mode === 'm2' ? [m2Stub()] : [])],
  // (`--mode m2`: Meathead 2, from meathead2.html, into a folder of its own)
  build: mode === 'release' ? { outDir: 'release', emptyOutDir: true } : mode === 'public' ? { outDir: 'release-public', emptyOutDir: true }
    : mode === 'm2' ? { outDir: 'release-m2', emptyOutDir: true, rollupOptions: { input: 'meathead2.html' } } : {},
}));
