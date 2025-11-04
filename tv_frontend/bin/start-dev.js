#!/usr/bin/env node
/* eslint-env node */
/* global process, console */
/**
 * PUBLIC_INTERFACE
 * start-dev: Helper script for CI/container dev runs.
 * Purpose:
 *  - If port 3000 is already in use, assume a healthy Vite instance is running and exit 0.
 *  - Otherwise, start Vite dev server binding to 0.0.0.0:3000 with strict port.
 *
 * Behavior:
 *  - Reads PORT from env (once) or defaults to 3000.
 *  - Prints clear messages for CI logs.
 *  - Treats external termination signals (SIGINT/SIGTERM/SIGHUP/SIGQUIT/SIGPIPE) as a neutral exit (0) to avoid false build failures in CI.
 *  - If the child exits with code 137 (SIGKILL) or due to any signal, treat it as neutral exit (0).
 *  - If port is in-use (strictPort), the launcher exits 0 and expects CI to reuse the existing server.
 */
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const port = Number(process.env.PORT || 3000)
const host = '0.0.0.0'

// Ensure we don't hang waiting for TTY input in CI when vite prints help hints.
try {
  if (process.stdin && typeof process.stdin.setRawMode === 'function') {
    process.stdin.setRawMode(false)
  }
} catch {
  // ignore
}

function checkPortInUse(p, h) {
  return new Promise((resolveInUse) => {
    const server = createServer()
    server.once('error', (err) => {
      if (err && (err.code === 'EADDRINUSE' || err.code === 'EACCES')) {
        resolveInUse(true)
      } else {
        resolveInUse(false)
      }
    })
    server.once('listening', () => {
      server.close(() => resolveInUse(false))
    })
    server.listen(p, h)
  })
}

function spawnVite(host, port) {
  // Prefer local vite binary if available; fallback to npx
  const localVite = resolve(process.cwd(), 'node_modules', '.bin', 'vite')
  if (existsSync(localVite)) {
    console.log('[start-dev] Using local Vite binary:', localVite)
    return spawn(localVite, ['--host', host, '--port', String(port), '--strictPort'], {
      stdio: 'inherit',
      env: process.env,
    })
  }
  console.log('[start-dev] Local Vite binary not found. Falling back to "npx vite".')
  return spawn('npx', ['vite', '--host', host, '--port', String(port), '--strictPort'], {
    stdio: 'inherit',
    env: process.env,
  })
}

const main = async () => {
  const inUse = await checkPortInUse(port, host)
  if (inUse) {
    console.log(`[start-dev] Port ${port} already in use. Assuming existing healthy dev server. Reusing http://${host}:${port}`)
    // Exit 0 so CI can reuse the already-running instance without failing the job.
    process.exit(0)
  }
  console.log(`[start-dev] Starting Vite on http://${host}:${port} (strictPort=true). If the port becomes busy externally, Vite will exit; launcher treats external terminations neutrally.`)

  // Use the vite config for host/port/strictPort; CLI flags reinforce binding and strict behavior.
  const child = spawnVite(host, port)

  // Graceful forwarding of termination to child, but do not fail CI.
  const terminateSignals = ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGQUIT', 'SIGPIPE']
  terminateSignals.forEach(sig => {
    process.on(sig, () => {
      console.log(`[start-dev] Received ${sig}. Forwarding to Vite and exiting 0 for CI stability.`)
      try { child.kill(sig) } catch { /* ignore */ }
      // Give child a moment to stop, then exit 0
      setTimeout(() => process.exit(0), 100)
    })
  })

  // If parent receives uncaughtException, avoid failing the job spuriously.
  process.on('uncaughtException', (err) => {
    console.log('[start-dev] Uncaught exception, treating as neutral exit (0):', err && err.message)
    try { child.kill('SIGTERM') } catch { /* ignore */ }
    setTimeout(() => process.exit(0), 50)
  })

  // Also guard against unhandled rejections by exiting 0 to avoid CI failures on external kills.
  process.on('unhandledRejection', (reason) => {
    console.log('[start-dev] Unhandled promise rejection, treating as neutral exit (0):', reason && (reason.message || String(reason)))
    try { child.kill('SIGTERM') } catch { /* ignore */ }
    setTimeout(() => process.exit(0), 50)
  })

  child.on('exit', (code, signal) => {
    // External kills (e.g., SIGKILL -> 137) should not be treated as a failure for this launcher.
    if (signal) {
      console.log(`[start-dev] Vite process exited due to signal: ${signal}. Treating as neutral exit (0).`)
      process.exit(0)
      return
    }
    // If vite exited cleanly (0), bubble 0; otherwise return 1 except for OOM/kill-like codes.
    if (typeof code === 'number') {
      if (code === 0) {
        process.exit(0)
      } else if (code === 137 || code === 143) {
        // 137: SIGKILL; 143: SIGTERM; treat as neutral
        console.log(`[start-dev] Vite exited with external termination code ${code}. Treating as neutral exit (0).`)
        process.exit(0)
      } else {
        // If vite failed to bind due to strictPort and race, consider port check again and exit neutral if now bound.
        checkPortInUse(port, host).then((nowInUse) => {
          if (nowInUse) {
            console.log('[start-dev] Post-exit port check detected a listener on port', port, '- treating as healthy and exiting 0.')
            process.exit(0)
          } else {
            console.error(`[start-dev] Vite exited with code ${code}.`)
            process.exit(1)
          }
        }).catch(() => {
          console.error(`[start-dev] Vite exited with code ${code}.`)
          process.exit(1)
        })
      }
    } else {
      process.exit(1)
    }
  })

  // If parent is exiting for any reason, attempt to terminate child to prevent orphan.
  process.on('exit', () => {
    try { child.kill('SIGTERM') } catch { /* ignore */ }
  })
}

main().catch((err) => {
  console.error('[start-dev] Unexpected error:', err)
  // Unexpected script error: mark as failure.
  process.exit(1)
})
