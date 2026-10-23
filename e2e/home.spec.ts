import { expect, makePng, test } from './fixtures'

const READY = [
  ['PDF birleştir', 'PDF’leri birleştir'],
  ['PDF böl', 'Sayfaları ayır'],
  ['PDF sıkıştır', 'PDF’i sıkıştır'],
  ['Görsel boyutlandır', 'Boyutlandır'],
  ['Görsel dönüştür', 'Dönüştür'],
  ['Metin çıkar (OCR)', 'Metni çıkar'],
  ['Ses kes', null],
] as const

test('every drawer opens its tool on the home page without console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto('/')
  for (const [name, action] of READY) {
    await page
      .getByRole('button', { name: new RegExp(`^${name.replace(/[()]/g, '\\$&')}`) })
      .click()
    await expect(page.getByRole('heading', { name, level: 2 })).toBeVisible()
    if (action) await expect(page.getByRole('button', { name: action })).toBeVisible()
  }
  expect(errors).toEqual([])
})

test('background removal works when opened from the home page', async ({ page, net }) => {
  test.setTimeout(240_000)
  await page.goto('/')
  await page.getByRole('button', { name: /^Arka plan sil/ }).click()
  await expect(page).toHaveURL(/\/araclar\/arka-plan-sil\/?$/)
  const png = await makePng(page, 200, 200)
  await page.setInputFiles('input[type=file]', {
    name: 'a.png',
    mimeType: 'image/png',
    buffer: png,
  })
  const dl = page.waitForEvent('download', { timeout: 200_000 })
  await page.getByRole('button', { name: 'Arka planı sil' }).click()
  expect((await dl).suggestedFilename()).toBe('a-seffaf.png')
  expect(net.external).toEqual([])
})

test('theme toggle switches and keeps the choice', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /tema arasında geçiş/ }).click()
  const first = await page.evaluate(() => document.documentElement.dataset.theme)
  await page.reload()
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(first)
})
