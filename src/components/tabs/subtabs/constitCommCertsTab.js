import React from 'react'
import TabsComponent from '../tabsComponent'
import AuthCCPanel from '../../cards/govActions/authCCPanel'
import {parseCredential} from '../../../utils/cslTools'

const ConstitCommCertsTab = ({api, onWaiting, onError, getters, setters}) => {
  const handleInputCreds = parseCredential

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
