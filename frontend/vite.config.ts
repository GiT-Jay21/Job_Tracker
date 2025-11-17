import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite dev server config with a proxy for `/api` -> backend (http://localhost:3000).
// This ensures browser requests to `/api/*` are forwarded to the Rust backend and avoids CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // Use the IPv4 loopback address to avoid IPv6 (::1) connection issues on Windows.
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        // remove the `/api` prefix before forwarding so `/api/jobs` -> `/jobs` on the backend
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
