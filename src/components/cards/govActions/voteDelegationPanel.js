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
  const {dRepIdBech32, dRepIdInputValue, regPubStakeKey, unregPubStakeKey, getCertBuilder} = getters
  const {handleAddingCertInTx, setDRepIdInputValue} = setters

  const [stake, setStake] = useState('')

  const suitableStake = regPubStakeKey.length > 0 ? regPubStakeKey : unregPubStakeKey

  const buildVoteDelegationCert = () => {
    onWaiting(true)

    // build vote cert
    const certBuilder = getCertBuilder(wasm)
    try {
      let targetDRep
      if (dRepIdInputValue.toUpperCase() === 'ABSTAIN') {
        targetDRep = getDRepAbstain(wasm)
      } else if (dRepIdInputValue.toUpperCase() === 'NO CONFIDENCE') {
        targetDRep = getDRepNoConfidence(wasm)
      } else {
        let tempTarget = dRepIdInputValue
        if (dRepIdInputValue.length === 0) {
          setDRepIdInputValue(dRepIdBech32)
          tempTarget = dRepIdBech32
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

export default VoteDelegationPanel
