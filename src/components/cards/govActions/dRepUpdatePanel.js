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

const DRepUpdatePanel = (props) => {
  const {wasm, onWaiting, onError, getters, setters, handleInput} = props

  const {handleAddingCertInTx} = setters
  const {dRepIdBech32, getCertBuilder} = getters

  const [dRepID, setDRepID] = useState(dRepIdBech32)
  const [metadataURL, setMetadataURL] = useState('')
  const [metadataHash, setMetadataHash] = useState('')

  const buildDRepUpdateCert = () => {
    onWaiting(true)
    const certBuilder = getCertBuilder(wasm)
    try {
      const dRepCred = handleInput(dRepID)
      let dRepUpdateCert = null
      if (metadataURL.length > 0) {
        const dataHash = metadataHash.length > 0 ? metadataHash : getRandomHex(32)
        const anchor = getAnchor(wasm, metadataURL, dataHash)
        dRepUpdateCert = getDRepUpdateWithAnchorCert(wasm, dRepCred, anchor)
      } else {
        dRepUpdateCert = getDRepUpdateCert(wasm, dRepCred)
      }
      certBuilder.add(getCertOfNewDRepUpdate(wasm, dRepUpdateCert))
      handleAddingCertInTx(certBuilder)
      onWaiting(false)
    } catch (error) {
      console.error(error)
      onWaiting(false)
      onError()
    }
  }

  const panelProps = {
    certLabel: 'dRepUpdate',
    clickFunction: buildDRepUpdateCert,
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
