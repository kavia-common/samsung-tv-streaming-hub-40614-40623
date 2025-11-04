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

      // Limit the watch scope to src by default, while explicitly ignoring volatile files.
      watch: {
        // Use a function to be robust with different chokidar versions
        // Vite will pass these to chokidar's ignored option
        ignored: ignoredGlobs,
      },

      // Also ensure file system access restrictions to project root
      fs: {
        strict: true,
      },
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

    // Narrow the HMR watcher to the src directory to reduce noise
    // while still allowing normal module updates.
    // Note: This doesn't block Vite from serving index.html; it only narrows change detection.
    // For Vite 5, we can rely on server.watch.ignored and let HMR handle src/.
    // Keeping optimizeDeps default.
    optimizeDeps: {},
  }
})
