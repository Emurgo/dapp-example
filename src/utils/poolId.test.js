import {Buffer} from 'buffer'
import {bech32} from 'bech32'
import {classifyPoolId, HEX_POOL_ID_LENGTH} from './poolId'

const hex = 'deadbeef01234567890abcdef01234567890abcdef01234567890abc'
const validBech32 = bech32.encode('pool', bech32.toWords(Buffer.from(hex, 'hex')))

describe('classifyPoolId', () => {
  it('rejects empty and whitespace-only input', () => {
    expect(() => classifyPoolId('')).toThrow(/required/)
    expect(() => classifyPoolId('   ')).toThrow(/required/)
    expect(() => classifyPoolId(null)).toThrow(/required/)
  })

  it('accepts a 56-character hex pool key hash', () => {
    expect(hex).toHaveLength(HEX_POOL_ID_LENGTH)
    expect(classifyPoolId(hex)).toEqual({format: 'hex', value: hex})
  })

  it('strips a 0x prefix and lowercases hex', () => {
    expect(classifyPoolId('0xDEADBEEF01234567890ABCDEF01234567890ABCDEF01234567890ABC')).toEqual({
      format: 'hex',
      value: hex,
    })
  })

  it('rejects hex of the wrong length', () => {
    expect(() => classifyPoolId('deadbeef')).toThrow(/56 characters/)
    expect(() => classifyPoolId(`${'ab'.repeat(29)}`)).toThrow(/56 characters/)
  })

  it('accepts a valid pool1 bech32 ID', () => {
    expect(classifyPoolId(`  ${validBech32.toUpperCase()}  `)).toEqual({format: 'bech32', value: validBech32})
  })

  it('rejects truncated, padded and checksum-invalid pool1 strings', () => {
    expect(() => classifyPoolId('pool1qqqq')).toThrow(/valid pool1/)
    expect(() => classifyPoolId(`${validBech32}q`)).toThrow(/valid pool1/)
    expect(() => classifyPoolId('pool1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq')).toThrow(/valid pool1/)
  })

  it('rejects unrelated strings', () => {
    expect(() => classifyPoolId('addr1xyz')).toThrow(/bech32 pool1/)
  })
})
