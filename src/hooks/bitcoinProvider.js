import React, {useState} from 'react'
import {NO_PROVIDER} from '../utils/connectionStates'

const BitcoinContext = React.createContext(null)

export const BitcoinProvider = ({children}) => {
  console.debug('[dApp][BitcoinProvider] is called')
  const [connectionState] = useState(NO_PROVIDER)

  const connect = async () => {
    console.warn('[dApp][BitcoinProvider] connect: not implemented')
  }

  const disconnect = () => {
    console.warn('[dApp][BitcoinProvider] disconnect: not implemented')
  }

  const getAccounts = async () => {
    console.warn('[dApp][BitcoinProvider] getAccounts: not implemented')
    return []
  }

  const getBalance = async (_address) => {
    console.warn('[dApp][BitcoinProvider] getBalance: not implemented')
    return '0'
  }

  const sendTransaction = async (_tx) => {
    console.warn('[dApp][BitcoinProvider] sendTransaction: not implemented')
    throw new Error('Bitcoin sendTransaction not implemented')
  }

  const signMessage = async (_message) => {
    console.warn('[dApp][BitcoinProvider] signMessage: not implemented')
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
  if (context === undefined) throw new Error('useBitcoin must be used within BitcoinProvider')
  return context
}

export default useBitcoin
