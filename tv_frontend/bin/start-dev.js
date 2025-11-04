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
 */
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'

const port = Number(process.env.PORT || 3000)
const host = '0.0.0.0'

function checkPortInUse(p, h) {
  return new Promise((resolve) => {
    const server = createServer()
    server.once('error', (err) => {
      if (err && (err.code === 'EADDRINUSE' || err.code === 'EACCES')) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
    server.once('listening', () => {
      server.close(() => resolve(false))
    })
    server.listen(p, h)
  })
}

const main = async () => {
  const inUse = await checkPortInUse(port, host)
  if (inUse) {
    console.log(`[start-dev] Port ${port} already in use. Assuming existing healthy dev server. Reusing http://${host}:${port}`)
    // Exit 0 so CI can reuse the already-running instance without failing the job.
    process.exit(0)
  }
  console.log(`[start-dev] Starting Vite on http://${host}:${port} (strictPort=true)`)

  // Use the vite config for host/port/strictPort; CLI flags reinforce binding and strict behavior.
  const child = spawn('npx', ['vite', '--host', host, '--port', String(port), '--strictPort'], {
    stdio: 'inherit',
    env: process.env,
  })

  child.on('exit', (code, signal) => {
    // Note: In CI, a forced stop (e.g., SIGKILL 9 leading to 137) will report via signal.
    if (signal) {
      console.log(`[start-dev] Vite process exited due to signal: ${signal}`)
      // Map signal exits to non-zero to surface unexpected terminations; 137 is typically external kill.
      process.exit(1)
    }
    process.exit(code ?? 1)
  })
}

main().catch((err) => {
  console.error('[start-dev] Unexpected error:', err)
  process.exit(1)
})
