import React, {useState} from 'react'
import InputWithLabel from '../../inputWithLabel'
import {
  getCommitteeHotAuth,
  getCertOfNewCommitteeHotAuth,
} from '../../../utils/cslTools'
import GovToolsPanel from '../govToolsPanel'

const AuthCCPanel = (props) => {
  const {onWaiting, onError, getters, setters, handleInputCreds} = props
  const {getCertBuilder} = getters
  const {handleAddingCertInTx} = setters

  const [ccColdInputValue, setCCColdCredInputValue] = useState('')
  const [ccHotInputValue, setCCHotCredInputValue] = useState('')

  const buildCCAuthCert = () => {
    onWaiting(true)

    // build CC auth cert
    const certBuilder = getCertBuilder()
    try {

      // cold credential
      const coldCred = handleInputCreds(ccColdInputValue)
      if (coldCred == null) {
        return null
      }
      
      // hot credential
      const hotCred = handleInputCreds(ccHotInputValue)
      if (hotCred == null) {
        return null
      }

      // Create cert object
      const committeeHotAuthCert = getCommitteeHotAuth(coldCred, hotCred)
      // add cert to certBuilder
      certBuilder.add(getCertOfNewCommitteeHotAuth(committeeHotAuthCert))
      // adding the cert to the certStorage
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
    certLabel: 'ccAuth',
    clickFunction: buildCCAuthCert,
  }

  return (
    <GovToolsPanel {...panelProps}>
      <InputWithLabel
        inputName="CC Cold Credential"
        helpText="Bech32 or Hex encoded"
        inputValue={ccColdInputValue}
        onChangeFunction={(event) => {
          setCCColdCredInputValue(event.target.value)
        }}
      />
      <InputWithLabel
        inputName="CC Hot Credential"
        helpText="Bech32 or Hex encoded"
        inputValue={ccHotInputValue}
        onChangeFunction={(event) => {
          setCCHotCredInputValue(event.target.value)
        }}
      />
    </GovToolsPanel>
  )
}

export default AuthCCPanel
