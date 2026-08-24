import {bech32} from 'bech32'

export const POOL_KEY_HASH_BYTES = 28
export const HEX_POOL_ID_LENGTH = POOL_KEY_HASH_BYTES * 2

export const classifyPoolId = (raw) => {
  const value = typeof raw === 'string' ? raw.trim() : ''
  if (!value) {
    throw new Error('Pool ID is required')
  }

  const hexCandidate = value.replace(/^0x/i, '')
  if (/^[0-9a-fA-F]+$/.test(hexCandidate)) {
    if (hexCandidate.length !== HEX_POOL_ID_LENGTH) {
      throw new Error('Hex pool key hash must be 56 characters')
    }
    return {format: 'hex', value: hexCandidate.toLowerCase()}
  }

  const bech32Candidate = value.toLowerCase()
  if (bech32Candidate.startsWith('pool1')) {
    let decoded
    try {
      decoded = bech32.decode(bech32Candidate)
    } catch {
      throw new Error('Bech32 pool ID is not a valid pool1… encoding')
    }
    if (decoded.prefix !== 'pool') {
      throw new Error('Bech32 pool ID must use the pool prefix')
    }
    const payloadLength = bech32.fromWords(decoded.words).length
    if (payloadLength !== POOL_KEY_HASH_BYTES) {
      throw new Error('Bech32 pool ID must encode a 28-byte pool key hash')
    }
    return {format: 'bech32', value: bech32Candidate}
  }

  throw new Error('Pool ID must be a bech32 pool1… ID or a 56-character hex pool key hash')
}
