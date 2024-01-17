import React from 'react'
import TabsComponent from '../tabsComponent'
import VoteDelegationPanel from '../../cards/govActions/voteDelegationPanel'
import {getCslCredentialFromBech32, getCslCredentialFromHex} from '../../../utils/cslTools'
import DRepRegistrationPanel from '../../cards/govActions/dRepRegistrationPanel'
import DRepUpdatePanel from '../../cards/govActions/dRepUpdatePanel'

const GovBasicFunctionsTab = ({api, wasm, onWaiting, onError, getters, setters}) => {
  const handleInput = (input) => {
    try {
      return getCslCredentialFromHex(wasm, input)
    } catch (err1) {
      try {
        return getCslCredentialFromBech32(wasm, input)
      } catch (err2) {
        onWaiting(false)
        console.error(
          `Error in parsing credential, not Hex or Bech32: ${JSON.stringify(err1)}, ${JSON.stringify(err2)}`,
        )
        onError()
        return null
      }
    }
  }

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
          handleInput={handleInput}
        />
      ),
    },
    {
      label: 'DRep Registration',
      value: 'drepReg',
      children: (
        <DRepRegistrationPanel
          api={api}
          wasm={wasm}
          onWaiting={onWaiting}
          onError={onError}
          getters={getters}
          setters={setters}
          handleInput={handleInput}
        />
      ),
    },
    {
      label: 'DRep Update',
      value: 'drepUpdate',
      children: (
        <DRepUpdatePanel
          api={api}
          wasm={wasm}
          onWaiting={onWaiting}
          onError={onError}
          getters={getters}
          setters={setters}
          handleInput={handleInput}
        />
      ),
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
