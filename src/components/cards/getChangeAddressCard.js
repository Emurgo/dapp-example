import React from 'react'
import ApiCard from './apiCard'
import {getBech32AddressFromHex} from '../../utils/cslTools'
import runApiCall from '../../utils/runApiCall'

const GetChangeAddressCard = ({api, onRawResponse, onResponse, onWaiting}) => {
  const getChangeAddressClick = () =>
    runApiCall(() => api.getChangeAddress(), {onRawResponse, onResponse, onWaiting}, {
      parse: getBech32AddressFromHex,
      stringify: false,
    })

  const apiProps = {
    apiName: 'getChangeAddress',
    clickFunction: getChangeAddressClick,
  }
  return <ApiCard {...apiProps} />
}

export default GetChangeAddressCard
