import logger from '../utils/logger'
import React, {useState} from 'react'
import {NO_PROVIDER} from '../utils/connectionStates'

const BitcoinContext = React.createContext(null)

export const BitcoinProvider = ({children}) => {
  logger.debug('[dApp][BitcoinProvider] is called')
  const [connectionState] = useState(NO_PROVIDER)

  const connect = async () => {
    logger.warn('[dApp][BitcoinProvider] connect: not implemented')
  }

  const disconnect = () => {
    logger.warn('[dApp][BitcoinProvider] disconnect: not implemented')
  }

  const getAccounts = async () => {
    logger.warn('[dApp][BitcoinProvider] getAccounts: not implemented')
    return []
  }

  const getBalance = async (_address) => {
    logger.warn('[dApp][BitcoinProvider] getBalance: not implemented')
    return '0'
  }

  const sendTransaction = async (_tx) => {
    logger.warn('[dApp][BitcoinProvider] sendTransaction: not implemented')
    throw new Error('Bitcoin sendTransaction not implemented')
  }

  const signMessage = async (_message) => {
    logger.warn('[dApp][BitcoinProvider] signMessage: not implemented')
    throw new Error('Bitcoin signMessage not implemented')
  }

  const values = {
    connectionState,
    connect,
    disconnect,
    getAccounts,
    getBalance,
    sendTransaction,
    signMessage,
  }

  return <BitcoinContext.Provider value={values}>{children}</BitcoinContext.Provider>
}

const useBitcoin = () => {
  const context = React.useContext(BitcoinContext)
  if (!context) throw new Error('useBitcoin must be used within BitcoinProvider')
  return context
}

export default useBitcoin
