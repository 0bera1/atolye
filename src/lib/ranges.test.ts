import { describe, expect, it } from 'vitest'
import { parseRanges } from './ranges'

describe('parseRanges', () => {
  it('parses mixed ranges and singles', () => {
    expect(parseRanges('1-3, 5, 8-10', 10)).toEqual({ ok: true, pages: [0, 1, 2, 4, 7, 8, 9] })
  })
  it('rejects out-of-range pages', () => {
    expect(parseRanges('1-11', 10).ok).toBe(false)
    expect(parseRanges('0', 10).ok).toBe(false)
  })
  it('rejects reversed ranges and garbage', () => {
    expect(parseRanges('5-2', 10).ok).toBe(false)
    expect(parseRanges('a-b', 10).ok).toBe(false)
    expect(parseRanges('', 10).ok).toBe(false)
  })
})
