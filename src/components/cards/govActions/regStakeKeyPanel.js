import logger from '../../../utils/logger'
import React, {useState} from 'react'
import CheckboxWithLabel from '../../checkboxWithLabel'
import InputWithLabel from '../../inputWithLabel'
import GovToolsPanel from '../govToolsPanel'
import {protocolParams} from '../../../utils/networkConfig'
import {getCertOfNewStakeReg, getStakeKeyRegCert, getStakeKeyRegCertWithCoin} from '../../../utils/cslTools'
import buildCert from '../../../utils/buildCert'

const RegisterStakeKeyPanel = (props) => {
  const {onWaiting, onError, getters, setters, handleInputCreds} = props

  const {getCertBuilder} = getters
  const {handleAddingCertInTx} = setters

  const [stakeKeyHash, setStakeKeyHash] = useState('')
  const [stakeDepositAmount, setStakeDepositAmount] = useState(protocolParams.keyDeposit)
  const [useConway, setUseConway] = useState(false)

  const handleUseConwayCert = () => {
    setUseConway(!useConway)
    logger.debug(`[dApp][RegisterStakeKeyPanel] use Conway Stake Registration Certificate is set: ${!useConway}`)
  }

  const buildRegStakeKey = () =>
    buildCert(getCertBuilder, {onWaiting, onError}, (certBuilder) => {
      // building StakeKeyRegCert
      const stakeCred = handleInputCreds(stakeKeyHash)
      const stakeKeyRegCert = useConway
        ? getStakeKeyRegCertWithCoin(stakeCred, stakeDepositAmount)
        : getStakeKeyRegCert(stakeCred)
      certBuilder.add(getCertOfNewStakeReg(stakeKeyRegCert))
      handleAddingCertInTx(certBuilder)
    })

  const panelProps = {
    buttonName: 'Build Cert',
    certLabel: 'regStakeKey',
    clickFunction: buildRegStakeKey,
  }

  return (
    <GovToolsPanel {...panelProps}>
      <CheckboxWithLabel
        currentState={useConway}
        onChangeFunc={handleUseConwayCert}
        name="useNewConwayStakeRegCert"
        labelText="Use the new Conway Stake Registration Certificate (with coin)"
      />
      <InputWithLabel
        inputName="Stake Key Hash"
        inputValue={stakeKeyHash}
        onChangeFunction={(event) => {
          setStakeKeyHash(event.target.value)
        }}
      />
      <InputWithLabel
        inputName="Stake Key Deposit Amount (lovelaces)"
        helpText="This should align with current protocol parameters"
        inputValue={stakeDepositAmount}
        onChangeFunction={(event) => {
          setStakeDepositAmount(event.target.value)
        }}
      />
    </GovToolsPanel>
  )
}

export default RegisterStakeKeyPanel
