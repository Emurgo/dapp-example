import logger from '../utils/logger'
import React, {useState, useEffect, useCallback, useMemo} from 'react'
import {NOT_CONNECTED, IN_PROGRESS, CONNECTED, NO_PROVIDER} from '../utils/connectionStates'

const EthereumContext = React.createContext(null)

export const EthereumProvider = ({children}) => {
  logger.debug('[dApp][EthereumProvider] is called')
  const [accounts, setAccounts] = useState([])
  const [connectionState, setConnectionState] = useState(NO_PROVIDER)
  const [chainId, setChainId] = useState(null)

  useEffect(() => {
    if (!window.ethereum) {
      logger.warn('[dApp] No Ethereum wallet found')
      setConnectionState(NO_PROVIDER)
      return
    }
    setConnectionState(NOT_CONNECTED)

    const handleAccountsChanged = (newAccounts) => {
      logger.debug('[dApp][EthereumProvider] accountsChanged', newAccounts)
      if (newAccounts.length === 0) {
        setConnectionState(NOT_CONNECTED)
        setAccounts([])
      } else {
        setAccounts(newAccounts)
        setConnectionState(CONNECTED)
      }
    }

    const handleChainChanged = (newChainId) => {
      logger.debug('[dApp][EthereumProvider] chainChanged', newChainId)
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
    logger.debug('[dApp][EthereumProvider] connect is called')
    try {
      const accs = await window.ethereum.request({method: 'eth_requestAccounts'})
      const chain = await window.ethereum.request({method: 'eth_chainId'})
      setAccounts(accs)
      setChainId(chain)
      setConnectionState(CONNECTED)
      logger.log('[dApp][EthereumProvider] CONNECTED, accounts:', accs)
    } catch (err) {
      logger.error('[dApp][EthereumProvider] connect error', err)
      setConnectionState(NOT_CONNECTED)
    }
  }, [])

  const disconnect = useCallback(() => {
    setAccounts([])
    setConnectionState(NOT_CONNECTED)
  }, [])

  const getAccounts = useCallback(() => accounts, [accounts])

  const getBalance = useCallback(async (address) => {
    if (!window.ethereum) return '0'
    return await window.ethereum.request({method: 'eth_getBalance', params: [address, 'latest']})
  }, [])

  const sendTransaction = useCallback(async (tx) => {
    if (!window.ethereum) throw new Error('No Ethereum wallet')
    return await window.ethereum.request({method: 'eth_sendTransaction', params: [tx]})
  }, [])

  const signMessage = useCallback(async (message) => {
    if (!window.ethereum || accounts.length === 0) throw new Error('Not connected')
    return await window.ethereum.request({method: 'personal_sign', params: [message, accounts[0]]})
  }, [accounts])

  const values = useMemo(() => ({
    accounts,
    connectionState,
    chainId,
    connect,
    disconnect,
    getAccounts,
    getBalance,
    sendTransaction,
    signMessage,
  }), [accounts, connectionState, chainId, connect, disconnect, getAccounts, getBalance, sendTransaction, signMessage])

  return <EthereumContext.Provider value={values}>{children}</EthereumContext.Provider>
}

const useEthereum = () => {
  const context = React.useContext(EthereumContext)
  if (!context) throw new Error('useEthereum must be used within EthereumProvider')
  return context
}

export default useEthereum
