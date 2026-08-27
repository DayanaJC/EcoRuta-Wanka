import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // En desarrollo, el frontend consume la API real de FastAPI sin CORS.
      '/api': 'http://127.0.0.1:8000',
    },
  },
})