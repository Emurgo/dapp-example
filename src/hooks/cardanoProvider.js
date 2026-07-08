import logger from '../utils/logger'
import React, {useState, useEffect, useCallback, useMemo} from 'react'
import {NOT_CONNECTED, IN_PROGRESS, CONNECTED, NO_PROVIDER} from '../utils/connectionStates'
import useToast from './toastProvider'

const CardanoContext = React.createContext(null)
const reservedKeys = [
  'enable',
  'isEnabled',
  'getBalance',
  'signData',
  'signTx',
  'submitTx',
  'getUtxos',
  'getCollateral',
  'getUsedAddresses',
  'getUnusedAddresses',
  'getChangeAddress',
  'getRewardAddress',
  'getNetworkId',
  'onAccountChange',
  'onNetworkChange',
  'off',
  '_events',
]

export const CardanoProvider = ({children}) => {
  logger.debug('[dApp][CardanoProvider] is called')
  const {showToast} = useToast()
  const [api, setApi] = useState(null)
  const [connectionState, setConnectionState] = useState(NO_PROVIDER)
  const [availableWallets, setAvailableWallets] = useState([])
  const [selectedWallet, setSelectedWallet] = useState('')

  const setConnectionStateFalse = useCallback(() => {
    setConnectionState(NOT_CONNECTED)
    setApi(null)
  }, [])

  const getAvailableWallets = () => {
    // We need to filter like this because of the Nami wallet.
    // It injects everything into the cardano object not only the object "nami".
    const userWallets = Object.keys(window.cardano).filter((cardanoKey) => !reservedKeys.includes(cardanoKey))
    return userWallets.map((walletName) => {
      return {
        walletObjKey: walletName,
        walletObjInfo: window.cardano[walletName],
      }
    })
  }

  /**
   * @param {string} walletName - A wallet name as it is presented in the Cardano object
   * @param {boolean} requestIdentification - Request connection with or without required authentication
   * @param {boolean} silent - Request connection with or without showing the connection pop-up
   * @param {boolean} throwError - Throw an error which possibly can be while connecting to the wallet
   * @returns {Promise<any>}
   */
  const connect = useCallback(async (walletName, requestIdentification, silent, throwError = false) => {
    setConnectionState(IN_PROGRESS)
    setApi(null)
    logger.debug(`[dApp][connect] is called`)

    if (!window.cardano) {
      logger.error('There are no cardano wallets are installed')
      setConnectionState(NOT_CONNECTED)
      return
    }

    logger.log(`[dApp][connect] connecting the wallet "${walletName}"`)
    logger.debug(`[dApp][connect] {requestIdentification: ${requestIdentification}, onlySilent: ${silent}}`)

    try {
      const connectedApi = await window.cardano[walletName].enable({
        requestIdentification,
        onlySilent: silent,
      })
      logger.debug(`[dApp][connect] wallet API object is received`)
      setApi(connectedApi)
      setSelectedWallet(walletName)
      setConnectionState(CONNECTED)
      return connectedApi
    } catch (error) {
      logger.error(`[dApp][connect] The error received while connecting the wallet`)
      setSelectedWallet('')
      setConnectionState(NOT_CONNECTED)
      // Surface user-initiated connection failures; stay quiet on the silent
      // background reconnect so page load doesn't pop a toast.
      if (!silent) {
        showToast(`Failed to connect wallet "${walletName}": ${error?.info ?? error?.message ?? JSON.stringify(error)}`)
      }
      if (throwError) {
        throw new Error(JSON.stringify(error))
      } else {
        logger.error(`[dApp][connect] ${JSON.stringify(error)}`)
      }
    }
  }, [showToast])

  useEffect(() => {
    if (!window.cardano) {
      logger.warn('[dApp] There are no cardano wallets are installed')
      setConnectionState(NO_PROVIDER)
      return
    }

    /**
   * @param {string} walletName - A wallet name as it is presented in the Cardano object
   * @returns {Promise<void>}
   */
    const tryConnectSilent = async (walletName) => {
      let connectResult = null
      logger.debug(`[dApp][tryConnectSilent] is called`)
      try {
        logger.debug(`[dApp][tryConnectSilent] trying {false, true}`)
        setConnectionState(IN_PROGRESS)
        connectResult = await connect(walletName, false, true, false)
        if (connectResult != null) {
          logger.log('[dApp][tryConnectSilent] RE-CONNECTED!')
          setSelectedWallet(walletName)
          setConnectionState(CONNECTED)
          return
        }
      } catch (error) {
        setSelectedWallet('')
        setConnectionState(NOT_CONNECTED)
        logger.error(error)
      }
    }

    const availableWallets = getAvailableWallets()
    logger.log('[dApp] allInfoWallets: ', availableWallets)
    setAvailableWallets(availableWallets)

    if (availableWallets.length === 1) {
      const existingWallet = availableWallets[0].walletObjKey
      const walletObject = window.cardano[existingWallet]
      walletObject
        .isEnabled()
        .then((response) => {
          logger.debug(`[dApp] Connection is enabled: ${response}`)
          if (response) {
            tryConnectSilent(existingWallet).then()
          } else {
            setConnectionState(NOT_CONNECTED)
          }
        })
        .catch((err) => {
          setConnectionState(NOT_CONNECTED)
          logger.error(err)
        })
    } else {
      setConnectionState(NOT_CONNECTED);
    }
  }, [connect])

  const disconnect = useCallback(() => {
    setApi(null)
    setSelectedWallet('')
    setConnectionState(NOT_CONNECTED)
  }, [])

  const getAccounts = useCallback(async () => {
    if (!api) return []
    return await api.getUsedAddresses()
  }, [api])

  const getBalance = useCallback(async () => {
    if (!api) return '0'
    return await api.getBalance()
  }, [api])

  const sendTransaction = useCallback(async (tx) => {
    if (!api) throw new Error('Not connected')
    const signedTx = await api.signTx(tx)
    return await api.submitTx(signedTx)
  }, [api])

  const signMessage = useCallback(async (address, payload) => {
    if (!api) throw new Error('Not connected')
    return await api.signData(address, payload)
  }, [api])

  const values = useMemo(() => ({
    api,
    connect,
    disconnect,
    getAccounts,
    getBalance,
    sendTransaction,
    signMessage,
    connectionState,
    availableWallets,
    setAvailableWallets,
    selectedWallet,
    setConnectionState,
    setConnectionStateFalse,
    setSelectedWallet,
  }), [api, connect, disconnect, getAccounts, getBalance, sendTransaction, signMessage, connectionState, availableWallets, selectedWallet, setConnectionStateFalse])

  return <CardanoContext.Provider value={values}>{children}</CardanoContext.Provider>
}

const useCardano = () => {
  const context = React.useContext(CardanoContext)

  if (!context) {
    throw new Error('useCardano must be used within CardanoProvider')
  }

  return context
}

export default useCardano
