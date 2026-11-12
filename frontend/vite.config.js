import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: { include: ['jspdf', 'jspdf-autotable'] }, // loaded on demand, so Vite wouldn't find them early
  server: {
    port: 5180,
    strictPort: true,
    proxy: { '/api': 'http://localhost:4100' },
  },
})
