import React from 'react'
import TabsComponent from '../tabsComponent'

const ConstitCommCertsTab = () => {
  const data = [
    {
      label: 'Authorize CC Hot Credential',
      value: 'authHotCred',
      children: <></>,
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
