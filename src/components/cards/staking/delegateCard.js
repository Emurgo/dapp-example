import {useEffect, useState} from 'react'
import logger from '../../../utils/logger'
import {getFixedTxFromBytes, getTransactionWitnessSetFromBytes} from '../../../utils/cslTools'
import ApiCardWithModal from '../apiCardWithModal'
import {ModalWindowContent} from '../../ui-constants'
import InputWithLabel from '../../inputWithLabel'
import {firstOrThrow} from '../../../utils/helpFunctions'
import {fetchAccountInfo} from './logic/withdraw'
import {buildDelegationTx, getStakeKeyHashFromPubKey, resolveDelegationStakeKey} from './logic/delegate'

const DelegateCard = ({api, onRawResponse, onResponse, onWaiting}) => {
  const [networkType, setNetworkType] = useState('preprod')
  const [projectId, setProjectId] = useState('')
  const [waitingAccountInfo, setWaitingAccountInfo] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showSuccessInfo, setShowSuccessInfo] = useState(false)
  const [stakeRegistered, setStakeRegistered] = useState(false)
  const [stakePool, setStakePool] = useState('')
  const [poolId, setPoolId] = useState('')

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

      setStakeRegistered(Boolean(delegationInfo.stakeRegistered))
      setStakePool(delegationInfo.delegation || '')
      setShowSuccessInfo(true)
    } catch (error) {
      setErrorMessage('Network error occurred while fetching account info')
      logger.error(error)
    } finally {
      setWaitingAccountInfo(false)
    }
  }

  const delegateClick = async () => {
    try {
      onWaiting(true)
      const registeredPubKeys = (await api?.cip95.getRegisteredPubStakeKeys()) || []
      const unregisteredPubKeys = (await api?.cip95.getUnregisteredPubStakeKeys()) || []
      const {pubKeyHex, needsRegistration} = resolveDelegationStakeKey({registeredPubKeys, unregisteredPubKeys})
      const stakeKeyHash = getStakeKeyHashFromPubKey(pubKeyHex)
      const hexUtxos = await api?.getUtxos()
      const changeAddressHex = await api?.getChangeAddress()
      const tx = buildDelegationTx({
        hexUtxos,
        changeAddressHex,
        stakeKeyHash,
        poolId,
        registerStakeKey: needsRegistration,
      })

      const fixedTx = getFixedTxFromBytes(tx.to_bytes())
      logger.log('[DelegateCard] Unsigned Tx:', fixedTx)
      const signaturesWitnessesSet = await api.signTx(fixedTx.to_hex())
      const witnesses = getTransactionWitnessSetFromBytes(signaturesWitnessesSet)
      const vkeysSignatures = witnesses.vkeys()
      for (let i = 0; i < vkeysSignatures.len(); i++) {
        fixedTx.add_vkey_witness(vkeysSignatures.get(i))
      }
      logger.log('[DelegateCard] Signed Tx:', fixedTx.to_hex())

      const txId = await api?.submitTx(fixedTx.to_hex())
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
    buttonLabel: 'Delegate to Pool',
    clickFunction: delegateClick,
    btnDisabled: poolId.trim().length === 0,
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
              <div className="mb-4 p-2 bg-green-900 text-white rounded">
                <div>Stake key registered: {stakeRegistered ? 'yes' : 'no'}</div>
                <div>Current pool: {stakePool || 'not delegated'}</div>
              </div>
            )}

            <InputWithLabel
              inputName="Blockfrost Project ID"
              helpText="project_id from blockfrost.io for this network"
              inputValue={projectId}
              onChangeFunction={(event) => setProjectId(event.target.value)}
            />

            <InputWithLabel
              inputName="Pool ID"
              helpText="bech32 pool1… ID or 56-character hex pool key hash"
              inputValue={poolId}
              onChangeFunction={(event) => setPoolId(event.target.value)}
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

export default DelegateCard
