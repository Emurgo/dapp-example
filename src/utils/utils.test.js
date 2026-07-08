import {Buffer} from 'buffer'
import {bytesToHex, hexToBytes, chunkMessageTo64Bytes} from './utils'

describe('bytesToHex / hexToBytes', () => {
  it('encodes bytes to a hex string', () => {
    expect(bytesToHex([0, 1, 15, 16, 255])).toBe('00010f10ff')
  })

  it('decodes a hex string back to bytes', () => {
    expect(Array.from(hexToBytes('00010f10ff'))).toEqual([0, 1, 15, 16, 255])
  })

  it('round-trips arbitrary data', () => {
    const original = [222, 173, 190, 239]
    expect(Array.from(hexToBytes(bytesToHex(original)))).toEqual(original)
  })
})

describe('chunkMessageTo64Bytes', () => {
  it('returns a single chunk for strings <= 64 bytes', () => {
    expect(chunkMessageTo64Bytes('hello')).toEqual(['hello'])
  })

  it('returns an empty array for an empty string', () => {
    expect(chunkMessageTo64Bytes('')).toEqual([])
  })

  it('splits on 64-byte boundaries for ASCII', () => {
    const input = 'a'.repeat(130)
    const chunks = chunkMessageTo64Bytes(input)
    expect(chunks.map((c) => c.length)).toEqual([64, 64, 2])
    expect(chunks.join('')).toBe(input)
  })

  it('chunks by bytes, never splitting a multibyte character', () => {
    // '€' is 3 UTF-8 bytes; 30 of them = 90 bytes -> must span 2 chunks,
    // and each chunk must stay <= 64 bytes without a broken character.
    const input = '€'.repeat(30)
    const chunks = chunkMessageTo64Bytes(input)
    chunks.forEach((c) => expect(Buffer.byteLength(c, 'utf8')).toBeLessThanOrEqual(64))
    expect(chunks.join('')).toBe(input)
  })
})
