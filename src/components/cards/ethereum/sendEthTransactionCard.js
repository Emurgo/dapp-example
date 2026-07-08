import React, {useState} from 'react'
import ApiCardWithModal from '../apiCardWithModal'
import {ModalWindowContent} from '../../ui-constants'
import InputWithLabel from '../../inputWithLabel'
import {ethToHexWei} from '../../../utils/ethereumUtils'
import runApiCall from '../../../utils/runApiCall'

const SendEthTransactionCard = ({accounts, onRawResponse, onResponse, onWaiting}) => {
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')

  const sendTxClick = () => {
    if (!accounts || accounts.length === 0) {
      onResponse('No account connected')
      return
    }
    return runApiCall(
      () =>
        window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{from: accounts[0], to: toAddress, value: ethToHexWei(amount)}],
        }),
      {onRawResponse, onResponse, onWaiting},
      {parse: (txHash) => ({txHash, from: accounts[0], to: toAddress, amountEth: amount})},
    )
  }

  const isValid = toAddress.startsWith('0x') && toAddress.length === 42 && amount && parseFloat(amount) > 0

  return (
    <ApiCardWithModal buttonLabel="eth_sendTransaction" clickFunction={sendTxClick} btnDisabled={!isValid}>
      <div className={ModalWindowContent.contentPadding}>
        <InputWithLabel
          inputName="To Address (0x...)"
          inputValue={toAddress}
          onChangeFunction={(e) => setToAddress(e.target.value)}
          placeholder="0xRecipientAddress"
          wrapperClassName="mb-3"
        />
        <InputWithLabel
          inputName="Amount (ETH)"
          type="number"
          min="0"
          step="0.001"
          inputValue={amount}
          onChangeFunction={(e) => setAmount(e.target.value)}
          placeholder="0.001"
          wrapperClassName=""
        />
      </div>
    </ApiCardWithModal>
  )
}

export default SendEthTransactionCard
