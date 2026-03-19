import React, {useState, useEffect, useCallback} from 'react'
import {NOT_CONNECTED, IN_PROGRESS, CONNECTED, NO_ETHEREUM} from '../utils/connectionStates'

const EthereumContext = React.createContext(null)

export const EthereumProvider = ({children}) => {
  console.debug('[dApp][EthereumProvider] is called')
  const [accounts, setAccounts] = useState([])
  const [connectionState, setConnectionState] = useState(NO_ETHEREUM)
  const [chainId, setChainId] = useState(null)

  useEffect(() => {
    if (!window.ethereum) {
      console.warn('[dApp] No Ethereum wallet found')
      setConnectionState(NO_ETHEREUM)
      return
    }
    setConnectionState(NOT_CONNECTED)

    const handleAccountsChanged = (newAccounts) => {
      console.debug('[dApp][EthereumProvider] accountsChanged', newAccounts)
      if (newAccounts.length === 0) {
        setConnectionState(NOT_CONNECTED)
        setAccounts([])
      } else {
        setAccounts(newAccounts)
        setConnectionState(CONNECTED)
      }
    }

    const handleChainChanged = (newChainId) => {
      console.debug('[dApp][EthereumProvider] chainChanged', newChainId)
      setChainId(newChainId)
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }, [])

  const connect = useCallback(async () => {
    if (!window.ethereum) return
    setConnectionState(IN_PROGRESS)
    console.debug('[dApp][EthereumProvider] connect is called')
    try {
      const accs = await window.ethereum.request({method: 'eth_requestAccounts'})
      const chain = await window.ethereum.request({method: 'eth_chainId'})
      setAccounts(accs)
      setChainId(chain)
      setConnectionState(CONNECTED)
      console.log('[dApp][EthereumProvider] CONNECTED, accounts:', accs)
    } catch (err) {
      console.error('[dApp][EthereumProvider] connect error', err)
      setConnectionState(NOT_CONNECTED)
    }
  }, [])

  const disconnect = useCallback(() => {
    setAccounts([])
    setConnectionState(NOT_CONNECTED)
  }, [])

  const values = {
    accounts,
    connectionState,
    chainId,
    connect,
    disconnect,
  }

  return <EthereumContext.Provider value={values}>{children}</EthereumContext.Provider>
}

const useEthereum = () => {
  const context = React.useContext(EthereumContext)
  if (context === undefined) throw new Error('useEthereum must be used within EthereumProvider')
  return context
}

export default useEthereum
