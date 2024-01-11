import React from 'react'
import useYoroi from '../hooks/yoroiProvider'
import {textPartFromWalletChecksumImagePart} from '@emurgo/cip4-js'
import {IN_PROGRESS} from '../utils/connectionStates'
import WalletsModal from './walletsModal'

const AccessButton = () => {
  // add selectedWallet here
  const {api, authEnabled, connectionState, availableWallets, selectedWallet} = useYoroi()
  console.log(`[dApp][AccessButton] available wallets: ${availableWallets.length}`)

  const getWalletPlate = (apiObject, isAuthEnabled) => {
    let walletId = 'anonymous wallet'
    console.log(`[dApp][getWalletPlate] isAuthEnabled - ${isAuthEnabled}`)
    if (isAuthEnabled) {
      const auth = apiObject.experimental.auth && apiObject.experimental.auth()
      walletId = auth.getWalletId()
      return textPartFromWalletChecksumImagePart(walletId)
    }
    return walletId
  }

  const getWalletIcon = () => {
    return window.cardano[selectedWallet].icon
  }

  const getWalletName = () => {
    const walletName = window.cardano[selectedWallet].name
    const capitilizedFirstLetter = walletName[0].toUpperCase() + walletName.substring(1)

    return capitilizedFirstLetter
  }

  return (
    <div className="mx-auto bg-gray-900">
      <div className="grid justify-items-center py-3">
        {api ? (
          <div className="grid grid-cols-4">
            <div className="grid justify-items-end py-5">
              <img src={getWalletIcon()} alt="wallet icon" width="72" />
            </div>
            <div className="col-span-3 text-xl font-bold tracking-tight text-white text-center ml-1">
              <div className="py-5">
                <div>Connected To {getWalletName()}</div>
                <div className="py-1">{getWalletPlate(api, authEnabled)}</div>
              </div>
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
      </div>
    </div>
  )
}

export default AccessButton
