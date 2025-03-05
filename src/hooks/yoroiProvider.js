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
  console.debug('[dApp][YoroiProvider] is called')
  const [api, setApi] = useState(null)
  const [connectionState, setConnectionState] = useState(NO_CARDANO)
  const [availableWallets, setAvailableWallets] = useState([])
  const [selectedWallet, setSelectedWallet] = useState('')

  const setConnectionStateFalse = () => {
    setConnectionState(NOT_CONNECTED)
    setApi(null)
  }

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

  useEffect(() => {
    if (!window.cardano) {
      console.warn('[dApp] There are no cardano wallets are installed')
      setConnectionState(NO_CARDANO)
      return
    }

    /**
   * @param {string} walletName - A wallet name as it is presented in the Cardano object
   * @returns {Promise<void>}
   */
    const tryConnectSilent = async (walletName) => {
      let connectResult = null
      console.debug(`[dApp][tryConnectSilent] is called`)
      try {
        console.debug(`[dApp][tryConnectSilent] trying {false, true}`)
        setConnectionState(IN_PROGRESS)
        connectResult = await connect(walletName, false, true, false)
        if (connectResult != null) {
          console.log('[dApp][tryConnectSilent] RE-CONNECTED!')
          setSelectedWallet(walletName)
          setConnectionState(CONNECTED)
          return
        }
      } catch (error) {
        setSelectedWallet('')
        setConnectionState(NOT_CONNECTED)
        console.error(error)
      }
    }

    const availableWallets = getAvailableWallets()
    console.log('[dApp] allInfoWallets: ', availableWallets)
    setAvailableWallets(availableWallets)

    if (availableWallets.length === 1) {
      const existingWallet = availableWallets[0].walletObjKey
      const walletObject = window.cardano[existingWallet]
      walletObject
        .isEnabled()
        .then((response) => {
          console.debug(`[dApp] Connection is enabled: ${response}`)
          if (response) {
            tryConnectSilent(existingWallet).then()
          } else {
            setConnectionState(NOT_CONNECTED)
          }
        })
        .catch((err) => {
          setConnectionState(NOT_CONNECTED)
          console.error(err)
        })
    } else {
      setConnectionState(NOT_CONNECTED);
    }
  }, [])

  /**
   * @param {string} walletName - A wallet name as it is presented in the Cardano object
   * @param {bool} requestId - Request connection with or without required authentication
   * @param {bool} silent - Request connection with or without showing the connection pop-up
   * @param {bool} throwError - Throw an error which possibly can be while connecting to the wallet
   * @returns {Promise<any>}
   */
  const connect = async (walletName, requestId, silent, throwError = false) => {
    setConnectionState(IN_PROGRESS)
    setApi(null)
    console.debug(`[dApp][connect] is called`)

    if (!window.cardano) {
      console.error('There are no cardano wallets are installed')
      setConnectionState(NOT_CONNECTED)
      return
    }

    console.log(`[dApp][connect] connecting the wallet "${walletName}"`)
    console.debug(`[dApp][connect] {requestIdentification: ${requestId}, onlySilent: ${silent}}`)

    try {
      const connectedApi = await window.cardano[walletName].enable({
        requestIdentification: requestId,
        onlySilent: silent,
      })
      console.debug(`[dApp][connect] wallet API object is received`)
      setApi(connectedApi)
      setSelectedWallet(walletName)
      setConnectionState(CONNECTED)
      return connectedApi
    } catch (error) {
      console.error(`[dApp][connect] The error received while connecting the wallet`)
      setSelectedWallet('')
      setConnectionState(NOT_CONNECTED)
      if (throwError) {
        throw new Error(JSON.stringify(error))
      } else {
        console.error(`[dApp][connect] ${JSON.stringify(error)}`)
      }
    }
  }

  const values = {
    api,
    connect,
    connectionState,
    availableWallets,
    setAvailableWallets,
    selectedWallet,
    setConnectionState,
    setConnectionStateFalse,
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
