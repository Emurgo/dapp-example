import React, {useState} from 'react'
import {getCertificateBuilder} from '../../../utils/cslTools'
import TabsComponent from '../tabsComponent'
import GovBasicFunctionsTab from './govBasicFunctionsTab'
import GovActionsTab from './govActionsTab'
import ConstitCommCertsTab from './constitCommCertsTab'

const Cip95AdditionalPart = ({api, wasm, onWaiting, onError, getters, setters}) => {
  const [certsInTx, setCertsInTx] = useState([])
  const [certBuilder, setCertBuilder] = useState(null)

  const handleAddingCertInTx = (certBuilderWithCert) => {
    setCertBuilder(certBuilderWithCert)
    const certs = certBuilderWithCert.build()
    let certsInJson = []
    for (let i = 0; i < certs.len(); i++) {
      certsInJson.push(certs.get(i).to_json())
    }
    console.log('CertInTx', certsInJson)
    setCertsInTx(certsInJson)
  }

  const getCertBuilder = (wasm) => {
    if (certBuilder) {
      return certBuilder
    }
    return getCertificateBuilder(wasm)
  }

  const newGetters = Object.assign(getters, {certsInTx, getCertBuilder})
  const newSetters = Object.assign(setters, {handleAddingCertInTx})

  const data = [
    {
      label: 'Governance Basic Functions',
      value: 'govBasicFuncs',
      children: (
        <GovBasicFunctionsTab
          api={api}
          wasm={wasm}
          onWaiting={onWaiting}
          onError={onError}
          getters={newGetters}
          setters={newSetters}
        />
      ),
    },
    {
      label: 'Governance Actions',
      value: 'govActions',
      children: <GovActionsTab />,
    },
    {
      label: 'Constitutional Commitee Certs',
      value: 'ccCerts',
      children: <ConstitCommCertsTab />,
    },
  ]
  return (
    <div className="block rounded-lg border bg-gray-900 border-gray-700">
      <TabsComponent tabsData={data} />
    </div>
  )
}

export default Cip95AdditionalPart
