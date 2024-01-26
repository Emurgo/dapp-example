import React, {useState} from 'react'
import GovToolsPanel from '../govToolsPanel'
import InputWithLabel from '../../inputWithLabel'
import {getCertOfNewDRepRetirement, getDRepRetirementCert} from '../../../utils/cslTools'

const DRepRetirementPanel = (props) => {
  const {wasm, onWaiting, onError, getters, setters, handleInputCreds} = props

  const {handleAddingCertInTx, setDRepIdInputValue} = setters
  const {dRepIdInputValue, getCertBuilder} = getters
  const [depositRefundAmount, setDepositRefundAmount] = useState('2000000')

  const buildDRepRetirementCert = () => {
    onWaiting(true)
    const certBuilder = getCertBuilder(wasm)
    try {
      const dRepCred = handleInputCreds(dRepIdInputValue)
      const dRepRetirementCert = getDRepRetirementCert(wasm, dRepCred, depositRefundAmount)
      certBuilder.add(getCertOfNewDRepRetirement(wasm, dRepRetirementCert))
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
    certLabel: 'dRepRetirement',
    clickFunction: buildDRepRetirementCert,
  }

  return (
    <GovToolsPanel {...panelProps}>
      <InputWithLabel
        inputName="DRep ID"
        helpText="Bech32 or Hex encoded"
        inputValue={dRepIdInputValue}
        onChangeFunction={(event) => {
          setDRepIdInputValue(event.target.value)
        }}
      />
      <InputWithLabel
        inputName="DRep Registration Deposit Refund Amount"
        helpText="This should be align with how much was paid during registration (in lovelace)"
        inputValue={depositRefundAmount}
        onChangeFunction={(event) => {
          setDepositRefundAmount(event.target.value)
        }}
      />
    </GovToolsPanel>
  )
}

export default DRepRetirementPanel
