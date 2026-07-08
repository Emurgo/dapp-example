import {
  CHAIN_IDS,
  chainName,
  weiHexToEth,
  ethToHexWei,
  shortAddress,
  balanceOfData,
  transferData,
} from './ethereumUtils'

describe('chainName', () => {
  it('maps known chain ids to readable names', () => {
    expect(chainName(CHAIN_IDS.MAINNET)).toBe('Mainnet')
    expect(chainName(CHAIN_IDS.SEPOLIA)).toBe('Sepolia')
    expect(chainName(CHAIN_IDS.HOLESKY)).toBe('Holesky')
  })

  it('returns the raw id for unknown chains', () => {
    expect(chainName('0x99')).toBe('0x99')
  })

  it('returns "Unknown" when no chain id is given', () => {
    expect(chainName(undefined)).toBe('Unknown')
  })
})

describe('weiHexToEth', () => {
  it('converts whole ether', () => {
    expect(weiHexToEth('0xde0b6b3a7640000')).toBe('1.0') // 1e18 wei
  })

  it('converts fractional ether and trims trailing zeros', () => {
    expect(weiHexToEth('0x6f05b59d3b20000')).toBe('0.5') // 5e17 wei
  })

  it('handles zero', () => {
    expect(weiHexToEth('0x0')).toBe('0.0')
  })
})

describe('ethToHexWei', () => {
  it('converts an ether string to hex wei', () => {
    expect(ethToHexWei('1')).toBe('0xde0b6b3a7640000')
  })

  it('round-trips with weiHexToEth', () => {
    expect(weiHexToEth(ethToHexWei('2.5'))).toBe('2.5')
  })
})

describe('shortAddress', () => {
  it('shortens a full address', () => {
    expect(shortAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe('0x1234...5678')
  })

  it('returns empty string for falsy input', () => {
    expect(shortAddress('')).toBe('')
    expect(shortAddress(undefined)).toBe('')
  })
})

describe('ERC-20 ABI encoders', () => {
  const addr = '0x1234567890abcdef1234567890abcdef12345678'

  it('encodes balanceOf(address)', () => {
    const data = balanceOfData(addr)
    expect(data.startsWith('0x70a08231')).toBe(true)
    // selector (8) + 0x (2) + 64 hex chars of padded address
    expect(data.length).toBe(2 + 8 + 64)
    expect(data.endsWith(addr.slice(2))).toBe(true)
  })

  it('encodes transfer(address,uint256)', () => {
    const data = transferData(addr, '1')
    expect(data.startsWith('0xa9059cbb')).toBe(true)
    // selector (8) + 0x (2) + 64 (address) + 64 (amount)
    expect(data.length).toBe(2 + 8 + 64 + 64)
    expect(data.endsWith('1'.padStart(64, '0'))).toBe(true)
  })
})
