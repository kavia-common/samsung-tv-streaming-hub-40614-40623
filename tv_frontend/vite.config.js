import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

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
 * - Set HMR clientPort/host to keep hot updates stable behind proxies/containers.
 * - Disable polling to avoid noisy reloads in CI where fs events work (usePolling: false).
 */
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Resolve project root based on this config file, avoiding process.cwd()
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const root = __dirname
  const env = loadEnv(mode, root, '')
  const port = Number(env.PORT) || 3000

  // Ignore env and config files to prevent reload loops.
  // Also ignore index.html as external tooling may touch it in some CI flows.
  const ignoredGlobs = [
    '**/.env',
    '**/.env.*',
    '**/post_process_status.lock',
    '**/vite.config.*',
    '**/index.html',
  ]

  return {
    plugins: [react()],
    server: {
      // Binding and port policy
      host: true, // 0.0.0.0
      port,
      strictPort: true, // fail instead of changing ports
      open: false,

      // Explicit host allow-list
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
      ],

      // HMR stability in containerized/proxied environments
      // Use container IP or 0.0.0.0 for host to avoid mismatch in CI;
      // clientPort kept to actual server port to prevent random ports.
      hmr: {
        host: '0.0.0.0',
        clientPort: port,
        protocol: 'ws',
        overlay: true,
      },

      // Limit the watch scope by ignoring volatile files.
      // Also apply awaitWriteFinish to prevent thrashing on rapid file writes.
      watch: {
        ignored: [
          ...ignoredGlobs,
          '**/node_modules/**',
          '**/package-lock.json',
          '**/pnpm-lock.yaml',
          '**/yarn.lock',
        ],
        awaitWriteFinish: {
          stabilityThreshold: 250,
          pollInterval: 100,
        },
        usePolling: false,
      },

      // Restrict file system access strictly to this container root
      fs: {
        strict: true,
        allow: [root],
        deny: ['..', resolve(root, '..')],
      },

      // Ensure we are not running middleware mode in CI
      middlewareMode: false,
    },

    // Mirror settings for preview
    preview: {
      host: true,
      port,
      strictPort: true,
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
      ],
      open: false,
    },

    optimizeDeps: {},
  }
})
