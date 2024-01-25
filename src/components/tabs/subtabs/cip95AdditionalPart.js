import React, {useState} from 'react'
import {getCertificateBuilder, getCslVotingBuilder} from '../../../utils/cslTools'
import TabsComponent from '../tabsComponent'
import GovBasicFunctionsTab from './govBasicFunctionsTab'
import GovActionsTab from './govActionsTab'
import ConstitCommCertsTab from './constitCommCertsTab'
import Cip95BuildSignSubmitCard from '../../cards/cip95BuildSignSubmitCard'

const Cip95AdditionalPart = ({api, wasm, onWaiting, onError, getters, setters}) => {
  const [certsInTx, setCertsInTx] = useState([])
  const [votesInTx, setVotesInTx] = useState([])
  const [certBuilder, setCertBuilder] = useState(null)
  const [votingBuilder, setVotingBuilder] = useState(null)

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

  const handleAddingVotesInTx = (votingBuilderWithVote) => {
    setVotingBuilder(votingBuilderWithVote)
    setVotesInTx(votingBuilderWithVote.build().to_json())
    console.log('Votes in Tx', votesInTx)
  }

  const getCertBuilder = (wasm) => {
    if (certBuilder) {
      return certBuilder
    }
    return getCertificateBuilder(wasm)
  }

  const getVotingBuilder = (wasm) => {
    if (votingBuilder) {
      return votingBuilder
    }
    return getCslVotingBuilder(wasm)
  }

  const newGetters = Object.assign(getters, {
    certsInTx,
    votesInTx,
    getCertBuilder,
    getVotingBuilder,
    certBuilder,
    votingBuilder,
  })
  const newSetters = Object.assign(setters, {
    handleAddingCertInTx,
    handleAddingVotesInTx,
    setCertBuilder,
    setVotingBuilder,
  })

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
    <>
      <Cip95BuildSignSubmitCard
        api={api}
        wasm={wasm}
        onWaiting={onWaiting}
        onError={onError}
        getters={newGetters}
        setters={newSetters}
      />
      <div className="block rounded-lg border mt-5 bg-gray-900 border-gray-700">
        <TabsComponent tabsData={data} />
      </div>
    </>
  )
}

export default Cip95AdditionalPart
