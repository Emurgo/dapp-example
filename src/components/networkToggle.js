import React from 'react'
import useNetwork, {NETWORK_CARDANO, NETWORK_ETHEREUM} from '../hooks/networkProvider'
import packageJson from '../../package.json'

const NetworkToggle = () => {
  const {activeNetwork, setActiveNetwork} = useNetwork()

  return (
    <div className="flex items-center justify-between py-2 bg-gray-900 border-b border-gray-700">
      <div className="w-16" />
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveNetwork(NETWORK_CARDANO)}
          className={`text-xs sm:text-sm font-semibold px-3 py-1 rounded-md transition-colors duration-200 ${
            activeNetwork === NETWORK_CARDANO
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-blue-400'
          }`}
        >
          Cardano
        </button>
        <button
          onClick={() => setActiveNetwork(NETWORK_ETHEREUM)}
          className={`text-xs sm:text-sm font-semibold px-3 py-1 rounded-md transition-colors duration-200 ${
            activeNetwork === NETWORK_ETHEREUM
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-purple-400'
          }`}
        >
          Ethereum
        </button>
        <button
          disabled
          className="text-xs sm:text-sm font-semibold px-3 py-1 rounded-md text-gray-600 cursor-not-allowed"
          title="Coming soon"
        >
          Bitcoin
        </button>
      </div>
      <div className="text-xs text-gray-500 pr-3">v{packageJson.version}</div>
    </div>
  )
}

export default NetworkToggle
