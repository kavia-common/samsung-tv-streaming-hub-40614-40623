import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite config tuned for CI/containers:
 * - Node 18 compatible (Vite 5)
 * - host: true (binds 0.0.0.0)
 * - strictPort: true on 3000
 * - Prevent dev restarts from .env/config changes by ignoring these files
 * - Do not touch/write .env at runtime anywhere in the project (no scripts should)
 */
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
        // Allow typical Docker/CI internal hostnames/IPs
        '0.0.0.0',
      ],
      // Avoid hot-restart loop when .env/vite.config change externally in CI
      watch: {
        // Ignore .env* files and vite config itself during dev file watching to prevent restarts
        ignored: [
          '**/.env',
          '**/.env.*',
          // Ignore any lock/status files that CI may touch
          '**/post_process_status.lock',
          // Avoid bouncing server if config file is touched by external process
          '**/vite.config.*',
        ],
      },
    },
    preview: {
      host: true,
      port,
      strictPort: true,
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
      ],
    },
    // Narrow the file system watcher to src and index.html for stability
    // This reduces overhead and prevents accidental watches of root files
    optimizeDeps: {
      // keep default
    },
  }
})
