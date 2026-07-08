import React from 'react'
import ApiCard from './apiCard'
import {hexArrayToBech32Addresses} from '../../utils/cslTools'
import runApiCall from '../../utils/runApiCall'

const GetRewardAddressesCard = ({api, onRawResponse, onResponse, onWaiting}) => {
  const getRewardAddressesClick = () =>
    runApiCall(
      () => api.getRewardAddresses(),
      {onRawResponse, onResponse, onWaiting},
      {
        parse: hexArrayToBech32Addresses,
      },
    )

  const apiProps = {
    apiName: 'getRewardAddresses',
    clickFunction: getRewardAddressesClick,
  }

  return <ApiCard {...apiProps} />
}

export default GetRewardAddressesCard
