import {getCslValue, getUtxoFromHex, getBech32AddressFromHex, getPublicKeyFromHex} from './cslTools'

export const getBalance = async (api) => {
  const hexBalance = await api.getBalance()
  const cslValue = getCslValue(hexBalance)
  const adaValue = cslValue.coin().to_str()
  return adaValue
}

export const getUTxOs = async (api, amountLovelaces, requestParam = {page: 0, limit: 20}) => {
  const utxos = []
  const hexUtxos = await api.getUtxos(amountLovelaces, requestParam)
  for (const hexUtxo of hexUtxos) {
    const utxo = getUtxoFromHex(hexUtxo)
    utxos.push(utxo)
  }
  return utxos
}

export const getChangeAddress = async (api) => {
  const hexAddress = await api.getChangeAddress()
  return getBech32AddressFromHex(hexAddress)
}

export const getRewardAddress = async (api) => {
  const hexAddresses = await api.getRewardAddresses()
  const addresses = []
  for (const hexAddr of hexAddresses) {
    addresses.push(getBech32AddressFromHex(hexAddr))
  }
  return addresses[0]
}

export const getPubDRepKey = async (api) => {
  const pubDRepKeyHex = await api.cip95.getPubDRepKey()
  const dRepID = getPublicKeyFromHex(pubDRepKeyHex).hash()
  const dRepIDHex = dRepID.to_hex()
  const dRepIDBech32 = dRepID.to_bech32('drep')

  return {
    dRepIDHex: dRepIDHex,
    dRepIDBech32: dRepIDBech32,
  }
}

export const getRegPubStakeKey = async (api) => {
  const regPubStakeKeysHex = await api.cip95.getRegisteredPubStakeKeys()
  if (regPubStakeKeysHex.length < 1) {
    return regPubStakeKeysHex
  }
  const regPubStakeKeyHex = regPubStakeKeysHex[0]
  const stakeKeyHash = getPublicKeyFromHex(regPubStakeKeyHex).hash().to_hex()

  return stakeKeyHash
}

export const getUnregPubStakeKey = async (api) => {
  const unregPubStakeKeysHex = await api.cip95.getUnregisteredPubStakeKeys()
  if (unregPubStakeKeysHex.length < 1) {
    return unregPubStakeKeysHex
  }
  const unregPubStakeKeyHex = unregPubStakeKeysHex[0]
  const stakeKeyHash = getPublicKeyFromHex(unregPubStakeKeyHex).hash().to_hex()

  return stakeKeyHash
}

export const getUsedAddress = async (api) => {
  const requestParam = {page: 0, limit: 1}
  const hexAddresses = await api.getUsedAddresses(requestParam)
  const addresses = []
  for (const hexAddr of hexAddresses) {
    addresses.push(getBech32AddressFromHex(hexAddr))
  }
  return addresses[0]
}

export const getUnusedAddress = async (api) => {
  const hexAddresses = await api.getUnusedAddresses()
  const addresses = []
  for (const hexAddr of hexAddresses) {
    addresses.push(getBech32AddressFromHex(hexAddr))
  }
  return addresses[0]
}

const randomBytes = (count) => {
  const result = Array(count)
  for (let i = 0; i < count; ++i) {
    result[i] = Math.floor(256 * Math.random())
  }
  return result
}

const toHexString = (byteArray) => {
  return Array.from(byteArray, function (byte) {
    return ('0' + (byte & 0xff).toString(16)).slice(-2)
  }).join('')
}

export const getRandomHex = (bytes) => {
  const byteArr = randomBytes(bytes)
  return toHexString(byteArr)
}
