import React from 'react'
import useEthereum from '../../hooks/ethereumProvider'
import {CONNECTED, NO_PROVIDER} from '../../utils/connectionStates'

const EthereumMainTab = () => {
  const {connectionState} = useEthereum()

  const message = () => {
    if (connectionState === CONNECTED) return null
    if (connectionState === NO_PROVIDER) {
      return <label>No Ethereum wallet found. Please install a compatible Ethereum wallet.</label>
    }
    return <label>Ethereum wallet is not connected</label>
  }

  return (
    <div className="bg-gray-900 grid justify-items-center pt-5">
      <div className="text-m font-bold tracking-tight text-white">{message()}</div>
    </div>
  )
}

export default EthereumMainTab
