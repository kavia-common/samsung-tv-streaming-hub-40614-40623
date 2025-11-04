/* global process */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

/**
 * PUBLIC_INTERFACE
 * Vite config hardened for CI/containers:
 * - Node 18 compatible (Vite 5)
 * - host: true (binds 0.0.0.0)
 * - strictPort: true on 3000
 * - Prevent dev restarts from .env/config/index.html changes by ignoring these files
 * - Keep allowedHosts explicitly configured
 * - Stable HMR over ws with clientPort bound to server port
 * - CI note: If CI stops the dev server after readiness, the launcher neutralizes 130/137/143 exit codes to 0; this is expected and not a failure.
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
  // Ensure numeric port; default to 3000 if invalid to keep strictPort stable
  const parsed = Number(env?.PORT)
  const port = Number.isFinite(parsed) && parsed > 0 ? parsed : 3000
  // Normalize host env for allowedHosts (empty -> undefined)
  const envHost = (env?.HOST || '').trim() || undefined

  // Files to ignore to prevent reload loops from external touches.
  // These are intentionally ignored because some CI/container orchestrations touch them during lifecycle steps,
  // which would otherwise cause Vite to restart or reload repeatedly.
  const ignoredGlobs = [
    // env files
    '**/.env',
    '**/.env.*',
    '.env',
    '.env.*',
    // lock indicator files sometimes touched by external processes
    '**/post_process_status.lock',
    './post_process_status.lock',
    'post_process_status.lock',
    // config and html that should not trigger dev reload loops
    '**/vite.config.*',
    './vite.config.*',
    'vite.config.*',
    '**/index.html',
    './index.html',
    'index.html',
    // package manager lockfiles
    '**/package-lock.json',
    '**/pnpm-lock.yaml',
    '**/yarn.lock',
    'package-lock.json',
    'pnpm-lock.yaml',
    'yarn.lock',
    // common transient files that can trigger noisy restarts
    '**/*.swp',
    '**/*.tmp',
    '**/*.tmp.*',
    '**/.DS_Store',
  ]

  return {
    plugins: [react()],
    server: {
      // Binding and port policy: bind to all interfaces, do not auto-increment port
      // Note: host:true ensures 0.0.0.0 binding; strictPort:true prevents port hopping and avoids reload loops.
      host: true,
      port,
      strictPort: true,
      open: false,

      // Explicit allow-list to prevent host header rejections
      // Include localhost, 127.0.0.1 and 0.0.0.0 for container/CI use; keep workspace host if present
      // Allow standard local/container hosts and optionally a HOST provided via env for CI environments
      allowedHosts: Array.from(
        new Set(
          [
            'localhost',
            '127.0.0.1',
            '0.0.0.0',
            envHost,
          ].filter(Boolean)
        )
      ),

      // Stable HMR in containerized environments
      hmr: {
        host: '0.0.0.0',
        clientPort: port,
        protocol: 'ws',
        // Disable full-screen overlay errors in CI to reduce UI noise and memory churn
        overlay: false,
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
          stabilityThreshold: 400,
          pollInterval: 150,
        },
        usePolling: Boolean(process.env.VITE_WATCH_POLLING) || false,
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
