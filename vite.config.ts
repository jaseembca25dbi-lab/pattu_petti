import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const targetUrl = env.VITE_SUPABASE_URL || 'https://vrkwawzcvepqqxxlyfwx.supabase.co'

  return {
    base: './',
    plugins: [react()],
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('node_modules/@supabase')) {
              return 'vendor-supabase';
            }
          },
        },
      },
    },
    server: {
      proxy: {
        '/supabase-proxy': {
          target: targetUrl,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/supabase-proxy/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.removeHeader('referer');
              proxyReq.removeHeader('origin');
              proxyReq.setHeader('User-Agent', 'Pattupetti-Client/1.0');
            });
          },
        },
      },
    },
  }
})

