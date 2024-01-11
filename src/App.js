import React from 'react'
import AccessButton from './components/accessButton'
import MainTab from './components/tabs/mainTab'
import TabsComponent from './components/tabs/tabsComponent'
import useYoroi from './hooks/yoroiProvider'
import {CONNECTED, NO_CARDANO} from './utils/connectionStates'

const App = () => {
  const {connectionState} = useYoroi()
  const isWalletConnected = connectionState === CONNECTED
  const isNotCardanoWallet = connectionState === NO_CARDANO

  const mainTabProps = {
    isWalletConnected,
    isNotCardanoWallet,
  }

  return (
    <div className="min-h-screen bg-gray-800">
      <AccessButton />
      <MainTab {...mainTabProps} />
      <TabsComponent />
    </div>
  )
}

export default App
