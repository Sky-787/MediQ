// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    modulePreload: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('recharts')) return 'charts'
          if (id.includes('react-router-dom')) return 'router'
          if (id.includes('zustand')) return 'state'
          if (id.includes('zod') || id.includes('react-hook-form') || id.includes('@hookform')) {
            return 'forms'
          }
          if (id.includes('lucide-react')) return 'icons'
          if (id.includes('axios')) return 'network'
          if (id.includes('react')) return 'react-vendor'
        },
      },
    },
  },
})
