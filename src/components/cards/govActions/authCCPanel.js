import React, {useState} from 'react'
import InputWithLabel from '../../inputWithLabel'
import {
  getCertOfNewVoteDelegation,
  getDRepAbstain,
  getDRepNewKeyHash,
  getDRepNoConfidence,
  getVoteDelegCert,
} from '../../../utils/cslTools'
import GovToolsPanel from '../govToolsPanel'

const AuthCCPanel = (props) => {
  const {onWaiting, onError, getters, setters, handleInputCreds} = props
  const {dRepIdBech32, dRepIdInputValue, regPubStakeKey, unregPubStakeKey, getCertBuilder} = getters
  const {handleAddingCertInTx, setDRepIdInputValue} = setters

  const [stake, setStake] = useState('')

  const suitableStake = regPubStakeKey.length > 0 ? regPubStakeKey : unregPubStakeKey

  const buildVoteDelegationCert = () => {
    onWaiting(true)

    // build vote cert
    const certBuilder = getCertBuilder()
    try {
      let targetDRep
      if (dRepIdInputValue.toUpperCase() === 'ABSTAIN') {
        targetDRep = getDRepAbstain()
      } else if (dRepIdInputValue.toUpperCase() === 'NO CONFIDENCE') {
        targetDRep = getDRepNoConfidence()
      } else {
        let tempTarget = dRepIdInputValue
        if (dRepIdInputValue.length === 0) {
          setDRepIdInputValue(dRepIdBech32)
          tempTarget = dRepIdBech32
        }
        const dRepKeyCred = handleInputCreds(tempTarget)
        targetDRep = getDRepNewKeyHash(dRepKeyCred.to_keyhash())
      }

      let pubStake = stake
      if (stake.length === 0) {
        setStake(suitableStake)
        pubStake = suitableStake
      }
      const stakeCred = handleInputCreds(pubStake)
      if (stakeCred == null) {
        return null
      }
      // Create cert object
      const voteDelegationCert = getVoteDelegCert(stakeCred, targetDRep)
      // add cert to certBuilder
      certBuilder.add(getCertOfNewVoteDelegation(voteDelegationCert))
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
    certLabel: 'voteDelegation',
    clickFunction: buildVoteDelegationCert,
  }

  return (
    <GovToolsPanel {...panelProps}>
      <InputWithLabel
        inputName="Target of vote delegation"
        helpText="DRep ID | abstain | no confidence"
        inputValue={dRepIdInputValue}
        onChangeFunction={(event) => {
          setDRepIdInputValue(event.target.value)
        }}
      />
      <InputWithLabel
        inputName="Stake credential"
        inputValue={stake}
        onChangeFunction={(event) => {
          setStake(event.target.value)
        }}
      />
    </GovToolsPanel>
  )
}

export default AuthCCPanel
