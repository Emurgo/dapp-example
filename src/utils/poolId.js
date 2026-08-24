export const classifyPoolId = (raw) => {
  const value = typeof raw === 'string' ? raw.trim() : ''
  if (!value) {
    throw new Error('Pool ID is required')
  }

  const hexCandidate = value.replace(/^0x/i, '')
  if (/^[0-9a-fA-F]+$/.test(hexCandidate)) {
    if (hexCandidate.length !== 56) {
      throw new Error('Hex pool key hash must be 56 characters')
    }
    return {format: 'hex', value: hexCandidate.toLowerCase()}
  }

  if (/^pool1[0-9a-z]+$/i.test(value)) {
    return {format: 'bech32', value: value.toLowerCase()}
  }

  throw new Error('Pool ID must be a bech32 pool1… ID or a 56-character hex pool key hash')
}
