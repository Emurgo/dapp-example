import React from 'react'
import useNetwork, {NETWORK_CARDANO, NETWORK_ETHEREUM} from '../hooks/networkProvider'
import packageJson from '../../package.json'

const NetworkToggle = () => {
  const {activeNetwork, toggleNetwork} = useNetwork()
  const isCardano = activeNetwork === NETWORK_CARDANO
  const isEthereum = activeNetwork === NETWORK_ETHEREUM

  return (
    <div className="flex items-center justify-between py-2 bg-gray-900 border-b border-gray-700">
      <div className="w-16" />
      <div className="flex items-center gap-3">
        <span className={`text-xs sm:text-sm font-semibold ${isCardano ? 'text-blue-400' : 'text-gray-500'}`}>
          Cardano
        </span>
        <button
          onClick={toggleNetwork}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
            isEthereum ? 'bg-purple-600' : 'bg-blue-600'
          }`}
          aria-label="Toggle network"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${
              isEthereum ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`text-xs sm:text-sm font-semibold ${isEthereum ? 'text-purple-400' : 'text-gray-500'}`}>
          Ethereum
        </span>
      </div>
      <div className="text-xs text-gray-500 pr-3">v{packageJson.version}</div>
    </div>
  )
}

export default NetworkToggle
