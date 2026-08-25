import {buildEnableOptions, isCip95Api, isCip95Tab, walletSupportsCip95} from './cip95'

describe('walletSupportsCip95', () => {
  it('returns false when supportedExtensions is missing', () => {
    expect(walletSupportsCip95({})).toBe(false)
    expect(walletSupportsCip95(undefined)).toBe(false)
  })

  it('returns false when CIP-95 is not listed', () => {
    expect(walletSupportsCip95({supportedExtensions: [{cip: 30}]})).toBe(false)
    expect(walletSupportsCip95({supportedExtensions: []})).toBe(false)
  })

  it('returns true when CIP-95 is listed as a number or numeric string', () => {
    expect(walletSupportsCip95({supportedExtensions: [{cip: 95}]})).toBe(true)
    expect(walletSupportsCip95({supportedExtensions: [{cip: '95'}]})).toBe(true)
  })
})

describe('buildEnableOptions', () => {
  it('omits extensions when the wallet does not advertise CIP-95', () => {
    expect(
      buildEnableOptions({
        requestIdentification: true,
        silent: false,
        wallet: {supportedExtensions: [{cip: 30}]},
      }),
    ).toEqual({
      requestIdentification: true,
      onlySilent: false,
    })
  })

  it('requests CIP-95 only when the wallet advertises it', () => {
    expect(
      buildEnableOptions({
        requestIdentification: false,
        silent: true,
        wallet: {supportedExtensions: [{cip: 95}]},
      }),
    ).toEqual({
      requestIdentification: false,
      onlySilent: true,
      extensions: [{cip: 95}],
    })
  })
})

describe('isCip95Api', () => {
  it('is true only when the enabled API exposes cip95', () => {
    expect(isCip95Api({cip95: {}})).toBe(true)
    expect(isCip95Api({})).toBe(false)
    expect(isCip95Api(null)).toBe(false)
  })
})

describe('isCip95Tab', () => {
  it('marks CIP-95 UI tabs and nothing else', () => {
    expect(isCip95Tab('cip95')).toBe(true)
    expect(isCip95Tab('cip95Tools')).toBe(true)
    expect(isCip95Tab('staking')).toBe(false)
    expect(isCip95Tab('cip30')).toBe(false)
  })
})
