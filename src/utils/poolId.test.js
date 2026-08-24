import {classifyPoolId} from './poolId'

describe('classifyPoolId', () => {
  it('rejects empty and whitespace-only input', () => {
    expect(() => classifyPoolId('')).toThrow(/required/)
    expect(() => classifyPoolId('   ')).toThrow(/required/)
    expect(() => classifyPoolId(null)).toThrow(/required/)
  })

  it('accepts a 56-character hex pool key hash', () => {
    const hex = 'deadbeef01234567890abcdef01234567890abcdef01234567890abc'
    expect(classifyPoolId(hex)).toEqual({format: 'hex', value: hex})
  })

  it('strips a 0x prefix and lowercases hex', () => {
    expect(classifyPoolId('0xDEADBEEF01234567890ABCDEF01234567890ABCDEF01234567890ABC')).toEqual({
      format: 'hex',
      value: 'deadbeef01234567890abcdef01234567890abcdef01234567890abc',
    })
  })

  it('rejects hex of the wrong length', () => {
    expect(() => classifyPoolId('deadbeef')).toThrow(/56 characters/)
    expect(() => classifyPoolId(`${'ab'.repeat(29)}`)).toThrow(/56 characters/)
  })

  it('accepts a pool1 bech32 ID', () => {
    const poolId = 'pool1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq'
    expect(classifyPoolId(`  ${poolId.toUpperCase()}  `)).toEqual({format: 'bech32', value: poolId})
  })

  it('rejects unrelated strings', () => {
    expect(() => classifyPoolId('addr1xyz')).toThrow(/bech32 pool1/)
  })
})
