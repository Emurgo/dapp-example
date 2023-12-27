import React from 'react'
import ApiCard from './apiCard'
import {getBech32AddressFromHex} from '../../utils/cslTools'

const GetUnusedAddressesCard = ({api, wasm, onRawResponse, onResponse, onWaiting}) => {
  const getUnusedAddressesClick = () => {
    onWaiting(true)
    api
      ?.getUnusedAddresses()
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
    apiName: 'getUnusedAddresses',
    clickFunction: getUnusedAddressesClick,
  }

  return <ApiCard {...apiProps} />
}

export default GetUnusedAddressesCard
