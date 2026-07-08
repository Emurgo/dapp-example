import React from 'react'
import ApiCard from './apiCard'
import {hexArrayToBech32Addresses} from '../../utils/cslTools'
import runApiCall from '../../utils/runApiCall'

const GetUnusedAddressesCard = ({api, onRawResponse, onResponse, onWaiting}) => {
  const getUnusedAddressesClick = () =>
    runApiCall(() => api.getUnusedAddresses(), {onRawResponse, onResponse, onWaiting}, {
      parse: hexArrayToBech32Addresses,
    })

  const apiProps = {
    apiName: 'getUnusedAddresses',
    clickFunction: getUnusedAddressesClick,
  }

  return <ApiCard {...apiProps} />
}

export default GetUnusedAddressesCard
