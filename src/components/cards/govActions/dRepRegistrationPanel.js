import React, {useState} from 'react'
import GovToolsPanel from '../govToolsPanel'
import InputWithLabel from '../../inputWithLabel'
import {getAnchor, getCertOfNewDRepReg, getDRepRegCert, getDRepRegWithAnchorCert} from '../../../utils/cslTools'
import {bytesToHex} from '../../../utils/utils'

const DRepRegistrationPanel = (props) => {
  const {wasm, onWaiting, onError, getters, setters, handleInput} = props

  const {handleAddingCertInTx} = setters
  const {currentDRepIdBech32, getCertBuilder} = getters

  const [dRepID, setDRepID] = useState(currentDRepIdBech32)
  const [depositAmount, setDepositAmount] = useState('2000000')
  const [metadataURL, setMetadatURL] = useState('')
  const [metadataHash, setMetadataHash] = useState('')

  const buildDRepRegistrationCert = () => {
    onWaiting(true)
    const certBuilder = getCertBuilder(wasm)
    try {
      const dRepCred = handleInput(dRepID)
      let dRepRegCert = null
      if (metadataURL.length > 0) {
        const dataHash =
          metadataHash.length > 0
            ? metadataHash
            : bytesToHex(new TextEncoder().encode('{"testField": "_test__message_"}'))
        const anchor = getAnchor(wasm, metadataURL, dataHash)
        dRepRegCert = getDRepRegWithAnchorCert(wasm, dRepCred, depositAmount, anchor)
      } else {
        dRepRegCert = getDRepRegCert(wasm, dRepCred, depositAmount)
      }
      certBuilder.add(getCertOfNewDRepReg(wasm, dRepRegCert))
      handleAddingCertInTx(certBuilder)
      onWaiting(false)
    } catch (error) {
      console.error(error)
      onWaiting(false)
      onError()
    }
  }

  const panelProps = {
    certLabel: 'voteDelegation',
    clickFunction: buildDRepRegistrationCert,
  }

  return (
    <GovToolsPanel {...panelProps}>
      <InputWithLabel
        inputName="DRep ID (Bech32 or Hex encoded)"
        inputValue={dRepID}
        onChangeFunction={(event) => {
          setDRepID(event.target.value)
        }}
      />
      <InputWithLabel
        inputName="DRep Registration Deposit Amount (lovelaces)"
        inputValue={depositAmount}
        onChangeFunction={(event) => {
          setDepositAmount(event.target.value)
        }}
      />
      <InputWithLabel
        inputName="Metadata URL (Optional)"
        inputValue={metadataURL}
        onChangeFunction={(event) => {
          setMetadatURL(event.target.value)
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
