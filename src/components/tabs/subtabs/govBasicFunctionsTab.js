import React from 'react'
import TabsComponent from '../tabsComponent'
import VoteDelegationPanel from '../../cards/govActions/voteDelegationPanel'

const GovBasicFunctionsTab = ({api, wasm, onWaiting, onError, getters, setters}) => {
  const data = [
    {
      label: 'Vote Delegation',
      value: 'voteDeleg',
      children: (
        <VoteDelegationPanel
          api={api}
          wasm={wasm}
          onWaiting={onWaiting}
          onError={onError}
          getters={getters}
          setters={setters}
        />
      ),
    },
    {
      label: 'DRep Registration',
      value: 'drepReg',
      children: <></>,
    },
    {
      label: 'DRep Update',
      value: 'drepUpdate',
      children: <></>,
    },
    {
      label: 'DRep Retirement',
      value: 'drepRet',
      children: <></>,
    },
    {
      label: 'Vote',
      value: 'vote',
      children: <></>,
    },
    {
      label: 'Register Stake Key',
      value: 'regStakeKey',
      children: <></>,
    },
    {
      label: 'Unregister Stake Key',
      value: 'unregStakeKey',
      children: <></>,
    },
  ]

  return (
    <div className="mt-2">
      <TabsComponent tabsData={data} />
    </div>
  )
}

export default GovBasicFunctionsTab
