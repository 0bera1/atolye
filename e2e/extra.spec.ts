import { closeSync, mkdirSync, openSync, truncateSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PDFDocument } from 'pdf-lib'
import { expect, makePdf, makePng, makeWav, readBytes, test } from './fixtures'

const SHOTS = process.env.SHOTS_DIR

test('pdf-sikistir really shrinks an image-heavy PDF', async ({ page, net }) => {
  await page.goto('/araclar/pdf-sikistir/')
  // noisy image = large PNG; rasterizing it as JPEG must be smaller
  const noise = await page.evaluate(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 900
    const g = c.getContext('2d')!
    const d = g.createImageData(900, 900)
    for (let i = 0; i < d.data.length; i += 4) {
      const v = (Math.sin(i * 0.0007) * 127 + 128 + Math.random() * 60) | 0
      d.data[i] = v
      d.data[i + 1] = 255 - v
      d.data[i + 2] = (v * 3) & 255
      d.data[i + 3] = 255
    }
    g.putImageData(d, 0, 0)
    return c.toDataURL('image/png').split(',')[1]
  })
  const doc = await PDFDocument.create()
  const img = await doc.embedPng(Buffer.from(noise, 'base64'))
  for (let i = 0; i < 2; i++) {
    const p = doc.addPage([400, 400])
    p.drawImage(img, { x: 0, y: 0, width: 400, height: 400 })
  }
  const bytes = Buffer.from(await doc.save())
  await page.setInputFiles('input[type=file]', {
    name: 'foto.pdf',
    mimeType: 'application/pdf',
    buffer: bytes,
  })
  await page.getByRole('radio', { name: 'Güçlü' }).check()
  const dl = page.waitForEvent('download')
  await page.getByRole('button', { name: 'PDF’i sıkıştır' }).click()
  const out = readBytes(await (await dl).path())
  expect(out.length).toBeLessThan(bytes.length)
  expect((await PDFDocument.load(out)).getPageCount()).toBe(2)
  await expect(page.getByText(/küçüldü/)).toBeVisible()
  expect(net.external).toEqual([])
})

test('large file shows a memory warning but is not blocked', async ({ page }) => {
  await page.goto('/araclar/pdf-bol/')
  const big = join(tmpdir(), 'dev.pdf')
  closeSync(openSync(big, 'w'))
  truncateSync(big, 101 * 1024 * 1024)
  await page.setInputFiles('input[type=file]', big)
  await expect(page.getByText('Bu dosya büyük.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sayfaları ayır' })).toBeEnabled()
})

test('unsupported image shows a clear message', async ({ page }) => {
  await page.goto('/araclar/gorsel-boyutlandir/')
  await page.setInputFiles('input[type=file]', {
    name: 'x.png',
    mimeType: 'image/png',
    buffer: Buffer.from('not an image'),
  })
  await expect(page.getByText('Bu görsel açılamadı')).toBeVisible()
})

test('ses-kes: dragging on the waveform moves the handles', async ({ page, net }) => {
  await page.goto('/araclar/ses-kes/')
  await page.setInputFiles('input[type=file]', {
    name: 'ton.wav',
    mimeType: 'audio/wav',
    buffer: await makeWav(4),
  })
  const canvas = page.getByRole('img', { name: /dalga formu/ })
  await expect(canvas).toBeVisible()
  const box = (await canvas.boundingBox())!
  // drag the end handle (starts at the far right) to roughly the middle
  await page.mouse.move(box.x + box.width - 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 5 })
  await page.mouse.up()
  const end = Number(await page.getByRole('slider', { name: /Bitiş/ }).inputValue())
  expect(end).toBeGreaterThan(1.7)
  expect(end).toBeLessThan(2.3)
  // preview starts and can be stopped
  await page.getByRole('button', { name: 'Önizle' }).click()
  await expect(page.getByRole('button', { name: /Durdur|Önizle/ })).toBeVisible()
  expect(net.external).toEqual([])
})

test('no horizontal scroll with tools loaded (390/768/1280, light+dark)', async ({ browser }) => {
  test.setTimeout(240_000)
  if (SHOTS) mkdirSync(SHOTS, { recursive: true })
  const slugs = [
    'pdf-birlestir',
    'pdf-bol',
    'pdf-sikistir',
    'gorsel-boyutlandir',
    'gorsel-donustur',
    'arka-plan-sil',
    'metin-cikar-ocr',
    'ses-kes',
  ]
  const overflow: string[] = []
  for (const scheme of ['light', 'dark'] as const) {
    for (const width of [390, 768, 1280]) {
      const ctx = await browser.newContext({
        viewport: { width, height: 900 },
        colorScheme: scheme,
      })
      const page = await ctx.newPage()
      for (const slug of slugs) {
        await page.goto(`/araclar/${slug}/`)
        const isPdf = slug.startsWith('pdf')
        const isAudio = slug === 'ses-kes'
        const file = isPdf
          ? {
              name: 'ornek-belge-uzun-dosya-adi.pdf',
              mimeType: 'application/pdf',
              buffer: await makePdf(3),
            }
          : isAudio
            ? { name: 'ton.wav', mimeType: 'audio/wav', buffer: await makeWav(3) }
            : {
                name: 'gorsel.png',
                mimeType: 'image/png',
                buffer: await makePng(page, 300, 200, 'Atolye'),
              }
        const files = slug === 'pdf-birlestir' ? [file, { ...file, name: 'ikinci.pdf' }] : file
        await page.setInputFiles('input[type=file]', files)
        await page.waitForTimeout(isAudio ? 600 : 250)
        const sw = await page.evaluate(() => document.documentElement.scrollWidth)
        if (sw > width) overflow.push(`${scheme} ${width} ${slug} scrollWidth=${sw}`)
        if (SHOTS) {
          await page.screenshot({ path: `${SHOTS}/${slug}-${scheme}-${width}.png`, fullPage: true })
        }
      }
      await ctx.close()
    }
  }
  expect(overflow).toEqual([])
})
