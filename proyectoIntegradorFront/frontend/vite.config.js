import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  optimizeDeps: {
    include: ["@azure/msal-browser", "@azure/msal-react"]
  },

  resolve: {
    alias: {
      crypto: "crypto-browserify"
    }
  },

  build: {
    chunkSizeWarningLimit: 1000
  }
})
