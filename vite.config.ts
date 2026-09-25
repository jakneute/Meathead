import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `vite build --mode release` packs the whole game into one self-contained HTML file.
export default defineConfig(({ mode }) => ({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react(), tailwindcss(), ...(mode === 'release' ? [viteSingleFile()] : [])],
  build: mode === 'release' ? { outDir: 'release', emptyOutDir: true } : {},
}));
