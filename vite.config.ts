// vite.config.ts
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    // Učitava env varijable, ali na bezbedan način
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
      // OSTAVLJENO ISTO: Tvoja putanja
      base: '/', 
      
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      },
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        minify: 'esbuild',
      },
      // ISPRAVLJENO: Sada prosleđujemo samo neophodno, 
      // umesto celog process.env objekta koji je bio rizičan.
      define: {
        'process.env.NODE_ENV': JSON.stringify(mode),
        // Ako tvoj kod koristi specifične varijable iz .env fajla, 
        // ovde dodajemo prazan objekat da se build ne bi srušio
        'process.env': {} 
      }
    };
});
