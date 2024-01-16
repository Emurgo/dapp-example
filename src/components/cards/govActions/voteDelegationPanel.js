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

const VoteDelegationPanel = (props) => {
  const {wasm, onWaiting, onError, getters, setters, handleInput} = props

  const [currentTarget, setTarget] = useState('')
  const [currentStake, setStake] = useState('')
  const {currentDRepIdBech32, currentRegPubStakeKey, currentUnregPubStakeKey, getCertBuilder} = getters
  const {handleAddingCertInTx} = setters

  const suitableStake = currentRegPubStakeKey.length > 0 ? currentRegPubStakeKey : currentUnregPubStakeKey

  const buildVoteDelegationCert = () => {
    onWaiting(true)

    // build vote cert
    const certBuilder = getCertBuilder(wasm)
    try {
      let targetDRep
      if (currentTarget.toUpperCase() === 'ABSTAIN') {
        targetDRep = getDRepAbstain(wasm)
      } else if (currentTarget.toUpperCase() === 'NO CONFIDENCE') {
        targetDRep = getDRepNoConfidence(wasm)
      } else {
        let target = currentTarget
        if (currentTarget.length === 0) {
          setTarget(currentDRepIdBech32)
          target = currentDRepIdBech32
        }
        const dRepKeyCred = handleInput(target)
        targetDRep = getDRepNewKeyHash(wasm, dRepKeyCred.to_keyhash())
      }

      let pubStake = currentStake
      if (currentStake.length === 0) {
        setStake(suitableStake)
        pubStake = suitableStake
      }
      const stakeCred = handleInput(pubStake)
      if (stakeCred == null) {
        return null
      }
      // Create cert object
      const voteDelegationCert = getVoteDelegCert(wasm, stakeCred, targetDRep)
      // add cert to certBuilder
      certBuilder.add(getCertOfNewVoteDelegation(wasm, voteDelegationCert))
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
    certLabel: 'voteDelegation',
    clickFunction: buildVoteDelegationCert,
  }

  return (
    <GovToolsPanel {...panelProps}>
      <InputWithLabel
        inputName="Target of vote delegation | abstain | no confidence"
        inputValue={currentTarget}
        onChangeFunction={(event) => {
          setTarget(event.target.value)
        }}
      />
      <InputWithLabel
        inputName="Stake credential"
        inputValue={currentStake}
        onChangeFunction={(event) => {
          setStake(event.target.value)
        }}
      />
    </GovToolsPanel>
  )
}

export default VoteDelegationPanel
