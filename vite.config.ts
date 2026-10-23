/// <reference types="vitest/config" />
/// <reference types="vite-react-ssg" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// VITE_BASE: '/' for a custom domain, '/repo-name/' for a GitHub Pages sub path.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
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
