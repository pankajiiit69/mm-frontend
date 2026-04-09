import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const currentDir = dirname(fileURLToPath(import.meta.url))
const parentDir = resolve(currentDir, '..')

function resolvePort(rawPort: string | undefined, fallbackPort: number): number {
  const parsed = Number(rawPort)
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    return fallbackPort
  }

  return parsed
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const fallbackEnv = loadEnv(mode, currentDir, '')
  const externalOverrideEnv = loadEnv(mode, parentDir, '')

  Object.assign(process.env, fallbackEnv, externalOverrideEnv)

  const devPort = resolvePort(process.env.VITE_PORT, 9085)

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['@fruzoos/auth-core'],
    },
    build: {
      sourcemap: true,
    },
    server: {
      port: devPort,
      strictPort: true,
    },
    preview: {
      port: devPort,
      strictPort: true,
    },
  }
})
