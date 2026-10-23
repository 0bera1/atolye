import { describe, expect, it } from 'vitest'
import { formatBytes } from './format'

describe('formatBytes', () => {
  it('formats bytes, KB and MB with a decimal comma', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1536)).toBe('1,50 KB')
    expect(formatBytes(5 * 1024 * 1024)).toBe('5,00 MB')
    expect(formatBytes(50 * 1024 * 1024)).toBe('50,0 MB')
  })
})
