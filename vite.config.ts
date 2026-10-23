/// <reference types="vitest/config" />
/// <reference types="vite-react-ssg" />
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// The dev server injects inline scripts (HMR) and tools need runtime code generation,
// so the strict CSP meta is only applied to production builds (see scripts/csp-hash.mjs).
const devWithoutCsp: Plugin = {
  name: 'dev-without-csp',
  apply: 'serve',
  transformIndexHtml: (html) =>
    html.replace(/<meta\s+http-equiv="Content-Security-Policy"[^>]*>/, ''),
}

// VITE_BASE: '/' for a custom domain, '/repo-name/' for a GitHub Pages sub path.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), devWithoutCsp],
  ssgOptions: {
    script: 'defer',
    formatting: 'none',
    dirStyle: 'nested',
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
