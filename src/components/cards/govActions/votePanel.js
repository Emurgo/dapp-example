import {useState} from 'react'
import InputWithLabel from '../../inputWithLabel'
import GovToolsPanel from '../govToolsPanel'
import {
  getVoter,
  getGovActionId,
  getAnchor,
  getVotingProcedure,
  getVotingProcedureWithAnchor,
} from '../../../utils/cslTools'
import SelectWithLabel from '../../selectWithLabel'
import {getRandomHex} from '../../../utils/helpFunctions'

const VotePanel = (props) => {
  const {onWaiting, onError, getters, setters, handleDrepId} = props
  const {dRepIdInputValue, getVotingBuilder} = getters
  const {handleAddingVotesInTx, setDRepIdInputValue} = setters

  const availableVotingChoices = [
    {label: 'NO', value: 0},
    {label: 'YES', value: 1},
    {label: 'ABSTAIN', value: 2},
  ]

  const [voteGovActionTxHashInHex, setVoteGovActionTxHashInHex] = useState('')
  const [voteGovActionIndex, setVoteGovActionIndex] = useState('')
  const [votingChoice, setVotingChoice] = useState(0)
  const [metadataURL, setMetadataURL] = useState('')
  const [metadataHash, setMetadataHash] = useState('')

  const handleVoteChoiceChange = (event) => {
    setVotingChoice(event.target.value)
  }

  const buildVote = () => {
    onWaiting(true)
    const votingBuilder = getVotingBuilder()
    try {
      // Getting voter
      const dRepCreds = handleDrepId(dRepIdInputValue)
      const voter = getVoter(dRepCreds)
      // What is being voted on
      const govActionId = getGovActionId(voteGovActionTxHashInHex, voteGovActionIndex)
      // Voting choice
      let votingProcedure

      if (metadataURL.length > 0) {
        const dataHash = metadataHash.length > 0 ? metadataHash : getRandomHex(32)
        const anchor = getAnchor(metadataURL, dataHash)
        votingProcedure = getVotingProcedureWithAnchor(votingChoice, anchor)
      } else {
        votingProcedure = getVotingProcedure(votingChoice)
      }
      // Add vote to vote builder
      votingBuilder.add(voter, govActionId, votingProcedure)
      handleAddingVotesInTx(votingBuilder)
      onWaiting(false)
    } catch (error) {
      console.error(error)
      onWaiting(false)
      onError()
    }
  }

  const panelProps = {
    buttonName: 'Build Vote',
    certLabel: 'vote',
    clickFunction: buildVote,
  }

  return (
    <GovToolsPanel {...panelProps}>
      <InputWithLabel
        inputName="DRep ID"
        helpText="Bech32 or Hex encoded"
        inputValue={dRepIdInputValue}
        onChangeFunction={(event) => {
          setDRepIdInputValue(event.target.value)
        }}
      />
      <InputWithLabel
        inputName="Gov Action Tx Hash"
        inputValue={voteGovActionTxHashInHex}
        onChangeFunction={(event) => {
          setVoteGovActionTxHashInHex(event.target.value)
        }}
      />
      <InputWithLabel
        inputName="Gov Action Tx Vote Index"
        inputValue={voteGovActionIndex}
        onChangeFunction={(event) => {
          setVoteGovActionIndex(event.target.value)
        }}
      />
      <SelectWithLabel
        selectName="Vote Choice"
        selectArray={availableVotingChoices}
        onChangeFunction={handleVoteChoiceChange}
      />
      <InputWithLabel
        inputName="Metadata URL (Optional)"
        inputValue={metadataURL}
        onChangeFunction={(event) => {
          setMetadataURL(event.target.value)
        }}
      />
      <InputWithLabel
        inputName="Metadata Hash (Optional)"
        inputValue={metadataHash}
        onChangeFunction={(event) => {
          setMetadataHash(event.target.value)
        }}
      />
    </GovToolsPanel>
  )
}

export default VotePanel
