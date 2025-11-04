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
 * - Set HMR clientPort/host to keep hot updates stable behind proxies.
 */
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Resolve project root based on this config file, avoiding process.cwd()
  const root = new URL('.', import.meta.url).pathname
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

      // Explicit host allow-list
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
      ],

      // HMR stability in containerized/proxied environments
      hmr: {
        host: '0.0.0.0',
        clientPort: port,
        protocol: 'ws',
      },

      // Limit the watch scope by ignoring volatile files.
      watch: {
        ignored: ignoredGlobs,
      },

      // Restrict file system access to the project root
      fs: {
        strict: true,
        allow: [root],
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
    },

    optimizeDeps: {},
  }
})
