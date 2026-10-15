import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { m2Stub } from './tools/m2Stub';

/** `--mode steam`: the voice pack's left out of the page (the desktop app ships it as a file of its own, read through
 * the app: see electron/main.cjs), so a code change only changes the few-MB page, not 35 MB of it. The import's URL
 * becomes a marker the game knows to ask the app for (src/m1/App.tsx). */
const externalVoices = (): Plugin => ({
  name: 'meathead-external-voices',
  enforce: 'pre',
  resolveId: id => (/voices-m1\.bin\?url$/.test(id) ? '\0meathead-desktop-voices' : null),
  load: id => (id === '\0meathead-desktop-voices' ? `export default 'desktop:voices';` : null),
});

// Every build is one self-contained HTML file: `--mode public` (Meathead 1 standard: no cheats, the intro always; see
// src/m1/build.ts), `--mode release` (Meathead 1 with the cheats), `--mode m2public` / `--mode m2` (Meathead 2 without / with
// them); tools/release/build.mjs puts them in release-m1/ and release-m2/. `--mode steam`: the standard build for the
// desktop app, its voices outside the page (into .steam-build/page/, where tools/steam/package.mjs picks it up).
export default defineConfig(({ mode }) => ({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [
    ...(mode === 'steam' ? [externalVoices()] : []),
    react(), tailwindcss(),
    ...(mode === 'release' || mode === 'public' || mode === 'steam' || mode === 'm2' || mode === 'm2public' ? [viteSingleFile()] : []),
    ...(mode === 'm2' || mode === 'm2public' ? [m2Stub()] : []),
  ],
  // (`--mode m2`: Meathead 2, from meathead2.html, into a folder of its own)
  // (each into .build/<mode>/; tools/release/build.mjs moves the page into release-m1/ or release-m2/)
  build: mode === 'release' || mode === 'public' ? { outDir: `.build/${mode}`, emptyOutDir: true }
    : mode === 'steam' ? { outDir: '.steam-build/page', emptyOutDir: true }
    : mode === 'm2' || mode === 'm2public' ? { outDir: `.build/${mode}`, emptyOutDir: true, rollupOptions: { input: 'meathead2.html' } } : {},
}));
