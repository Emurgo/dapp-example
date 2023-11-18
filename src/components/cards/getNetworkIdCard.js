import React from 'react'
import ApiCard from './apiCard'

const GetNetworkIdCard = ({api, onRawResponse, onResponse, onWaiting}) => {
  const getNetworkIdClick = () => {
    onWaiting(true)
    api
      ?.getNetworkId()
      .then((response) => {
        onWaiting(false)
        onRawResponse(response)
        onResponse(response)
      })
      .catch((e) => {
        onWaiting(false)
        onRawResponse('')
        onResponse(e)
        console.log(e)
      })
  }

  const apiProps = {
    apiName: 'getNetworkId',
    clickFunction: getNetworkIdClick,
  }

  return <ApiCard {...apiProps} />
}

export default GetNetworkIdCard
