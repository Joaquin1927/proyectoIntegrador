import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  optimizeDeps: {
    exclude: ["@azure/msal-browser", "@azure/msal-react"]
  },

  build: {
    // Aumenta el límite de tamaño de los chunks
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      // Si quieres excluir papaparse del bundle y cargarlo como dependencia externa
      external: ['papaparse']
    }
  }
})
