import React, {useState} from 'react'
import GovToolsPanel from '../govToolsPanel'
import CheckboxWithLabel from '../../checkboxWithLabel'
import InputWithLabel from '../../inputWithLabel'
import {protocolParams} from '../../../utils/networkConfig'
import {getCertOfNewStakeDereg, getStakeKeyDeregCert, getStakeKeyDeregCertWithCoin} from '../../../utils/cslTools'

const UnregisterStakeKeyPanel = (props) => {
  const {wasm, onWaiting, onError, getters, setters, handleInputCreds} = props
  const {getCertBuilder} = getters
  const {handleAddingCertInTx} = setters

  const [stakeKeyHash, setStakeKeyHash] = useState('')
  const [stakeDepositRefundAmount, setStakeDepositRefundAmount] = useState(protocolParams.keyDeposit)
  const [useConway, setUseConway] = useState(false)

  const handleUseConwayCert = () => {
    setUseConway(!useConway)
    console.debug(`[dApp][UnregisterStakeKeyPanel] use Conway Stake Registration Certificate is set: ${!useConway}`)
  }

  const buildUnregStakeKey = () => {
    onWaiting(true)
    const certBuilder = getCertBuilder(wasm)
    try {
      const stakeCred = handleInputCreds(stakeKeyHash)
      let stakeKeyDeregCert
      if (useConway) {
        stakeKeyDeregCert = getStakeKeyDeregCertWithCoin(wasm, stakeCred, stakeDepositRefundAmount)
      } else {
        stakeKeyDeregCert = getStakeKeyDeregCert(wasm, stakeCred)
      }
      certBuilder.add(getCertOfNewStakeDereg(wasm, stakeKeyDeregCert))
      handleAddingCertInTx(certBuilder)
      onWaiting(false)
    } catch (error) {
      console.error(error)
      onWaiting(false)
      onError()
    }
  }

  const panelProps = {
    buttonName: 'Build Cert',
    certLabel: 'unregStakeKey',
    clickFunction: buildUnregStakeKey,
  }

  return (
    <GovToolsPanel {...panelProps}>
      <CheckboxWithLabel
        currentState={useConway}
        onChangeFunc={handleUseConwayCert}
        name="useNewConwayStakeRegCert"
        labelText="Use the new Conway Stake Unregistration Certificate (with coin)"
      />
      <InputWithLabel
        inputName="Stake Key Hash"
        inputValue={stakeKeyHash}
        onChangeFunction={(event) => {
          setStakeKeyHash(event.target.value)
        }}
      />
      <InputWithLabel
        inputName="Stake Key Deposit Refund Amount (lovelaces)"
        helpText="This should be align with how was paid during the registration"
        inputValue={stakeDepositRefundAmount}
        onChangeFunction={(event) => {
          setStakeDepositRefundAmount(event.target.value)
        }}
      />
    </GovToolsPanel>
  )
}

export default UnregisterStakeKeyPanel
