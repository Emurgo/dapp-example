import React from 'react'
import ApiCard from './apiCard'
import runApiCall from '../../utils/runApiCall'

const GetNetworkIdCard = ({api, onRawResponse, onResponse, onWaiting}) => {
  const getNetworkIdClick = () => runApiCall(() => api.getNetworkId(), {onRawResponse, onResponse, onWaiting})

  const apiProps = {
    apiName: 'getNetworkId',
    clickFunction: getNetworkIdClick,
  }

  return <ApiCard {...apiProps} />
}

export default GetNetworkIdCard
