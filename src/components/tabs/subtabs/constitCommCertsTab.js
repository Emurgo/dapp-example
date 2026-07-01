import React from 'react'
import TabsComponent from '../tabsComponent'
import AuthCCPanel from '../../cards/govActions/authCCPanel'
import {getCslCredentialFromBech32, getCslCredentialFromHex} from '../../../utils/cslTools'

const ConstitCommCertsTab = ({api, onWaiting, onError, getters, setters}) => {
  const handleInputCreds = (input) => {
    try {
      return getCslCredentialFromHex(input)
    } catch (err1) {
      try {
        return getCslCredentialFromBech32(input)
      } catch (err2) {
        // Throw instead of returning null so the caller's try/catch handles cleanup
        // (onWaiting/onError), rather than feeding null into CSL and crashing
        // with the opaque `expected instance of Fe`.
        throw new Error(
          `Invalid credential — not valid Hex or Bech32: ${JSON.stringify(err1)}, ${JSON.stringify(err2)}`,
        )
      }
    }
  }

  const panelsProps = {
    api,
    onWaiting,
    onError,
    getters,
    setters,
    handleInputCreds,
  }

  const data = [
    {
      label: 'Authorize CC Hot Credential',
      value: 'authHotCred',
      children: <AuthCCPanel {...panelsProps} />,
    },
    {
      label: 'Resign CC Cold Credential',
      value: 'resignColdCredential',
      children: <></>,
    },
  ]

  return (
    <div className="mt-2">
      <TabsComponent tabsData={data} />
    </div>
  )
}

export default ConstitCommCertsTab
