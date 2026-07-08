import React from 'react'
import ApiCard from '../apiCard'
import runApiCall from '../../../utils/runApiCall'

const GetChainIdCard = ({onRawResponse, onResponse, onWaiting}) => {
  const getChainIdClick = () =>
    runApiCall(
      () => window.ethereum.request({method: 'eth_chainId'}),
      {onRawResponse, onResponse, onWaiting},
      {
        parse: (chainId) => ({chainId, decimal: parseInt(chainId, 16)}),
      },
    )

  return <ApiCard apiName="eth_chainId" clickFunction={getChainIdClick} />
}

export default GetChainIdCard
