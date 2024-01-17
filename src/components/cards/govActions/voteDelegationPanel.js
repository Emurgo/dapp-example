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
  const {currentDRepIdBech32, currentRegPubStakeKey, currentUnregPubStakeKey, getCertBuilder} = getters
  const {handleAddingCertInTx} = setters

  const [target, setTarget] = useState(currentDRepIdBech32)
  const [stake, setStake] = useState('')

  const suitableStake = currentRegPubStakeKey.length > 0 ? currentRegPubStakeKey : currentUnregPubStakeKey

  const buildVoteDelegationCert = () => {
    onWaiting(true)

    // build vote cert
    const certBuilder = getCertBuilder(wasm)
    try {
      let targetDRep
      if (target.toUpperCase() === 'ABSTAIN') {
        targetDRep = getDRepAbstain(wasm)
      } else if (target.toUpperCase() === 'NO CONFIDENCE') {
        targetDRep = getDRepNoConfidence(wasm)
      } else {
        let tempTarget = target
        if (target.length === 0) {
          setTarget(currentDRepIdBech32)
          tempTarget = currentDRepIdBech32
        }
        const dRepKeyCred = handleInput(tempTarget)
        targetDRep = getDRepNewKeyHash(wasm, dRepKeyCred.to_keyhash())
      }

      let pubStake = stake
      if (stake.length === 0) {
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
        inputValue={target}
        onChangeFunction={(event) => {
          setTarget(event.target.value)
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

export default VoteDelegationPanel
