import { Buffer } from "buffer";

export function bytesToHex(bytes) {
  return Buffer.from(bytes).toString('hex');
}

export function hexToBytes(hex) {
  return Buffer.from(hex, 'hex');
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
      const policyId = bytesToHex(wasmScriptHashes.get(i).to_bytes())
      const name = bytesToHex(wasmAssetName.to_bytes())
      assetsJSON[`${policyId}.${name}`] = wasmAssets.get(wasmAssetName).to_str()
    }
    assetValue.push(assetsJSON)
  }
  return assetValue
}