import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite config tuned for CI/containers:
 * - Node 18 compatible (Vite 5)
 * - host: true (binds 0.0.0.0)
 * - strictPort: true on 3000
 * - Prevent dev restarts from .env/config changes by ignoring these files
 * - Do not touch/write .env at runtime anywhere in the project (no scripts should)
 *
 * Additionally:
 * - Use fs.strict/watch.ignored to avoid restarts when external processes touch files like vite.config.js or .env.
 * - Ensure allowedHosts includes 0.0.0.0 and common local hosts.
 */
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables so PORT from .env is respected in dev
  // Use the project root derived from this config file location to avoid using process.*
  const root = new URL('.', import.meta.url).pathname
  const env = loadEnv(mode, root, '')
  const port = Number(env.PORT) || 3000

  const ignoredGlobs = [
    '**/.env',
    '**/.env.*',
    '**/post_process_status.lock',
    '**/vite.config.*',
  ]

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
        ignored: ignoredGlobs,
      },
      // Also ensure file system ignores at a lower level
      fs: {
        strict: true,
      },
    },
    // Mirror settings for preview just in case it's used in CI
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
    // Provide chokidar watch ignores globally for extra safety with some toolchains
    // Vite respects server.watch.ignored; but some environments also read top-level "watch" field.
    // Keeping only server.watch is generally sufficient, so we avoid redundant top-level config.
    optimizeDeps: {
      // keep default
    },
  }
})
