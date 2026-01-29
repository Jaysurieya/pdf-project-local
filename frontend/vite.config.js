import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true,          // allow LAN access
      port: 5173,          // default Vite port
      strictPort: true     // don't auto-change port
    },
    // Make env variables available in the app
    define: {
      __APP_ENV__: JSON.stringify(env)
    }
  }
})
