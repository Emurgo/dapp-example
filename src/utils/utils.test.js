import {bytesToHex, hexToBytes} from './utils'

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
