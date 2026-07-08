import React, {useState} from 'react'
import GovToolsPanel from '../govToolsPanel'
import InputWithLabel from '../../inputWithLabel'
import {
  getAnchor,
  getCertOfNewDRepUpdate,
  getDRepUpdateCert,
  getDRepUpdateWithAnchorCert,
} from '../../../utils/cslTools'
import {getRandomHex} from '../../../utils/helpFunctions'
import buildCert from '../../../utils/buildCert'

const DRepUpdatePanel = (props) => {
  const {onWaiting, onError, getters, setters, handleInputCreds} = props

  const {handleAddingCertInTx, setDRepIdInputValue} = setters
  const {dRepIdInputValue, getCertBuilder} = getters

  const [metadataURL, setMetadataURL] = useState('')
  const [metadataHash, setMetadataHash] = useState('')

  const buildDRepUpdateCert = () =>
    buildCert(getCertBuilder, {onWaiting, onError}, (certBuilder) => {
      const dRepCred = handleInputCreds(dRepIdInputValue)
      let dRepUpdateCert = null
      if (metadataURL.length > 0) {
        const dataHash = metadataHash.length > 0 ? metadataHash : getRandomHex(32)
        const anchor = getAnchor(metadataURL, dataHash)
        dRepUpdateCert = getDRepUpdateWithAnchorCert(dRepCred, anchor)
      } else {
        dRepUpdateCert = getDRepUpdateCert(dRepCred)
      }
      certBuilder.add(getCertOfNewDRepUpdate(dRepUpdateCert))
      handleAddingCertInTx(certBuilder)
    })

  const panelProps = {
    buttonName: 'Build Cert',
    certLabel: 'dRepUpdate',
    clickFunction: buildDRepUpdateCert,
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

export default DRepUpdatePanel
