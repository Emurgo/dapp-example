import React from 'react'
import {wasmMultiassetToJSONs} from '../../utils/utils'
import ApiCard from './apiCard'
import {getCslValue} from '../../utils/cslTools'

const GetBalanceCard = ({api, onRawResponse, onResponse, onWaiting}) => {
  const getBalanceClick = () => {
    onWaiting(true)
    api
      ?.getBalance()
      .then((hexBalance) => {
        onWaiting(false)
        onRawResponse(hexBalance)
        const cslValue = getCslValue(hexBalance)
        const adaValue = cslValue.coin().to_str()
        const assetValue = wasmMultiassetToJSONs(cslValue.multiasset())
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
