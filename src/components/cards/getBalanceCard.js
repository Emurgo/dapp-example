import React from 'react'
import {wasmMultiassetToJSONs} from '../../utils/utils'
import ApiCard from './apiCard'
import {getCslValue} from '../../utils/cslTools'
import runApiCall from '../../utils/runApiCall'

const GetBalanceCard = ({api, onRawResponse, onResponse, onWaiting}) => {
  const getBalanceClick = () =>
    runApiCall(() => api.getBalance(), {onRawResponse, onResponse, onWaiting}, {
      parse: (hexBalance) => {
        const cslValue = getCslValue(hexBalance)
        return {
          lovelaces: cslValue.coin().to_str(),
          assets: wasmMultiassetToJSONs(cslValue.multiasset()),
        }
      },
    })

  const apiProps = {
    apiName: 'getBalance',
    clickFunction: getBalanceClick,
  }

  return <ApiCard {...apiProps} />
}

export default GetBalanceCard
