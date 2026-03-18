import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['sqlite3'],
  outputFileTracingIncludes: {
    '/*': ['node_modules/.pnpm/sqlite@*/**/*', 'node_modules/.pnpm/sqlite3@*/**/*'],
  },
  turbopack: {
    root: rootDir,
  },
}

export default nextConfig
