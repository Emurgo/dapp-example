import React from 'react'
import ApiCard from '../apiCard'

const GetChainIdCard = ({onRawResponse, onResponse, onWaiting}) => {
  const getChainIdClick = () => {
    onWaiting(true)
    window.ethereum
      .request({method: 'eth_chainId'})
      .then((chainId) => {
        onWaiting(false)
        onRawResponse(chainId)
        onResponse({chainId, decimal: parseInt(chainId, 16)})
      })
      .catch((e) => {
        onWaiting(false)
        onRawResponse('')
        onResponse(e)
        console.error(e)
      })
  }

  return <ApiCard apiName="eth_chainId" clickFunction={getChainIdClick} />
}

export default GetChainIdCard
