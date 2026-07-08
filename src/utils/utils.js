import {Buffer} from 'buffer'

export function bytesToHex(bytes) {
  return Buffer.from(bytes).toString('hex')
}

export function hexToBytes(hex) {
  return Buffer.from(hex, 'hex')
}

// Splits a string into an array of chunks each <= 64 bytes when UTF-8 encoded.
// Cardano metadatum text strings (CIP-20 messages, CIP-25 NFT fields) are capped
// at 64 BYTES (not chars). We accumulate whole code points (iterating a string
// yields code points, not UTF-16 units) so we never split a multibyte character.
export function chunkMessageTo64Bytes(message) {
  const chunks = []
  let current = ''
  let currentBytes = 0
  for (const ch of message) {
    const chBytes = Buffer.byteLength(ch, 'utf8')
    if (currentBytes + chBytes > 64) {
      if (current) chunks.push(current)
      current = ch
      currentBytes = chBytes
    } else {
      current += ch
      currentBytes += chBytes
    }
  }
  if (current) chunks.push(current)
  return chunks
}

export function wasmMultiassetToJSONs(wasmMultiasset) {
  let assetValue = []
  const wasmScriptHashes = wasmMultiasset?.keys()
  for (let i = 0; i < wasmScriptHashes?.len(); i++) {
    const wasmAssets = wasmMultiasset.get(wasmScriptHashes.get(i))
    const wasmAssetNames = wasmAssets.keys()
    const assetsJSON = {}
    for (let j = 0; j < wasmAssetNames.len(); j++) {
      const wasmAssetName = wasmAssetNames.get(j)
      const policyId = wasmScriptHashes.get(i).to_hex()
      const name = wasmAssetName.name().toHex()
      assetsJSON[`${policyId}.${name}`] = wasmAssets.get(wasmAssetName).to_str()
    }
    assetValue.push(assetsJSON)
  }
  return assetValue
}
