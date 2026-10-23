import { describe, expect, it } from 'vitest'
import { encodeWav } from './wav'

describe('encodeWav', () => {
  it('writes a valid 16-bit PCM header and clamps samples', async () => {
    const blob = encodeWav([new Float32Array([0, 1, -1, 2])], 8000)
    const v = new DataView(await blob.arrayBuffer())
    const tag = String.fromCharCode(v.getUint8(0), v.getUint8(1), v.getUint8(2), v.getUint8(3))
    expect(tag).toBe('RIFF')
    expect(v.getUint32(24, true)).toBe(8000)
    expect(v.getUint32(40, true)).toBe(8)
    expect(v.getInt16(46, true)).toBe(32767)
    expect(v.getInt16(48, true)).toBe(-32768)
    expect(v.getInt16(50, true)).toBe(32767)
  })
})
