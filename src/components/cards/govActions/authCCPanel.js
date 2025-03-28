import React, {useState} from 'react'
import InputWithLabel from '../../inputWithLabel'
import {
  getCommitteeHotAuth,
  getCertOfNewCommitteeHotAuth,
} from '../../../utils/cslTools'
import GovToolsPanel from '../govToolsPanel'

const AuthCCPanel = (props) => {
  const {onWaiting, onError, getters, setters, handleInputCreds} = props
  const {ccColdCredValueInputValue, ccHotCredValueInputValue, getCertBuilder} = getters
  const {handleAddingCertInTx, setCCColdCredValue, setCCHotCredValue} = setters

  const buildCCAuthCert = () => {
    onWaiting(true)

    // build CC auth cert
    const certBuilder = getCertBuilder()
    try {

      // cold credential
      const coldCred = handleInputCreds(ccColdCredValueInputValue)
      if (coldCred == null) {
        return null
      }
      setCCColdCredValue(coldCred)
      
      // hot credential
      const hotCred = handleInputCreds(ccHotCredValueInputValue)
      if (hotCred == null) {
        return null
      }
      setCCHotCredValue(hotCred)

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
        inputValue={ccColdCredValueInputValue}
        onChangeFunction={(event) => {
          setCCColdCredValue(event.target.value)
        }}
      />
      <InputWithLabel
        inputName="CC Hot Credential"
        helpText="Bech32 or Hex encoded"
        inputValue={ccHotCredValueInputValue}
        onChangeFunction={(event) => {
          setCCHotCredValue(event.target.value)
        }}
      />
    </GovToolsPanel>
  )
}

export default AuthCCPanel
