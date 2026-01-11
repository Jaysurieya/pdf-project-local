import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,          // allow LAN access
    port: 5173,          // default Vite port
    strictPort: true     // don't auto-change port
  }
})
