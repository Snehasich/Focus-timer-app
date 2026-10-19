import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Exposes on 0.0.0.0 so other devices on Wi-Fi can open the app
    port: 5173,
    proxy: {
      '/login': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/register': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/tasks': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/activity': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
