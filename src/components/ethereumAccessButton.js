import React from 'react'
import useEthereum from '../hooks/ethereumProvider'
import {IN_PROGRESS, NO_PROVIDER} from '../utils/connectionStates'
import {shortAddress, chainName} from '../utils/ethereumUtils'
import AccessButtonShell from './accessButtonShell'

const EthereumAccessButton = () => {
  const {accounts, connectionState, connect, chainId} = useEthereum()
  const isConnected = accounts.length > 0

  if (isConnected) {
    return (
      <AccessButtonShell>
        <div className="text-xl font-bold tracking-tight text-white text-center">
          <div className="py-5">
            <div>Connected to Ethereum Wallet</div>
            <div className="py-1 text-purple-400">{shortAddress(accounts[0])}</div>
            {chainId && (
              <div className="py-1">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-900 text-purple-300 border border-purple-700">
                  {chainName(chainId)}
                </span>
              </div>
            )}
          </div>
        </div>
      </AccessButtonShell>
    )
  }

  if (connectionState === IN_PROGRESS) {
    return (
      <AccessButtonShell innerClassName="grid justify-items-center pt-5 pb-5 text-m font-bold tracking-tight text-green-500">
        <label>Connecting to Ethereum wallet...</label>
      </AccessButtonShell>
    )
  }

  return (
    <AccessButtonShell>
      <button
        className="rounded-md bg-purple-600 hover:bg-purple-400 active:bg-purple-800 py-5 px-5 disabled:opacity-50 text-white font-semibold"
        disabled={connectionState === NO_PROVIDER}
        onClick={connect}
      >
        {connectionState === NO_PROVIDER ? 'No Ethereum Wallet Found' : 'Connect Ethereum Wallet'}
      </button>
    </AccessButtonShell>
  )
}

export default EthereumAccessButton
