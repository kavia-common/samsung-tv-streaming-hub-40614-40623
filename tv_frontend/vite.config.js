import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables so PORT from .env is respected in dev
  // Use the project root derived from this config file location to avoid using process.*
  const root = new URL('.', import.meta.url).pathname
  const env = loadEnv(mode, root, '')
  const port = Number(env.PORT) || 3000

  return {
    plugins: [react()],
    server: {
      host: true, // 0.0.0.0
      port,
      strictPort: true, // fail instead of changing ports
      // Centralize host allowance here; extend this array as needed for your environment.
      allowedHosts: [
        'localhost',
        '127.0.0.1',
      ],
    },
    preview: {
      host: true,
      port,
      strictPort: true,
      allowedHosts: [
        'localhost',
        '127.0.0.1',
      ],
    },
  }
})
