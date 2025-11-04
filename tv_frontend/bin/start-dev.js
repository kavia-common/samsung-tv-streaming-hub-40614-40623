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
    process.exit(0)
  }
  console.log(`[start-dev] Starting Vite on http://${host}:${port} (strictPort=true)`)

  // Use the vite config for host/port/strictPort; CLI flags here only reinforce binding.
  const child = spawn('npx', ['vite', '--host', host, '--port', String(port)], {
    stdio: 'inherit',
    env: process.env,
  })

  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`[start-dev] Vite process exited due to signal: ${signal}`)
      process.exit(1)
    }
    process.exit(code ?? 1)
  })
}

main().catch((err) => {
  console.error('[start-dev] Unexpected error:', err)
  process.exit(1)
})
