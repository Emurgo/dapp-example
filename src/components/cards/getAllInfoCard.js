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

const GetAllInfoCard = ({api, wasm, onWaiting, onError, setters}) => {
  const {
    setBalance,
    setAndMapUtxos,
    setChangeAddress,
    setRewardAddress,
    setDRepIdBech32,
    setDRepIdHex,
    setDRepIdInputValue,
    setRegPubStakeKey,
    setUnregPubStakeKey,
  } = setters
  const getAllInfoClick = () => {
    onWaiting(true)
    getBalance(api, wasm)
      .then((adaValue) => {
        console.log('[dApp][GetAllInfoCard][getBalance]: ', adaValue)
        setBalance(adaValue)
        onWaiting(false)
      })
      .catch((e) => {
        console.error(e)
        onWaiting(false)
        onError()
      })

    getUTxOs(api, wasm)
      .then((utxos) => {
        console.log('[dApp][GetAllInfoCard][getUTxOs]: ', utxos)
        setAndMapUtxos(utxos)
        onWaiting(false)
      })
      .catch((e) => {
        console.error(e)
        onWaiting(false)
        onError()
      })

    getChangeAddress(api, wasm)
      .then((bech32Addr) => {
        console.log('[dApp][GetAllInfoCard][getChangeAddress]: ', bech32Addr)
        setChangeAddress(bech32Addr)
        onWaiting(false)
      })
      .catch((e) => {
        console.error(e)
        onWaiting(false)
        onError()
      })

    getRewardAddress(api, wasm)
      .then((bech32Addr) => {
        console.log('[dApp][GetAllInfoCard][getRewardAddress]: ', bech32Addr)
        setRewardAddress(bech32Addr)
        onWaiting(false)
      })
      .catch((e) => {
        console.error(e)
        onWaiting(false)
        onError()
      })

    getPubDRepKey(api, wasm)
      .then((drepKey) => {
        console.log('[dApp][GetAllInfoCard][getPubDRepKey]: ', drepKey)
        setDRepIdBech32(drepKey.dRepIDBech32)
        setDRepIdHex(drepKey.dRepIDHex)
        setDRepIdInputValue(drepKey.dRepIDBech32)
        onWaiting(false)
      })
      .catch((e) => {
        console.error(e)
        onWaiting(false)
        onError()
      })

    getRegPubStakeKey(api, wasm)
      .then((stakeKeyHash) => {
        console.log('[dApp][GetAllInfoCard][getRegPubStakeKey]: ', stakeKeyHash)
        setRegPubStakeKey(stakeKeyHash)
        onWaiting(false)
      })
      .catch((e) => {
        console.error(e)
        onWaiting(false)
        onError()
      })

    getUnregPubStakeKey(api, wasm)
      .then((stakeKeyHash) => {
        console.log('[dApp][GetAllInfoCard][getUnregPubStakeKey]: ', stakeKeyHash)
        setUnregPubStakeKey(stakeKeyHash)
        onWaiting(false)
      })
      .catch((e) => {
        console.error(e)
        onWaiting(false)
        onError()
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
