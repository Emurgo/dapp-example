import React, {useState} from 'react'
import VoteDelationCard from '../../cards/voteDelegation'
import {getCertificateBuilder} from '../../../utils/cslTools'

const Cip95AdditionalPart = ({api, wasm, onWaiting, onError, getters, setters}) => {
  const [currentCertsInTx, setCertInTx] = useState([])
  const [currentCertBuilder, setCertBuilder] = useState(null)

  const handleAddingCertInTx = (certBuilderWithCert) => {
    setCertBuilder(certBuilderWithCert)
    const certs = certBuilderWithCert.build()
    let certsInJson = []
    for (let i = 0; i < certs.len(); i++) {
      certsInJson.push(certs.get(i).to_json())
    }
    console.log('CertInTx', certsInJson)
    setCertInTx(certsInJson)
  }

  const getCertBuilder = (wasm) => {
    if (currentCertBuilder) {
      return currentCertBuilder
    }
    return getCertificateBuilder(wasm)
  }

  const newGetters = Object.assign(getters, {currentCertsInTx, getCertBuilder})
  const newSetters = Object.assign(setters, {handleAddingCertInTx})

  return (
    <div className="grid justify-items-stretch grid-cols-1 lg:grid-cols-5 gap-2">
      <div>
        <VoteDelationCard
          api={api}
          wasm={wasm}
          onWaiting={onWaiting}
          onError={onError}
          getters={newGetters}
          setters={newSetters}
        />
      </div>
    </div>
  )
}

export default Cip95AdditionalPart
