import React, {useState} from 'react'

export const NETWORK_CARDANO = 'cardano'
export const NETWORK_ETHEREUM = 'ethereum'
export const NETWORK_BITCOIN = 'bitcoin'

const NETWORKS = [NETWORK_CARDANO, NETWORK_ETHEREUM, NETWORK_BITCOIN]

const NetworkContext = React.createContext(null)

export const NetworkProvider = ({children}) => {
  const [activeNetwork, setActiveNetwork] = useState(NETWORK_CARDANO)

  const toggleNetwork = () =>
    setActiveNetwork((prev) => {
      const idx = NETWORKS.indexOf(prev)
      return NETWORKS[(idx + 1) % NETWORKS.length]
    })

  return (
    <NetworkContext.Provider value={{activeNetwork, setActiveNetwork, toggleNetwork}}>
      {children}
    </NetworkContext.Provider>
  )
}

const useNetwork = () => {
  const context = React.useContext(NetworkContext)
  if (!context) throw new Error('useNetwork must be used within NetworkProvider')
  return context
}

export default useNetwork
