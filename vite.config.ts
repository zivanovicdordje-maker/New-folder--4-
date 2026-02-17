// vite.config.ts
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    // Učitava env varijable
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
      // OBAVEZNO: Ovo mora da se poklapa sa imenom tvog GitHub repozitorijuma!
      // Ako ti je repo "Indodjija1", stavi '/Indodjija1/'
      // Ako je "New-folder--4-", ostavi ovako:
      base: '/New-folder--4-/', 
      
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
      // Ovo omogućava da kod pristupi sistemskim varijablama na GitHub Actions
      define: {
        'process.env': env
      }
    };
});
