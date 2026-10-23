// Adds sha256 hashes of each page's inline scripts to its CSP meta tag,
// so the policy can stay free of 'unsafe-inline' for scripts.
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : []
  })
}

// arka-plan-sil: its model runtime generates functions at load time, so only that page
// gets 'unsafe-eval'. Every other page keeps the strict policy.
let patched = 0
for (const file of walk('dist')) {
  const html = readFileSync(file, 'utf8')
  const hashes = [
    ...html.matchAll(
      /<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ].map((m) => `'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`)
  if (!hashes.length) continue
  const extra = file.includes('arka-plan-sil') ? ["'unsafe-eval'"] : []
  const out = html.replace(/(script-src 'self')/, `$1 ${[...new Set(hashes), ...extra].join(' ')}`)
  if (out !== html) {
    writeFileSync(file, out)
    patched++
  }
}
console.log(`[csp-hash] patched ${patched} pages`)
