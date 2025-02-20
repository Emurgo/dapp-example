import React, {useState} from 'react'
import GovToolsPanel from '../govToolsPanel'
import InputWithLabel from '../../inputWithLabel'
import {getAnchor, getCertOfNewDRepReg, getDRepRegCert, getDRepRegWithAnchorCert} from '../../../utils/cslTools'
import {bytesToHex} from '../../../utils/utils'

const DRepRegistrationPanel = (props) => {
  const {onWaiting, onError, getters, setters, handleInputCreds} = props

  const {handleAddingCertInTx, setDRepIdInputValue} = setters
  const {dRepIdInputValue, getCertBuilder} = getters

  const [depositAmount, setDepositAmount] = useState('2000000')
  const [metadataURL, setMetadataURL] = useState('')
  const [metadataHash, setMetadataHash] = useState('')

  const buildDRepRegistrationCert = () => {
    onWaiting(true)
    const certBuilder = getCertBuilder()
    try {
      const dRepCred = handleInputCreds(dRepIdInputValue)
      let dRepRegCert = null
      if (metadataURL.length > 0) {
        const dataHash =
          metadataHash.length > 0
            ? metadataHash
            : bytesToHex(new TextEncoder().encode('{"testField": "_test__message_"}'))
        const anchor = getAnchor(metadataURL, dataHash)
        dRepRegCert = getDRepRegWithAnchorCert(dRepCred, depositAmount, anchor)
      } else {
        dRepRegCert = getDRepRegCert(dRepCred, depositAmount)
      }
      certBuilder.add(getCertOfNewDRepReg(dRepRegCert))
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
    certLabel: 'dRepRegistration',
    clickFunction: buildDRepRegistrationCert,
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
        inputName="DRep Registration Deposit Amount"
        helpText="This should be align with current protocol parameters (in lovelace)"
        inputValue={depositAmount}
        onChangeFunction={(event) => {
          setDepositAmount(event.target.value)
        }}
      />
      <InputWithLabel
        inputName="Metadata URL (Optional)"
        inputValue={metadataURL}
        onChangeFunction={(event) => {
          setMetadataURL(event.target.value)
        }}
      />
      <InputWithLabel
        inputName="Metadata Hash (Optional)"
        inputValue={metadataHash}
        onChangeFunction={(event) => {
          setMetadataHash(event.target.value)
        }}
      />
    </GovToolsPanel>
  )
}

export default DRepRegistrationPanel
