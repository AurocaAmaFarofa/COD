import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Em dev, /api vai para o back-end local: mesma origem, então o cookie de sessão funciona sem CORS.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
