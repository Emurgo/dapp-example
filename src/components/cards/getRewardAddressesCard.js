import React from 'react'
import ApiCard from './apiCard'
import {getBech32AddressFromHex} from '../../utils/cslTools'

const GetRewardAddressesCard = ({api, wasm, onRawResponse, onResponse, onWaiting}) => {
  const getRewardAddressesClick = () => {
    onWaiting(true)
    api
      ?.getRewardAddresses()
      .then((hexAddresses) => {
        onWaiting(false)
        onRawResponse(hexAddresses)
        const addresses = []
        for (const hexAddr of hexAddresses) {
          addresses.push(getBech32AddressFromHex(wasm, hexAddr))
        }
        onResponse(addresses)
      })
      .catch((e) => {
        onWaiting(false)
        onRawResponse('')
        onResponse(e)
        console.log(e)
      })
  }

  const apiProps = {
    apiName: 'getRewardAddresses',
    clickFunction: getRewardAddressesClick,
  }

  return <ApiCard {...apiProps} />
}

export default GetRewardAddressesCard
