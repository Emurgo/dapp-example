import React from 'react'
import ApiCard from './apiCard'
import {
  getBalance,
  getChangeAddress,
  getPubDRepKey,
  getRegPubStakeKey,
  getRewardAddress,
  getUnregPubStakeKey,
  getUTxOs,
} from '../../utils/helpFunctions'

// we need onWaiting
const GetAllInfoCard = ({api, wasm, setters}) => {
  const {
    setBalance,
    setAndMapUtxos,
    setChangeAddress,
    setRewardAddress,
    setDRepIdBech32,
    setDRepIdHex,
    setRegPubStakeKey,
    setUnregPubStakeKey,
  } = setters
  const getAllInfoClick = () => {
    getBalance(api, wasm)
      .then((adaValue) => {
        console.log('[dApp][GetAllInfoCard][getBalance]: ', adaValue)
        setBalance(adaValue)
      })
      .catch((e) => console.log(e))

    getUTxOs(api, wasm)
      .then((utxos) => {
        console.log('[dApp][GetAllInfoCard][getUTxOs]: ', utxos)
        setAndMapUtxos(utxos)
      })
      .catch((e) => console.log(e))

    getChangeAddress(api, wasm)
      .then((bech32Addr) => {
        console.log('[dApp][GetAllInfoCard][getChangeAddress]: ', bech32Addr)
        setChangeAddress(bech32Addr)
      })
      .catch((e) => console.log(e))

    getRewardAddress(api, wasm)
      .then((bech32Addr) => {
        console.log('[dApp][GetAllInfoCard][getRewardAddress]: ', bech32Addr)
        setRewardAddress(bech32Addr)
      })
      .catch((e) => console.log(e))

    getPubDRepKey(api, wasm)
      .then((drepKey) => {
        console.log('[dApp][GetAllInfoCard][getPubDRepKey]: ', drepKey)
        setDRepIdBech32(drepKey.dRepIDBech32)
        setDRepIdHex(drepKey.dRepIDHex)
      })
      .catch((e) => console.log(e))

    getRegPubStakeKey(api, wasm)
      .then((stakeKeyHash) => {
        console.log('[dApp][GetAllInfoCard][getRegPubStakeKey]: ', stakeKeyHash)
        setRegPubStakeKey(stakeKeyHash)
      })
      .catch((e) => console.log(e))

    getUnregPubStakeKey(api, wasm)
      .then((stakeKeyHash) => {
        console.log('[dApp][GetAllInfoCard][getUnregPubStakeKey]: ', stakeKeyHash)
        setUnregPubStakeKey(stakeKeyHash)
      })
      .catch((e) => {
        console.log(e)
      })
  }

  const apiProps = {
    apiName: 'Get Info',
    clickFunction: getAllInfoClick,
    color: 'bg-red-700  hover:bg-red-800 active:bg-red-500',
    height: 10,
  }

  return <ApiCard {...apiProps} />
}

export default GetAllInfoCard
