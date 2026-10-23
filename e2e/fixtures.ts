import { readFileSync } from 'node:fs'
import { expect, test as base, type Page } from '@playwright/test'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { encodeWav } from '../src/lib/wav'

// Unique marker written into every fixture so we can prove it never leaves the page.
export const MARKER = 'ATOLYE-PRIVATE-MARKER-7f3a9c'

export async function makePdf(pages: number, label = 'Sayfa'): Promise<Buffer> {
  const doc = await PDFDocument.create()
  doc.setTitle(MARKER)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  for (let i = 1; i <= pages; i++) {
    const p = doc.addPage([400, 400])
    p.drawText(`${label} ${i}`, { x: 50, y: 200, size: 32, font })
  }
  return Buffer.from(await doc.save())
}

export async function makeWav(seconds: number): Promise<Buffer> {
  const rate = 8000
  const data = new Float32Array(rate * seconds)
  for (let i = 0; i < data.length; i++) data[i] = Math.sin((i / rate) * 440 * 2 * Math.PI) * 0.5
  return Buffer.from(await encodeWav([data], rate).arrayBuffer())
}

// Draws an image in the page and returns it as PNG bytes.
export async function makePng(page: Page, w: number, h: number, text?: string): Promise<Buffer> {
  const b64 = await page.evaluate(
    ([w, h, text]) => {
      const c = document.createElement('canvas')
      c.width = w as number
      c.height = h as number
      const g = c.getContext('2d')!
      g.fillStyle = '#fff'
      g.fillRect(0, 0, c.width, c.height)
      g.fillStyle = '#c33'
      g.fillRect(10, 10, 60, 60)
      if (text) {
        g.fillStyle = '#000'
        g.font = 'bold 56px sans-serif'
        g.fillText(text as string, 30, (h as number) / 2)
      }
      return c.toDataURL('image/png').split(',')[1]
    },
    [w, h, text ?? ''],
  )
  return Buffer.from(b64, 'base64')
}

export interface NetLog {
  external: string[]
  // requests the browser refused to send because of our CSP; nothing left the device
  blocked: string[]
  withBody: string[]
}

export const test = base.extend<{ net: NetLog }>({
  net: async ({ page, baseURL }, provide) => {
    const ownHosts = new Set([
      'localhost',
      '127.0.0.1',
      new URL(baseURL ?? 'http://localhost').hostname,
    ])
    const log: NetLog = { external: [], blocked: [], withBody: [] }
    page.on('request', (r) => {
      const url = new URL(r.url())
      if (!ownHosts.has(url.hostname) && url.protocol.startsWith('http')) {
        log.external.push(r.url())
      }
      if (r.postData() || r.method() !== 'GET') log.withBody.push(`${r.method()} ${r.url()}`)
    })
    page.on('requestfailed', (r) => {
      if (r.failure()?.errorText === 'csp') log.blocked.push(r.url())
    })
    await provide(log)
  },
})

export function expectNoLeak(net: NetLog) {
  const leaked = net.external.filter((u) => !net.blocked.includes(u))
  expect(leaked, 'requests to other origins').toEqual([])
  expect(net.withBody, 'non-GET or body-carrying requests').toEqual([])
}

export function readBytes(path: string): Buffer {
  return readFileSync(path)
}

export { expect }
