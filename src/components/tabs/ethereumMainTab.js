import {useState} from 'react'
import useEthereum from '../../hooks/ethereumProvider'
import {CONNECTED, NO_PROVIDER} from '../../utils/connectionStates'
import {CHAIN_IDS, chainName} from '../../utils/ethereumUtils'

const EthereumMainTab = () => {
  const {connectionState, chainId, switchNetwork} = useEthereum()
  const [switchError, setSwitchError] = useState(null)
  const [isSwitching, setIsSwitching] = useState(false)

  const message = () => {
    if (connectionState === CONNECTED) return null
    if (connectionState === NO_PROVIDER) {
      return <label>No Ethereum wallet found. Please install a compatible Ethereum wallet.</label>
    }
    return <label>Ethereum wallet is not connected</label>
  }

  const handleSwitchNetwork = async (targetChainId) => {
    if (targetChainId === chainId) return
    setSwitchError(null)
    setIsSwitching(true)
    try {
      await switchNetwork(targetChainId)
    } catch (err) {
      console.error('[dApp][EthereumMainTab] switchNetwork error', err)
      if (err.code === 4001) setSwitchError('Switch rejected by user.')
      else if (err.code === 4902) setSwitchError('Network not configured in your wallet. Add it manually.')
      else setSwitchError(err.message ?? 'Failed to switch network.')
    } finally {
      setIsSwitching(false)
    }
  }

  return (
    <div className="bg-gray-900 grid justify-items-center pt-5">
      <div className="text-m font-bold tracking-tight text-white">{message()}</div>
      {connectionState === CONNECTED && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="text-sm text-gray-400">Switch Network</div>
          <div className="flex gap-2">
            {[CHAIN_IDS.MAINNET, CHAIN_IDS.SEPOLIA].map((id) => (
              <button
                key={id}
                disabled={isSwitching}
                onClick={() => handleSwitchNetwork(id)}
                className={`text-sm font-semibold px-3 py-1 rounded-md transition-colors duration-200 disabled:opacity-50 ${
                  chainId === id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-purple-400'
                }`}
              >
                {chainName(id)}
              </button>
            ))}
          </div>
          {switchError && <div className="text-xs text-red-400 mt-1">{switchError}</div>}
        </div>
      )}
    </div>
  )
}

export default EthereumMainTab
