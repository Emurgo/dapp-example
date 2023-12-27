import React from 'react'
import ApiCard from './apiCard'
import {getBech32AddressFromHex} from '../../utils/cslTools'

const GetChangeAddressCard = ({api, wasm, onRawResponse, onResponse, onWaiting}) => {
  const getChangeAddressClick = () => {
    onWaiting(true)
    api
      ?.getChangeAddress()
      .then((hexAddress) => {
        onWaiting(false)
        onRawResponse(hexAddress)
        onResponse(getBech32AddressFromHex(wasm, hexAddress), false)
      })
      .catch((e) => {
        onWaiting(false)
        onRawResponse('')
        onResponse(e)
        console.log(e)
      })
  }

  const apiProps = {
    apiName: 'getChangeAddress',
    clickFunction: getChangeAddressClick,
  }
  return <ApiCard {...apiProps} />
}

export default GetChangeAddressCard
