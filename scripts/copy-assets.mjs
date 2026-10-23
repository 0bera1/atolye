// Copies heavy runtime assets (OCR engine/language data, background-removal
// model) from node_modules into public/, so they are served from our own origin.
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { join } from 'node:path'

const nm = 'node_modules'
const ensure = (d) => mkdirSync(d, { recursive: true })

// OCR
const tess = 'public/tesseract'
ensure(join(tess, 'langs'))
copyFileSync(join(nm, 'tesseract.js/dist/worker.min.js'), join(tess, 'worker.min.js'))
for (const f of readdirSync(join(nm, 'tesseract.js-core'))) {
  if (/^tesseract-core.*\.(js|wasm)$/.test(f))
    copyFileSync(join(nm, 'tesseract.js-core', f), join(tess, f))
}
for (const lang of ['eng', 'tur']) {
  copyFileSync(
    join(nm, `@tesseract.js-data/${lang}/4.0.0_best_int/${lang}.traineddata.gz`),
    join(tess, `langs/${lang}.traineddata.gz`),
  )
}

// Background removal (small model only, plus the ONNX runtime wasm builds)
const src = join(nm, '@imgly/background-removal-data/dist')
const dst = 'public/models'
ensure(dst)
const all = JSON.parse(readFileSync(join(src, 'resources.json'), 'utf8'))
const keep = [
  '/models/small',
  '/onnxruntime-web/ort-wasm-simd-threaded.wasm',
  '/onnxruntime-web/ort-wasm-simd.wasm',
]
const filtered = {}
for (const k of keep) {
  filtered[k] = all[k]
  for (const c of all[k].chunks) {
    if (!existsSync(join(dst, c.hash))) copyFileSync(join(src, c.hash), join(dst, c.hash))
  }
}
writeFileSync(join(dst, 'resources.json'), JSON.stringify(filtered))
console.log('[copy-assets] done')
