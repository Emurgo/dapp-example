import React from 'react'
import {hexToBytes} from '../../utils/utils'
import ApiCard from './apiCard'

const GetChangeAddressCard = ({api, wasm, onRawResponse, onResponse, onWaiting}) => {
  const getChangeAddressClick = () => {
    onWaiting(true)
    api
      ?.getChangeAddress()
      .then((hexAddress) => {
        onWaiting(false)
        onRawResponse(hexAddress)
        const wasmAddress = wasm.Address.from_bytes(hexToBytes(hexAddress))
        onResponse(wasmAddress.to_bech32(), false)
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
