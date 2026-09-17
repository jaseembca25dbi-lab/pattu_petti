import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const targetUrl = env.VITE_SUPABASE_URL || 'https://vrkwawzcvepqqxxlyfwx.supabase.co'

  return {
    plugins: [react()],
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
