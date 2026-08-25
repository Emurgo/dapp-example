import logger from '../../../utils/logger'
import {
  getAddressFromBytes,
  getCertificateBuilder,
  getCertOfNewStakeDereg,
  getCslCredentialFromHex,
  getCslUtxos,
  getLargestFirstMultiAsset,
  getFixedTxFromBytes,
  getStakeKeyDeregCert,
  getStakeKeyHashFromRewardAddressHex,
  getTransactionWitnessSetFromBytes,
} from '../../../utils/cslTools'
import ApiCardWithModal from '../apiCardWithModal'
import {ModalWindowContent} from '../../ui-constants'
import {useEffect, useState} from 'react'
import {fetchAccountInfo, getTxBuilderWithWithdrawal} from './logic/withdraw'
import {firstOrThrow} from '../../../utils/helpFunctions'
import CheckboxWithLabel from '../../checkboxWithLabel'
import InputWithLabel from '../../inputWithLabel'

const WithdrawCard = ({api, onRawResponse, onResponse, onWaiting}) => {
  const [networkType, setNetworkType] = useState('preprod')
  const [projectId, setProjectId] = useState('')
  const [waitingAccountInfo, setWaitingAccountInfo] = useState(false)
  const [isDelegated, setIsDelegated] = useState(false)
  const [rewardAmount, setRewardAmount] = useState('0')
  const [stakePool, setStakePool] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showSuccessInfo, setShowSuccessInfo] = useState(false)
  const [undelegate, setUndelegate] = useState(false)

  useEffect(() => {
    const selectNetwork = async () => {
      const walletNetworkId = await api?.getNetworkId()
      setNetworkType(walletNetworkId === 1 ? 'mainnet' : 'preprod')
    }
    selectNetwork()
  }, [api])

  const getAccountInfo = async () => {
    setWaitingAccountInfo(true)
    setErrorMessage('')
    setShowSuccessInfo(false)

    try {
      const rewardAddressHex = firstOrThrow(await api?.getRewardAddresses(), 'No reward address available from wallet')
      const delegationInfo = await fetchAccountInfo(networkType, rewardAddressHex, projectId)

      if (!delegationInfo.ok) {
        setErrorMessage('Something went wrong while getting delegation info')
        return
      }

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
      logger.error(error)
    } finally {
      setWaitingAccountInfo(false)
    }
  }

  const withdrawClick = async () => {
    try {
      onWaiting(true)
      // build withdraw
      const rewardAddressHex = firstOrThrow(await api?.getRewardAddresses(), 'No reward address available from wallet')
      const stakeKeyHash = getStakeKeyHashFromRewardAddressHex(rewardAddressHex)
      const txBuilderWithWithdrawal = await getTxBuilderWithWithdrawal(stakeKeyHash, networkType, rewardAmount)
      const utxos = await api?.getUtxos()

      if (undelegate) {
        const certBuilder = getCertificateBuilder()
        const stakeCred = getCslCredentialFromHex(stakeKeyHash)
        const stakeKeyDeregCert = getStakeKeyDeregCert(stakeCred)
        certBuilder.add(getCertOfNewStakeDereg(stakeKeyDeregCert))
        txBuilderWithWithdrawal.set_certs_builder(certBuilder)
      }

      const wasmUtxos = getCslUtxos(utxos)
      const changeAddress = await api?.getChangeAddress()
      const wasmChangeAddress = getAddressFromBytes(changeAddress)
      txBuilderWithWithdrawal.add_inputs_from(wasmUtxos, getLargestFirstMultiAsset())
      txBuilderWithWithdrawal.add_change_if_needed(wasmChangeAddress)
      const tx = txBuilderWithWithdrawal.build_tx()

      const fixedTx = getFixedTxFromBytes(tx.to_bytes())
      logger.log('[WithdrawCard] Unsingned Tx:', fixedTx)
      const signaturesWitnessesSet = await api.signTx(fixedTx.to_hex())

      const witnesses = getTransactionWitnessSetFromBytes(signaturesWitnessesSet)
      const vkeysSignatures = witnesses.vkeys()
      for (let i = 0; i < vkeysSignatures.len(); i++) {
        fixedTx.add_vkey_witness(vkeysSignatures.get(i))
      }
      logger.log('Withdrawal signed Tx: ', fixedTx.to_hex())

      const txId = await api?.submitTx(fixedTx.to_hex())
      onWaiting(false)
      onRawResponse(txId)
      onResponse(txId, false)
    } catch (error) {
      logger.error(error)
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
        {waitingAccountInfo ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            {errorMessage && <div className="mb-4 p-2 bg-red-900 text-white rounded">{errorMessage}</div>}

            {showSuccessInfo && (
              <div>
                <div className="mb-4 p-2 bg-green-900 text-white rounded">
                  <div>Pool: {stakePool}</div>
                  <div>Available reward (lovelaces): {rewardAmount}</div>
                </div>
                <CheckboxWithLabel
                  currentState={undelegate}
                  onChangeFunc={(event) => setUndelegate(event.target.checked)}
                  name="undelegateFromPool"
                  labelText="Undelegate stake key"
                />
              </div>
            )}

            <InputWithLabel
              inputName="Blockfrost Project ID"
              helpText="project_id from blockfrost.io for this network"
              inputValue={projectId}
              onChangeFunction={(event) => setProjectId(event.target.value)}
            />

            <div className="flex">
              <div className="flex-auto mt-3 mx-2">
                <button
                  className="w-full py-1 rounded-md text-xl text-white font-semibold bg-green-700 hover:bg-green-800 active:bg-green-500"
                  onClick={getAccountInfo}
                  disabled={waitingAccountInfo || projectId.trim().length === 0}
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
