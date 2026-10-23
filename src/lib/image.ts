export type ImageMime = 'image/png' | 'image/jpeg' | 'image/webp'

export const MIME_EXT: Record<ImageMime, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

// Height that keeps the aspect ratio of (srcW x srcH) for a given width.
export function fitHeight(srcW: number, srcH: number, width: number): number {
  return Math.max(1, Math.round((width * srcH) / srcW))
}

export function fitWidth(srcW: number, srcH: number, height: number): number {
  return Math.max(1, Math.round((height * srcW) / srcH))
}

// Centered source rectangle that fills (dstW x dstH) without distortion.
export function coverCrop(srcW: number, srcH: number, dstW: number, dstH: number) {
  const scale = Math.max(dstW / srcW, dstH / srcH)
  const sw = dstW / scale
  const sh = dstH / scale
  return { sx: (srcW - sw) / 2, sy: (srcH - sh) / 2, sw, sh }
}

export async function loadBitmap(file: File): Promise<ImageBitmap> {
  return createImageBitmap(file)
}

function draw(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  bitmap: ImageBitmap,
  width: number,
  height: number,
  flatten: boolean,
  cover: boolean,
) {
  if (flatten) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
  }
  ctx.imageSmoothingQuality = 'high'
  if (cover) {
    const c = coverCrop(bitmap.width, bitmap.height, width, height)
    ctx.drawImage(bitmap, c.sx, c.sy, c.sw, c.sh, 0, 0, width, height)
  } else {
    ctx.drawImage(bitmap, 0, 0, width, height)
  }
}

// JPEG has no alpha channel, so transparent areas are flattened onto white.
export async function renderBlob(
  bitmap: ImageBitmap,
  width: number,
  height: number,
  mime: ImageMime,
  quality: number,
  cover = false,
): Promise<Blob> {
  const flatten = mime === 'image/jpeg'
  if (typeof OffscreenCanvas !== 'undefined') {
    const c = new OffscreenCanvas(width, height)
    draw(c.getContext('2d')!, bitmap, width, height, flatten, cover)
    return c.convertToBlob({ type: mime, quality })
  }
  const c = document.createElement('canvas')
  c.width = width
  c.height = height
  draw(c.getContext('2d')!, bitmap, width, height, flatten, cover)
  return new Promise((resolve, reject) =>
    c.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), mime, quality),
  )
}
