import logger from '../utils/logger'
import React from 'react'
import useCardano from '../hooks/cardanoProvider'
import {IN_PROGRESS} from '../utils/connectionStates'
import WalletsModal from './walletsModal'
import AccessButtonShell from './accessButtonShell'

const AccessButton = () => {
  const {api, connectionState, availableWallets, selectedWallet} = useCardano()
  logger.log(`[dApp][AccessButton] available wallets: ${availableWallets.length}`)

  const getWalletIcon = () => {
    return window.cardano[selectedWallet].icon
  }

  const getWalletName = () => {
    const walletName = window.cardano[selectedWallet].name
    const capitilizedFirstLetter = walletName[0].toUpperCase() + walletName.substring(1)

    return capitilizedFirstLetter
  }

  return (
    <AccessButtonShell>
      {api ? (
        <div className="flex items-center justify-center gap-3 py-5">
          <img src={getWalletIcon()} alt="wallet icon" className="w-10 sm:w-14 lg:w-16" />
          <div className="text-base sm:text-xl font-bold tracking-tight text-white text-center">
            <div>Connected To {getWalletName()}</div>
            <div className="py-1 text-sm sm:text-base">anonymous wallet</div>
          </div>
        </div>
      ) : connectionState === IN_PROGRESS ? (
        <div className="pt-5 pb-5 text-m font-bold tracking-tight text-green-500">
          <label>Wallet connecting is in progress ...</label>
        </div>
      ) : (
        <div>
          <WalletsModal />
        </div>
      )}
    </AccessButtonShell>
  )
}

export default AccessButton
