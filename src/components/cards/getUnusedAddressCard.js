import React from 'react'
import {hexToBytes} from '../../utils/utils'
import ApiCard from './apiCard'

const GetUnusedAddressesCard = ({api, wasm, onRawResponse, onResponse, onWaiting}) => {
  const getUnusedAddressesClick = () => {
    onWaiting(true)
    api
      ?.getUnusedAddresses()
      .then((hexAddresses) => {
        onWaiting(false)
        onRawResponse(hexAddresses)
        const addresses = []
        for (let i = 0; i < hexAddresses.length; i++) {
          const wasmAddress = wasm.Address.from_bytes(hexToBytes(hexAddresses[i]))
          addresses.push(wasmAddress.to_bech32())
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
