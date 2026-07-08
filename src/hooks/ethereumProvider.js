import logger from '../utils/logger'
import React, {useState, useEffect, useCallback, useMemo} from 'react'
import useToast from './toastProvider'
import useConnectionState from './useConnectionState'

const EthereumContext = React.createContext(null)

export const EthereumProvider = ({children}) => {
  logger.debug('[dApp][EthereumProvider] is called')
  const {showToast} = useToast()
  const {connectionState, setConnected, setNotConnected, setInProgress, setNoProvider} = useConnectionState()
  const [accounts, setAccounts] = useState([])
  const [chainId, setChainId] = useState(null)

  useEffect(() => {
    if (!window.ethereum) {
      logger.warn('[dApp] No Ethereum wallet found')
      setNoProvider()
      return
    }
    setNotConnected()

    const handleAccountsChanged = (newAccounts) => {
      logger.debug('[dApp][EthereumProvider] accountsChanged', newAccounts)
      if (newAccounts.length === 0) {
        setNotConnected()
        setAccounts([])
      } else {
        setAccounts(newAccounts)
        setConnected()
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
  }, [setNoProvider, setNotConnected, setConnected])

  const connect = useCallback(async () => {
    if (!window.ethereum) return
    setInProgress()
    logger.debug('[dApp][EthereumProvider] connect is called')
    try {
      const accs = await window.ethereum.request({method: 'eth_requestAccounts'})
      const chain = await window.ethereum.request({method: 'eth_chainId'})
      setAccounts(accs)
      setChainId(chain)
      setConnected()
      logger.log('[dApp][EthereumProvider] CONNECTED, accounts:', accs)
    } catch (err) {
      logger.error('[dApp][EthereumProvider] connect error', err)
      setNotConnected()
      showToast(`Failed to connect Ethereum wallet: ${err?.message ?? JSON.stringify(err)}`)
    }
  }, [showToast, setInProgress, setConnected, setNotConnected])

  const disconnect = useCallback(() => {
    setAccounts([])
    setNotConnected()
  }, [setNotConnected])

  const getAccounts = useCallback(() => accounts, [accounts])

  const getBalance = useCallback(async (address) => {
    if (!window.ethereum) return '0'
    return await window.ethereum.request({method: 'eth_getBalance', params: [address, 'latest']})
  }, [])

  const sendTransaction = useCallback(async (tx) => {
    if (!window.ethereum) throw new Error('No Ethereum wallet')
    return await window.ethereum.request({method: 'eth_sendTransaction', params: [tx]})
  }, [])

  const signMessage = useCallback(
    async (message) => {
      if (!window.ethereum || accounts.length === 0) throw new Error('Not connected')
      return await window.ethereum.request({method: 'personal_sign', params: [message, accounts[0]]})
    },
    [accounts],
  )

  const values = useMemo(
    () => ({
      accounts,
      connectionState,
      chainId,
      connect,
      disconnect,
      getAccounts,
      getBalance,
      sendTransaction,
      signMessage,
    }),
    [accounts, connectionState, chainId, connect, disconnect, getAccounts, getBalance, sendTransaction, signMessage],
  )

  return <EthereumContext.Provider value={values}>{children}</EthereumContext.Provider>
}

const useEthereum = () => {
  const context = React.useContext(EthereumContext)
  if (!context) throw new Error('useEthereum must be used within EthereumProvider')
  return context
}

export default useEthereum
