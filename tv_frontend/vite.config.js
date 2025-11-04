import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

/**
 * Vite config hardened for CI/containers:
 * - Node 18 compatible (Vite 5)
 * - host: true (binds 0.0.0.0)
 * - strictPort: true on 3000
 * - Prevent dev restarts from .env/config/index.html changes by ignoring these files
 * - Keep allowedHosts explicitly configured
 * - Stable HMR over ws with clientPort bound to server port
 * - Avoid watch/reload loops via chokidar ignore + awaitWriteFinish
 * - Restrict fs access to project root
 */
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const root = __dirname

  // Never derive port from changing env while server runs; lock to 3000 unless user sets PORT before start.
  const env = loadEnv(mode, root, '')
  const port = Number(env?.PORT || 3000)

  // Files to ignore to prevent reload loops from external touches
  const ignoredGlobs = [
    '**/.env',
    '**/.env.*',
    // lock indicator files sometimes touched by external processes
    '**/post_process_status.lock',
    './post_process_status.lock',
    '**/vite.config.*',
    '**/index.html',
  ]

  return {
    plugins: [react()],
    server: {
      // Binding and port policy: bind to all interfaces, do not auto-increment port
      host: true,
      port,
      strictPort: true,
      open: false,

      // Explicit allow-list to prevent host header rejections
      allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0'],

      // Stable HMR in containerized environments
      hmr: {
        host: '0.0.0.0',
        clientPort: port,
        protocol: 'ws',
        overlay: true,
      },

      // Watch tuning: ignore volatile files and avoid thrashing
      watch: {
        ignored: [
          ...ignoredGlobs,
          '**/node_modules/**',
          '**/package-lock.json',
          '**/pnpm-lock.yaml',
          '**/yarn.lock',
        ],
        awaitWriteFinish: {
          stabilityThreshold: 300,
          pollInterval: 120,
        },
        usePolling: false,
      },

      // Restrict file system access to this root only
      fs: {
        strict: true,
        allow: [root],
        deny: ['..', resolve(root, '..')],
      },

      // Ensure standard dev server (not middleware) for CI
      middlewareMode: false,
    },

    preview: {
      host: true,
      port,
      strictPort: true,
      allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0'],
      open: false,
    },

    // Keep default optimizer; no special includes
    optimizeDeps: {},
  }
})
