import {
  getTxBuilder,
  getPublicKeyFromHex,
  getCslCredentialFromHex,
  getWithdrawalsBuilder,
  strToBigNum,
  getCslRewardAddress,
  getCslUtxos,
  getAddressFromBytes,
  getLargestFirstMultiAsset,
  getFixedTxFromBytes,
  getTransactionWitnessSetFromBytes,
} from '../../../utils/cslTools'
import ApiCardWithModal from '../apiCardWithModal'
import {ModalWindowContent} from '../../ui-constants'
import {useEffect, useState} from 'react'

const WithdrawCard = ({api, onRawResponse, onResponse, onWaiting}) => {
  const [networkType, setNetworkType] = useState('preprod')
  const [showNetworkSelection, setShowNetworkSelection] = useState(false)
  const [waitingAccountInfo, setWaitingAccountInfo] = useState(false)
  const [isDelegated, setIsDelegated] = useState(false)
  const [rewardAmount, setRewardAmount] = useState('0')
  const [stakePool, setStakePool] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showSuccessInfo, setShowSuccessInfo] = useState(false)

  const handleNetworkSelection = async () => {
    const walletNetworkId = await api?.getNetworkId()
    if (walletNetworkId === 1) {
      setNetworkType('mainnet')
      setShowNetworkSelection(false)
    } else if (walletNetworkId === 0) {
      setShowNetworkSelection(true)
    }
  }

  useEffect(() => {
    handleNetworkSelection()
  })

  const getAccountInfo = async () => {
    setWaitingAccountInfo(true)
    setErrorMessage('')
    setShowSuccessInfo(false)
    let backendUrl = ''

    if (networkType === 'mainnet') {
      backendUrl = 'api.yoroiwallet.com'
    } else if (networkType === 'preview') {
      backendUrl = 'preview-backend.emurgornd.com'
    } else {
      backendUrl = 'preprod-backend.yoroiwallet.com'
    }

    try {
      const rewardAddressHex = (await api?.getRewardAddresses())[0]
      const endpointUrl = `https://${backendUrl}/api/account/state`
      const delegationInfoResponse = await fetch(endpointUrl, {
        headers: {
          accept: 'application/json, text/plain, */*',
          'content-type': 'application/json',
        },
        body: `{"addresses":["${rewardAddressHex}"]}`,
        method: 'POST',
      })

      if (!delegationInfoResponse.ok) {
        setErrorMessage('Something went wrong while getting delegation info')
        return
      }

      const delegationInfo = (await delegationInfoResponse.json())[rewardAddressHex]

      if (!delegationInfo.stakeRegistered) {
        setErrorMessage('Staking key is not registered!')
        return
      }

      if (!delegationInfo.delegation) {
        setErrorMessage('Staking key is not delegated!')
        setIsDelegated(false)
        return
      }

      setIsDelegated(true)
      setRewardAmount(delegationInfo.remainingAmount)
      setStakePool(delegationInfo.delegation)
      setShowSuccessInfo(true)
    } catch (error) {
      setErrorMessage('Network error occurred while fetching account info')
    } finally {
      setWaitingAccountInfo(false)
    }
  }

  const withdrawClick = async () => {
    const txBuilder = getTxBuilder()
    try {
      onWaiting(true)
      // build withdraw
      const utxos = await api?.getUtxos()
      const pubStakeKey = await api?.cip95.getRegisteredPubStakeKeys()
      const stakeKeyHash = getPublicKeyFromHex(pubStakeKey[0]).hash().to_hex()
      const stakeKeyHashCredential = getCslCredentialFromHex(stakeKeyHash)
      const keyRewardAddress = getCslRewardAddress(networkType, stakeKeyHashCredential)
      const withdrawalsBuilder = getWithdrawalsBuilder()
      withdrawalsBuilder.add(keyRewardAddress, strToBigNum(rewardAmount))
      txBuilder.set_withdrawals_builder(withdrawalsBuilder)

      const wasmUtxos = getCslUtxos(utxos)
      const changeAddress = await api?.getChangeAddress()
      const wasmChangeAddress = getAddressFromBytes(changeAddress)
      txBuilder.add_inputs_from(wasmUtxos, getLargestFirstMultiAsset())
      txBuilder.add_change_if_needed(wasmChangeAddress)
      const tx = txBuilder.build_tx()

      const fixedTx = getFixedTxFromBytes(tx.to_bytes())
      const signaturesWitnessesSet = await api.signTx(fixedTx.to_hex())
      const witnesses = getTransactionWitnessSetFromBytes(signaturesWitnessesSet)
      const vkeysSignatures = witnesses.vkeys()
      for (let i = 0; i < vkeysSignatures.len(); i++) {
        fixedTx.add_vkey_witness(vkeysSignatures.get(i))
      }
      console.log('Withdrawal signed Tx: ', fixedTx.to_hex())

      const txId = await api?.submitTx(fixedTx.to_hex())
      onWaiting(false)
      onRawResponse(txId)
      onResponse(txId, false)
    } catch (error) {
      onRawResponse('')
      onResponse(error)
    } finally {
      onWaiting(false)
    }
  }

  const apiProps = {
    buttonLabel: 'Withdraw',
    clickFunction: withdrawClick,
    btnDisabled: !isDelegated,
  }
  return (
    <ApiCardWithModal {...apiProps}>
      <div className={ModalWindowContent.contentPadding}>
        {showNetworkSelection && !waitingAccountInfo && (
          <div className="mb-4">
            <div className="text-white mb-2">Select Network:</div>
            <div className="flex items-center space-x-4 justify-evenly">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="network"
                  value="preprod"
                  checked={networkType === 'preprod'}
                  onChange={(e) => {
                    setNetworkType(e.target.value)
                  }}
                />
                <span className="ml-2 text-white">Preprod</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="network"
                  value="preview"
                  checked={networkType === 'preview'}
                  onChange={(e) => {
                    setNetworkType(e.target.value)
                  }}
                />
                <span className="ml-2 text-white">Preview</span>
              </label>
            </div>
          </div>
        )}

        {waitingAccountInfo ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            {errorMessage && <div className="mb-4 p-2 bg-red-900 text-white rounded">{errorMessage}</div>}

            {showSuccessInfo && (
              <div className="mb-4 p-2 bg-green-900 text-white rounded">
                <div>Pool: {stakePool}</div>
                <div>Available reward (lovelaces): {rewardAmount}</div>
              </div>
            )}

            <div className="flex">
              <div className="flex-auto mt-3 mx-2">
                <button
                  className="w-full py-1 rounded-md text-xl text-white font-semibold bg-green-700 hover:bg-green-800 active:bg-green-500"
                  onClick={getAccountInfo}
                  disabled={waitingAccountInfo}
                >
                  Get Account info
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </ApiCardWithModal>
  )
}

export default WithdrawCard
