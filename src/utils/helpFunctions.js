import {getCslValue, getUtxoFromHex, getBech32AddressFromHex} from './cslTools'

export const getBalance = async (api, wasm) => {
  const hexBalance = await api.getBalance()
  const cslValue = getCslValue(wasm, hexBalance)
  const adaValue = cslValue.coin().to_str()
  return adaValue
}

export const getUTxOs = async (api, wasm, amountLovelaces, requestParam = {page: 0, limit: 5}) => {
  const utxos = []
  const hexUtxos = await api.getUtxos(amountLovelaces, requestParam)
  for (const hexUtxo of hexUtxos) {
    const utxo = getUtxoFromHex(wasm, hexUtxo)
    utxos.push(utxo)
  }
  return utxos
}

export const getChangeAddress = async (api, wasm) => {
  const hexAddress = await api.getChangeAddress()
  return getBech32AddressFromHex(wasm, hexAddress)
}

export const getRewardAddress = async (api, wasm) => {
  const hexAddresses = await api.getRewardAddresses()
  const addresses = []
  for (const hexAddr of hexAddresses) {
    addresses.push(getBech32AddressFromHex(wasm, hexAddr))
  }
  return addresses[0]
}

export const getPubDRepKey = async (api, wasm) => {
  const pubDRepKeyHex = await api.cip95.getPubDRepKey()
  const dRepID = wasm.PublicKey.from_hex(pubDRepKeyHex).hash()
  const dRepIDHex = dRepID.to_hex()
  const dRepIDBech32 = dRepID.to_bech32('drep')

  return {
    dRepIDHex: dRepIDHex,
    dRepIDBech32: dRepIDBech32,
  }
}

export const getRegPubStakeKey = async (api, wasm) => {
  const regPubStakeKeysHex = await api.cip95.getRegisteredPubStakeKeys()
  if (regPubStakeKeysHex.length < 1) {
    return regPubStakeKeysHex
  }
  const regPubStakeKeyHex = regPubStakeKeysHex[0]
  const stakeKeyHash = wasm.PublicKey.from_hex(regPubStakeKeyHex).hash().to_hex()

  return stakeKeyHash
}

export const getUnregPubStakeKey = async (api, wasm) => {
  const unregPubStakeKeysHex = await api.cip95.getUnregisteredPubStakeKeys()
  if (unregPubStakeKeysHex.length < 1) {
    return unregPubStakeKeysHex
  }
  const unregPubStakeKeyHex = unregPubStakeKeysHex[0]
  const stakeKeyHash = wasm.PublicKey.from_hex(unregPubStakeKeyHex).hash().to_hex()

  return stakeKeyHash
}
