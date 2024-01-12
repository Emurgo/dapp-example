import React, {useState} from 'react'
import InputWithLabel from '../inputWithLabel'
import {
  getCertOfNewVoteDelegation,
  getCslCredentialFromBech32,
  getCslCredentialFromHex,
  getDRepAbstain,
  getDRepNewKeyHash,
  getDRepNoConfidence,
  getVoteDelegCert,
} from '../../utils/cslTools'
import GovToolsPanel from './govToolsPanel'

const VoteDelegationPanel = ({api, wasm, onWaiting, onError, getters, setters}) => {
  const [currentTarget, setTarget] = useState('')
  const [currentStake, setStake] = useState('')
  const {currentDRepIdBech32, currentRegPubStakeKey, currentUnregPubStakeKey, getCertBuilder} = getters
  const {handleAddingCertInTx} = setters

  const suitableStake = currentRegPubStakeKey.length > 0 ? currentRegPubStakeKey : currentUnregPubStakeKey

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
        } else {
          setTarget(currentTarget)
        }
        const dRepKeyCred = handleInput(target)
        targetDRep = getDRepNewKeyHash(wasm, dRepKeyCred.to_keyhash())
      }

      let pubStake = currentStake
      if (currentStake.length === 0) {
        setStake(suitableStake)
        pubStake = suitableStake
      } else {
        setStake(currentStake)
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
        inputValue={currentDRepIdBech32}
        onChangeFunction={(event) => {
          setTarget(event.target.value)
        }}
      />
      <InputWithLabel
        inputName="Stake credential"
        inputValue={currentRegPubStakeKey.length > 0 ? currentRegPubStakeKey : currentUnregPubStakeKey}
        onChangeFunction={(event) => {
          setStake(event.target.value)
        }}
      />
    </GovToolsPanel>
  )
}

export default VoteDelegationPanel
