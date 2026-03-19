/* global BigInt */

/**
 * Convert hex Wei string (e.g. "0x1a") to ETH string
 */
export const weiHexToEth = (hexWei) => {
  const wei = BigInt(hexWei)
  const divisor = BigInt('1000000000000000000') // 1e18
  const ethInt = wei / divisor
  const remainder = wei % divisor
  const remainderStr = remainder.toString().padStart(18, '0').replace(/0+$/, '') || '0'
  return `${ethInt}.${remainderStr}`
}

/**
 * Convert ETH float string to hex Wei for eth_sendTransaction
 */
export const ethToHexWei = (ethStr) => {
  const wei = BigInt(Math.round(parseFloat(ethStr) * 1e18))
  return '0x' + wei.toString(16)
}

/**
 * Format an address for display (0x1234...abcd)
 */
export const shortAddress = (addr) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''

/**
 * ERC-20 balanceOf(address) ABI encoding
 * selector: keccak256('balanceOf(address)')[0..3] = 0x70a08231
 */
export const balanceOfData = (addr) =>
  '0x70a08231' + addr.slice(2).toLowerCase().padStart(64, '0')

/**
 * ERC-20 transfer(address,uint256) ABI encoding
 * selector: keccak256('transfer(address,uint256)')[0..3] = 0xa9059cbb
 */
export const transferData = (to, amountWei) =>
  '0xa9059cbb' +
  to.slice(2).toLowerCase().padStart(64, '0') +
  BigInt(amountWei).toString(16).padStart(64, '0')
