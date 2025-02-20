import React from 'react'
import ApiCard from './apiCard'
import {
  getBalance,
  getChangeAddress,
  getPubDRepKey,
  getRegPubStakeKey,
  getRewardAddress,
  getUnregPubStakeKey,
  getUsedAddress,
  getUnusedAddress,
  getUTxOs,
} from '../../utils/helpFunctions'

const GetAllInfoCard = ({api, onWaiting, onError, setters}) => {
  const {
    setBalance,
    setAndMapUtxos,
    setChangeAddress,
    setRewardAddress,
    setUsedAddress,
    setUnusedAddress,
    setDRepIdBech32,
    setDRepIdHex,
    setDRepIdInputValue,
    setRegPubStakeKey,
    setUnregPubStakeKey,
  } = setters
  const getAllInfoClick = () => {
    onWaiting(true)
    getBalance(api)
      .then((adaValue) => {
        console.log('[dApp][GetAllInfoCard][getBalance]: ', adaValue)
        setBalance(adaValue)
      })
      .catch((e) => {
        console.error(e)
        onWaiting(false)
        onError()
      })

    getUTxOs(api)
      .then((utxos) => {
        console.log('[dApp][GetAllInfoCard][getUTxOs]: ', utxos)
        setAndMapUtxos(utxos)
      })
      .catch((e) => {
        console.error(e)
        onWaiting(false)
        onError()
      })

    getChangeAddress(api)
      .then((bech32Addr) => {
        console.log('[dApp][GetAllInfoCard][getChangeAddress]: ', bech32Addr)
        setChangeAddress(bech32Addr)
      })
      .catch((e) => {
        console.error(e)
        onWaiting(false)
        onError()
      })

    getRewardAddress(api)
      .then((bech32Addr) => {
        console.log('[dApp][GetAllInfoCard][getRewardAddress]: ', bech32Addr)
        setRewardAddress(bech32Addr)
      })
      .catch((e) => {
        console.error(e)
        onWaiting(false)
        onError()
      })

    getUsedAddress(api)
      .then((bech32Addr) => {
        console.log('[dApp][GetAllInfoCard][getUsedAddress]: ', bech32Addr)
        setUsedAddress(bech32Addr)
      })
      .catch((e) => {
        console.error(e)
        onWaiting(false)
        onError()
      })

    getUnusedAddress(api)
      .then((bech32Addr) => {
        console.log('[dApp][GetAllInfoCard][getUnusedAddress]: ', bech32Addr)
        setUnusedAddress(bech32Addr)
      })
      .catch((e) => {
        console.error(e)
        onWaiting(false)
        onError()
      })

    getPubDRepKey(api)
      .then((drepKey) => {
        console.log('[dApp][GetAllInfoCard][getPubDRepKey]: ', drepKey)
        setDRepIdBech32(drepKey.dRepIDBech32)
        setDRepIdHex(drepKey.dRepIDHex)
        setDRepIdInputValue(drepKey.dRepIDBech32)
      })
      .catch((e) => {
        console.error(e)
        onWaiting(false)
        onError()
      })

    getRegPubStakeKey(api)
      .then((stakeKeyHash) => {
        console.log('[dApp][GetAllInfoCard][getRegPubStakeKey]: ', stakeKeyHash)
        setRegPubStakeKey(stakeKeyHash)
      })
      .catch((e) => {
        console.error(e)
        onWaiting(false)
        onError()
      })

    getUnregPubStakeKey(api)
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
