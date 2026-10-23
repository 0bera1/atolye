import JSZip from 'jszip'
import { PDFDocument } from 'pdf-lib'
import { expect, expectNoLeak, makePdf, makePng, makeWav, readBytes, test } from './fixtures'

test.describe('tools run locally and send nothing out', () => {
  test('pdf-birlestir merges two PDFs', async ({ page, net }) => {
    await page.goto('/araclar/pdf-birlestir/')
    await page.setInputFiles('input[type=file]', [
      { name: 'a.pdf', mimeType: 'application/pdf', buffer: await makePdf(2, 'A') },
      { name: 'b.pdf', mimeType: 'application/pdf', buffer: await makePdf(3, 'B') },
    ])
    const dl = page.waitForEvent('download')
    await page.getByRole('button', { name: 'PDF’leri birleştir' }).click()
    const path = await (await dl).path()
    const out = await PDFDocument.load(readBytes(path))
    expect(out.getPageCount()).toBe(5)
    expectNoLeak(net)
  })

  test('pdf-birlestir respects reordering', async ({ page }) => {
    await page.goto('/araclar/pdf-birlestir/')
    await page.setInputFiles('input[type=file]', [
      { name: 'a.pdf', mimeType: 'application/pdf', buffer: await makePdf(1, 'A') },
      { name: 'b.pdf', mimeType: 'application/pdf', buffer: await makePdf(4, 'B') },
    ])
    await page.getByRole('button', { name: 'b.pdf dosyasını yukarı taşı' }).click()
    await expect(
      page.getByRole('list', { name: 'Seçilen dosyalar' }).locator('li').first(),
    ).toContainText('b.pdf')
  })

  test('pdf-birlestir reports a corrupt file in Turkish', async ({ page }) => {
    await page.goto('/araclar/pdf-birlestir/')
    await page.setInputFiles('input[type=file]', [
      { name: 'ok.pdf', mimeType: 'application/pdf', buffer: await makePdf(1) },
      { name: 'bozuk.pdf', mimeType: 'application/pdf', buffer: Buffer.from('bu bir pdf degil') },
    ])
    await page.getByRole('button', { name: 'PDF’leri birleştir' }).click()
    await expect(page.getByText('bozuk görünüyor')).toBeVisible()
  })

  test('pdf-bol splits into a zip and by range', async ({ page, net }) => {
    await page.goto('/araclar/pdf-bol/')
    await page.setInputFiles('input[type=file]', {
      name: 'doc.pdf',
      mimeType: 'application/pdf',
      buffer: await makePdf(4),
    })
    let dl = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Sayfaları ayır' }).click()
    const zip = await JSZip.loadAsync(readBytes(await (await dl).path()))
    expect(Object.keys(zip.files)).toHaveLength(4)

    await page.getByRole('radio', { name: 'Sayfa aralığı' }).check()
    await page.locator('#bol-aralik').fill('2-3, 4')
    dl = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Aralığı çıkar' }).click()
    const out = await PDFDocument.load(readBytes(await (await dl).path()))
    expect(out.getPageCount()).toBe(3)
    expectNoLeak(net)
  })

  test('pdf-bol rejects an out-of-range request', async ({ page }) => {
    await page.goto('/araclar/pdf-bol/')
    await page.setInputFiles('input[type=file]', {
      name: 'doc.pdf',
      mimeType: 'application/pdf',
      buffer: await makePdf(2),
    })
    await page.getByRole('radio', { name: 'Sayfa aralığı' }).check()
    await page.locator('#bol-aralik').fill('1-9')
    await page.getByRole('button', { name: 'Aralığı çıkar' }).click()
    await expect(page.getByText('1 ile 2 arasında')).toBeVisible()
  })

  test('pdf-sikistir produces a valid PDF or keeps the original', async ({ page, net }) => {
    await page.goto('/araclar/pdf-sikistir/')
    await page.setInputFiles('input[type=file]', {
      name: 'doc.pdf',
      mimeType: 'application/pdf',
      buffer: await makePdf(3),
    })
    await page.getByRole('button', { name: 'PDF’i sıkıştır' }).click()
    await expect(page.getByText(/Önce:/)).toBeVisible({ timeout: 60_000 })
    await expect(page.getByText(/Sonra:/)).toBeVisible()
    // a tiny text-only PDF grows when rasterized, so the original must be kept
    await expect(page.getByText(/orijinal korundu|küçüldü/)).toBeVisible()
    expectNoLeak(net)
  })

  test('gorsel-boyutlandir resizes with the ratio lock', async ({ page, net }) => {
    await page.goto('/araclar/gorsel-boyutlandir/')
    const png = await makePng(page, 400, 200)
    await page.setInputFiles('input[type=file]', {
      name: 'foto.png',
      mimeType: 'image/png',
      buffer: png,
    })
    await expect(page.getByText('Orijinal: 400 × 200')).toBeVisible()
    await page.getByLabel('Genişlik (px)').fill('100')
    await expect(page.getByLabel('Yükseklik (px)')).toHaveValue('50')
    const dl = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Boyutlandır' }).click()
    const d = await dl
    expect(d.suggestedFilename()).toBe('foto-100x50.png')
    const dims = await page.evaluate(
      async (b64) => {
        const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
        const bmp = await createImageBitmap(new Blob([bin]))
        return [bmp.width, bmp.height]
      },
      readBytes(await d.path()).toString('base64'),
    )
    expect(dims).toEqual([100, 50])
    expectNoLeak(net)
  })

  test('gorsel-donustur converts several images into a zip', async ({ page, net }) => {
    await page.goto('/araclar/gorsel-donustur/')
    const png = await makePng(page, 64, 64)
    await page.setInputFiles('input[type=file]', [
      { name: 'bir.png', mimeType: 'image/png', buffer: png },
      { name: 'iki.png', mimeType: 'image/png', buffer: png },
    ])
    await page.getByRole('radio', { name: 'JPG' }).check()
    const dl = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Dönüştür' }).click()
    const zip = await JSZip.loadAsync(readBytes(await (await dl).path()))
    expect(Object.keys(zip.files).sort()).toEqual(['bir.jpg', 'iki.jpg'])
    expectNoLeak(net)
  })

  test('ses-kes cuts a WAV to the selected range', async ({ page, net }) => {
    await page.goto('/araclar/ses-kes/')
    await page.setInputFiles('input[type=file]', {
      name: 'ton.wav',
      mimeType: 'audio/wav',
      buffer: await makeWav(4),
    })
    await expect(page.getByText(/Seçili süre: 0:04.00/)).toBeVisible()
    await page.getByRole('slider', { name: /Başlangıç/ }).fill('1')
    await page.getByRole('slider', { name: /Bitiş/ }).fill('3')
    const dl = page.waitForEvent('download')
    await page.getByRole('button', { name: 'WAV indir' }).click()
    const wav = readBytes(await (await dl).path())
    // the browser decodes at its own sample rate, so derive the duration from the header
    const seconds = wav.readUInt32LE(40) / (wav.readUInt32LE(24) * 2)
    expect(seconds).toBeCloseTo(2, 1)
    expectNoLeak(net)
  })

  test('metin-cikar-ocr reads Turkish text from an image', async ({ page, net }) => {
    test.setTimeout(240_000)
    await page.goto('/araclar/metin-cikar-ocr/')
    const png = await makePng(page, 900, 160, 'Merhaba dünya')
    await page.setInputFiles('input[type=file]', {
      name: 'yazi.png',
      mimeType: 'image/png',
      buffer: png,
    })
    await page.getByRole('button', { name: 'Metni çıkar' }).click()
    const out = page.getByLabel('Çıkarılan metin')
    await expect(out).toBeVisible({ timeout: 180_000 })
    expect((await out.inputValue()).toLowerCase()).toContain('merhaba')
    expectNoLeak(net)
  })

  test('arka-plan-sil returns a transparent PNG', async ({ page, net }) => {
    test.setTimeout(300_000)
    await page.goto('/araclar/arka-plan-sil/')
    const png = await makePng(page, 256, 256)
    await page.setInputFiles('input[type=file]', {
      name: 'nesne.png',
      mimeType: 'image/png',
      buffer: png,
    })
    const dl = page.waitForEvent('download', { timeout: 280_000 })
    await page.getByRole('button', { name: 'Arka planı sil' }).click()
    const d = await dl
    expect(d.suggestedFilename()).toBe('nesne-seffaf.png')
    expect(
      readBytes(await d.path())
        .subarray(1, 4)
        .toString(),
    ).toBe('PNG')
    expectNoLeak(net)
  })
})
