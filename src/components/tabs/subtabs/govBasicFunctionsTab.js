import React from 'react'
import TabsComponent from '../tabsComponent'
import VoteDelegationPanel from '../../cards/govActions/voteDelegationPanel'
import {getCslCredentialFromBech32, getCslCredentialFromHex} from '../../../utils/cslTools'
import DRepRegistrationPanel from '../../cards/govActions/dRepRegistrationPanel'
import DRepUpdatePanel from '../../cards/govActions/dRepUpdatePanel'
import DRepRetirementPanel from '../../cards/govActions/dRepRetirementPanel'
import VotePanel from '../../cards/govActions/votePanel'
import RegisterStakeKeyPanel from '../../cards/govActions/regStakeKeyPanel'
import UnregisterStakeKeyPanel from '../../cards/govActions/unregStakeKeyPanel'

const GovBasicFunctionsTab = ({api, wasm, onWaiting, onError, getters, setters}) => {
  const handleInputCreds = (input) => {
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

  const panelsProps = {
    api,
    wasm,
    onWaiting,
    onError,
    getters,
    setters,
    handleInputCreds,
  }

  const data = [
    {
      label: 'Vote Delegation',
      value: 'voteDeleg',
      children: <VoteDelegationPanel {...panelsProps} />,
    },
    {
      label: 'DRep Registration',
      value: 'drepReg',
      children: <DRepRegistrationPanel {...panelsProps} />,
    },
    {
      label: 'DRep Update',
      value: 'drepUpdate',
      children: <DRepUpdatePanel {...panelsProps} />,
    },
    {
      label: 'DRep Retirement',
      value: 'drepRet',
      children: <DRepRetirementPanel {...panelsProps} />,
    },
    {
      label: 'Vote',
      value: 'vote',
      children: <VotePanel {...panelsProps} />,
    },
    {
      label: 'Register Stake Key',
      value: 'regStakeKey',
      children: <RegisterStakeKeyPanel {...panelsProps} />,
    },
    {
      label: 'Unregister Stake Key',
      value: 'unregStakeKey',
      children: <UnregisterStakeKeyPanel {...panelsProps} />,
    },
  ]

  return (
    <div className="mt-2">
      <TabsComponent tabsData={data} />
    </div>
  )
}

export default GovBasicFunctionsTab
