import React from 'react'
import ApiCard from './apiCard'
import {getBech32AddressFromHex} from '../../utils/cslTools'
import runApiCall from '../../utils/runApiCall'

const GetRewardAddressesCard = ({api, onRawResponse, onResponse, onWaiting}) => {
  const getRewardAddressesClick = () =>
    runApiCall(() => api.getRewardAddresses(), {onRawResponse, onResponse, onWaiting}, {
      parse: (hexAddresses) => hexAddresses.map(getBech32AddressFromHex),
    })

  const apiProps = {
    apiName: 'getRewardAddresses',
    clickFunction: getRewardAddressesClick,
  }

  return <ApiCard {...apiProps} />
}

export default GetRewardAddressesCard
