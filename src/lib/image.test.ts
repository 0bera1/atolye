import { describe, expect, it } from 'vitest'
import { coverCrop, fitHeight, fitWidth } from './image'

describe('coverCrop', () => {
  it('crops the wider side symmetrically', () => {
    const c = coverCrop(1000, 500, 100, 100)
    expect(c.sw).toBe(500)
    expect(c.sh).toBe(500)
    expect(c.sx).toBe(250)
    expect(c.sy).toBe(0)
  })
})

describe('aspect ratio helpers', () => {
  it('keeps the ratio', () => {
    expect(fitHeight(1000, 500, 200)).toBe(100)
    expect(fitWidth(1000, 500, 100)).toBe(200)
  })
  it('never returns zero', () => {
    expect(fitHeight(1000, 1, 1)).toBe(1)
  })
})
