import React, {useState, useEffect} from 'react'
import {NOT_CONNECTED, IN_PROGRESS, CONNECTED, NO_CARDANO} from '../utils/connectionStates'

const YoroiContext = React.createContext(null)
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

export const YoroiProvider = ({children}) => {
  console.log('[dApp][YoroiProvider] is called')
  const [api, setApi] = useState(null)
  const [authEnabled, setAuthEnabled] = useState(false)
  const [connectionState, setConnectionState] = useState(NOT_CONNECTED)
  const [availableWallets, setAvailableWallets] = useState([])
  const [selectedWallet, setSelectedWallet] = useState('')

  const setConnectionStateFalse = () => {
    setConnectionState(NOT_CONNECTED)
    setAuthEnabled(false)
    setApi(null)
  }

  useEffect(() => {
    if (!window.cardano) {
      console.warn('[dApp] There are no cardano wallets are installed')
      setConnectionState(NO_CARDANO)
      return
    }

    // We need to filter like this because of the Nami wallet.
    // It injects everything into the cardano object not only the object "nami".
    const userWallets = Object.keys(window.cardano).filter((cardanoKey) => !reservedKeys.includes(cardanoKey))
    const allInfoWallets = userWallets.map((walletName) => window.cardano[walletName])
    setAvailableWallets(allInfoWallets)

    if (userWallets.length === 1) {
      const existingWallet = userWallets[0]
      const walletObject = window.cardano[existingWallet]
      walletObject
        .isEnabled()
        .then((response) => {
          console.log(`[dApp] Connection is enabled: ${response}`)
          if (response) {
            tryConnectSilent(existingWallet).then()
          } else {
            setConnectionState(NOT_CONNECTED)
            return
          }
        })
        .catch((err) => {
          setConnectionState(NOT_CONNECTED)
          console.error(err)
        })
    }
  }, [])

  /**
   * @param {string} walletName - A wallet name as it is presented in the Cardano object
   * @returns {Promise<void>}
   */
  const tryConnectSilent = async (walletName) => {
    let connectResult = null
    console.log(`[dApp][tryConnectSilent] is called`)
    try {
      console.log(`[dApp][tryConnectSilent] trying {true, true}`)
      connectResult = await connect(walletName, true, true, true)
      if (connectResult != null) {
        console.log('[dApp][tryConnectSilent] RE-CONNECTED!')
        setSelectedWallet(walletName)
        setConnectionState(CONNECTED)
        return
      }
    } catch (error) {
      console.warn(`[dApp][tryConnectSilent]: failed {true, true}`)
      console.warn('[dApp][tryConnectSilent] no silent re-connection with auth is available')
      try {
        console.log(`[dApp][tryConnectSilent] trying {false, true}`)
        setConnectionState(IN_PROGRESS)
        connectResult = await connect(walletName, false, true, false)
        if (connectResult != null) {
          console.log('[dApp][tryConnectSilent] RE-CONNECTED!')
          setSelectedWallet(walletName)
          setConnectionState(CONNECTED)
          return
        }
      } catch (error) {
        setConnectionState(NOT_CONNECTED)
        console.error(error)
      }
    }
  }

  /**
   * @param {string} walletName - A wallet name as it is presented in the Cardano object
   * @param {bool} requestId - Request connection with or without required authentication
   * @param {bool} silent - Request connection with or without showing the connection pop-up
   * @param {bool} throwError - Throw an error which possibly can be while connecting to the wallet
   * @returns {Promise<any>}
   */
  const connect = async (walletName, requestId, silent, throwError = false) => {
    setConnectionState(IN_PROGRESS)
    console.log(`[dApp][connect] is called`)

    if (!window.cardano) {
      console.error('There are no cardano wallets are installed')
      setConnectionState(NOT_CONNECTED)
      return
    }

    console.log(`[dApp][connect] connecting the wallet "${walletName}"`)
    console.log(`[dApp][connect] {requestIdentification: ${requestId}, onlySilent: ${silent}}`)

    try {
      const connectedApi = await window.cardano[walletName].enable({
        requestIdentification: requestId,
        onlySilent: silent,
      })
      console.log(`[dApp][connect] wallet API object is received`)
      setApi(connectedApi)
      if (requestId && connectedApi.experimental && connectedApi.experimental.auth) {
        const auth = connectedApi.experimental.auth()
        setAuthEnabled(auth?.isEnabled())
      }
      setConnectionState(CONNECTED)
      if (connectedApi.experimental?.onDisconnect) {
        connectedApi.experimental.onDisconnect(setConnectionStateFalse)
      }
      return connectedApi
    } catch (error) {
      console.error(`[dApp][connect] The error received while connecting the wallet`)
      setConnectionState(NOT_CONNECTED)
      if (throwError) {
        throw new Error(JSON.stringify(error))
      } else {
        console.error(`[dApp][connect] ${error}`)
      }
    }
  }

  const values = {
    api,
    connect,
    authEnabled,
    connectionState,
    availableWallets,
    setAvailableWallets,
    selectedWallet,
    setSelectedWallet,
  }

  return <YoroiContext.Provider value={values}>{children}</YoroiContext.Provider>
}

const useYoroi = () => {
  const context = React.useContext(YoroiContext)

  if (context === undefined) {
    throw new Error('Install Yoroi')
  }

  return context
}

export default useYoroi
