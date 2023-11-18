import React, {useState} from 'react'
import Popup from 'reactjs-popup'
import useYoroi from '../hooks/yoroiProvider'
import {NO_CARDANO} from '../utils/connectionStates'

const WalletsModal = () => {
  const {connect, availableWallets, setSelectedWallet, connectionState} = useYoroi()
  const [selectedUserWallet, setSelectedUserWallet] = useState('')
  const [isAuthChecked, setIsAuthChecked] = useState(false)
  console.log(`[dApp][WalletsModal] is called`)

  const handleSelectionAndClose = (closeFunc) => {
    console.log(`[dApp][WalletsModal] selected wallet is ${selectedUserWallet}`)
    setSelectedWallet(selectedUserWallet)
    closeFunc()
    console.log(`[dApp][WalletsModal] is closed`)
    connect(selectedUserWallet, isAuthChecked, false)
  }

  const handleOnChangeAuth = () => {
    setIsAuthChecked(!isAuthChecked)
  }

  const overlayStyle = {background: 'rgba(0,0,0,0.5)'}
  const modal = true
  const nested = false

  const buttonProps = {
    className:
      'rounded-md border-black-300 bg-blue-500 hover:bg-blue-300 active:bg-blue-700 py-5 px-5 disabled:opacity-50',
    disabled: connectionState === NO_CARDANO ?? 'disabled',
  }

  return (
    <Popup trigger={<button {...buttonProps}>Connect Wallet</button>} {...{modal, nested, overlayStyle}}>
      {(close) => (
        <div className="bg-gray-900 border rounded-md border-gray-700 shadow-lg w-full outline-none focus:outline-none">
          {/* close button and modal window title */}
          <div className="flex bg-blue-900">
            <div className="flex flex-auto justify-center">
              <div className="pl-1 bg-transparent text-white float-left text-2xl font-semibold outline-none focus:outline-none">
                Select Wallet
              </div>
            </div>
            <div className="flex-none">
              <button
                className="rounded-md border-black-300 bg-red-500 hover:bg-red-300 active:bg-red-700 py-1 px-2"
                onClick={close}
              >
                &times;
              </button>
            </div>
          </div>
          {/* wallet buttons */}
          <div className="text-white my-2 px-2">Please, select one of presented wallets to continue</div>
          <div className="grid justify-items-center grid-cols-3 gap-2 my-2 px-1">
            {availableWallets.map((walletInfo) => (
              <div className="text-white" key={walletInfo.walletObjKey.toLowerCase()}>
                <label>
                  {walletInfo.walletObjKey.toLowerCase()}
                  <input
                    className="ml-1"
                    type="radio"
                    name="avalable_wallets"
                    value={walletInfo.walletObjKey.toLowerCase()}
                    onChange={() => setSelectedUserWallet(walletInfo.walletObjKey.toLowerCase())}
                  />
                  <div>
                    <img src={walletInfo.walletObjInfo.icon} alt={walletInfo.walletObjKey.toLowerCase()} width="72" />
                  </div>
                </label>
              </div>
            ))}
          </div>
          {/* auth checkbox */}
          {selectedUserWallet === 'yoroi' && (
            <div className="grid justify-items-center py-5 text-l font-bold tracking-tight text-white">
              <div>
                <input
                  type="checkbox"
                  id="authRequired"
                  name="authRequiredCheckbox"
                  checked={isAuthChecked}
                  onChange={handleOnChangeAuth}
                />
                <label htmlFor="authRequired">
                  <span /> Request authentication
                </label>
              </div>
            </div>
          )}
          {/* confirmation button */}
          <div className="flex">
            <div className="flex-auto">
              <button
                className="w-full rounded-md bg-blue-500 hover:bg-blue-300 text-xl active:bg-blue-700 py-1 px-2"
                onClick={() => {
                  handleSelectionAndClose(close)
                }}
              >
                Select
              </button>
            </div>
          </div>
        </div>
      )}
    </Popup>
  )
}

export default WalletsModal
