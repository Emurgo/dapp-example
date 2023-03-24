import React from 'react'
import {hexToBytes, wasmMultiassetToJSONs} from '../../utils/utils'
import ApiCard from './apiCard'

const GetBalanceCard = ({api, wasm, onRawResponse, onResponse, onWaiting}) => {
  const getBalanceClick = () => {
    onWaiting(true)
    api
      ?.getBalance()
      .then((hexBalance) => {
        onWaiting(false)
        onRawResponse(hexBalance)
        const wasmValue = wasm.Value.from_bytes(hexToBytes(hexBalance))
        const adaValue = wasmValue.coin().to_str()
        const assetValue = wasmMultiassetToJSONs(wasmValue.multiasset())
        onResponse({lovelaces: adaValue, assets: assetValue})
      })
      .catch((e) => {
        onWaiting(false)
        onRawResponse('')
        onResponse(e)
        console.log(e)
      })
  }

  const apiProps = {
    apiName: 'getBalance',
    clickFunction: getBalanceClick,
  }

  return <ApiCard {...apiProps} />
}

export default GetBalanceCard
