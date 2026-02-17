import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/Shasya-Haat/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'Shasya Haat',
          short_name: 'Shasya Haat',
          description: 'Smart Inventory & POS for Modern Kirana Stores',
          theme_color: '#F27A1A',
          background_color: '#F0EDE6',
          display: 'standalone',
          orientation: 'portrait',
          icons: [
            {
              src: 'favicon.svg',
              sizes: '192x192',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            },
            {
              src: 'favicon.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            }
          ]
        },
        devOptions: {
          enabled: true
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          // manualChunks: {
          //   vendor: ['react', 'react-dom'],
          //   ai: ['@google/genai', 'react-webcam'],
          //   icons: ['lucide-react']
          // }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
