import React from 'react'
import useEthereum from '../hooks/ethereumProvider'
import {IN_PROGRESS, NO_PROVIDER} from '../utils/connectionStates'
import {shortAddress} from '../utils/ethereumUtils'

const EthereumAccessButton = () => {
  const {accounts, connectionState, connect} = useEthereum()
  const isConnected = accounts.length > 0

  if (isConnected) {
    return (
      <div className="mx-auto bg-gray-900">
        <div className="grid justify-items-center py-3">
          <div className="text-xl font-bold tracking-tight text-white text-center">
            <div className="py-5">
              <div>Connected to Ethereum Wallet</div>
              <div className="py-1 text-purple-400">{shortAddress(accounts[0])}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (connectionState === IN_PROGRESS) {
    return (
      <div className="mx-auto bg-gray-900">
        <div className="grid justify-items-center pt-5 pb-5 text-m font-bold tracking-tight text-green-500">
          <label>Connecting to Ethereum wallet...</label>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto bg-gray-900">
      <div className="grid justify-items-center py-3">
        <button
          className="rounded-md bg-purple-600 hover:bg-purple-400 active:bg-purple-800 py-5 px-5 disabled:opacity-50 text-white font-semibold"
          disabled={connectionState === NO_PROVIDER}
          onClick={connect}
        >
          {connectionState === NO_PROVIDER ? 'No Ethereum Wallet Found' : 'Connect Ethereum Wallet'}
        </button>
      </div>
    </div>
  )
}

export default EthereumAccessButton
