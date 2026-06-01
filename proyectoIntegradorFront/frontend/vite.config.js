import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  optimizeDeps: {
    exclude: ["@azure/msal-browser", "@azure/msal-react"]
  }
})
