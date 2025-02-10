import React, {useEffect} from 'react'
import AccessButton from './components/accessButton'
import MainTab from './components/tabs/mainTab'
import TabsComponent from './components/tabs/tabsComponent'
import useYoroi from './hooks/yoroiProvider'
import {CONNECTED, NO_CARDANO} from './utils/connectionStates'
import Cip30Tab from './components/tabs/subtabs/cip30Tab'
import Cip95Tab from './components/tabs/subtabs/cip95Tab'
import Cip95TabTools from './components/tabs/subtabs/cip95ToolsTab'
import NFTTab from './components/tabs/subtabs/NFTTab'
import UtilsTab from './components/tabs/subtabs/utilsTab'

const App = () => {
  const {connectionState, selectedWallet, setConnectionState, setConnectionStateFalse} = useYoroi()
  const isWalletConnected = connectionState === CONNECTED
  const isNotCardanoWallet = connectionState === NO_CARDANO

  const walletStateWithTimeout = async (walletObject, timeout = 2000) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Checking connection timeout'))
      }, timeout)
    })
    const walletEnabledPromise = walletObject.isEnabled()
    const response = await Promise.race([walletEnabledPromise, timeoutPromise])
    return response 
  }

  useEffect(() => {
    const getConnectionState = async () => {
      console.debug(`[dApp][App] Checking connection works`)
      try {
        const walletObject = window.cardano[selectedWallet]
        const conState = await walletStateWithTimeout(walletObject, 5000)

        if (conState) {
          setConnectionState(CONNECTED)
        } else {
          setConnectionStateFalse()
        }
      } catch (error) {
        setConnectionStateFalse()
        console.error(error)
      }
    }

    if (isWalletConnected) {
      const connectionTimer = setInterval(getConnectionState, 3000)
      return () => {
        console.debug(`[dApp][App] Checking connection is stopped`)
        clearInterval(connectionTimer)
      }
    }
  }, [isWalletConnected, selectedWallet, setConnectionState, setConnectionStateFalse])

  const mainTabProps = {
    isWalletConnected,
    isNotCardanoWallet,
  }

  const data = [
    {
      label: 'CIP-30',
      value: 'cip30',
      children: <Cip30Tab />,
    },
    {
      label: 'CIP-95',
      value: 'cip95',
      children: <Cip95Tab />,
    },
    {
      label: 'CIP-95 Tools',
      value: 'cip95Tools',
      children: <Cip95TabTools />,
    },
    {
      label: 'NFTs',
      value: 'nfts',
      children: <NFTTab />,
    },
    {
      label: 'Utils',
      value: 'utils',
      children: <UtilsTab />,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-800">
      <AccessButton />
      <MainTab {...mainTabProps} />
      <TabsComponent tabsData={data} />
    </div>
  )
}

export default App
