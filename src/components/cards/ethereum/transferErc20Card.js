/* global BigInt */
import React, {useState} from 'react'
import ApiCardWithModal from '../apiCardWithModal'
import {ModalWindowContent} from '../../ui-constants'
import InputWithLabel from '../../inputWithLabel'
import {transferData} from '../../../utils/ethereumUtils'
import runApiCall from '../../../utils/runApiCall'

const TransferErc20Card = ({accounts, onRawResponse, onResponse, onWaiting}) => {
  const [contractAddress, setContractAddress] = useState('')
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')

  const transferClick = () => {
    if (!accounts || accounts.length === 0) {
      onResponse('No account connected')
      return
    }
    return runApiCall(
      () =>
        window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{from: accounts[0], to: contractAddress, data: transferData(toAddress, BigInt(amount).toString())}],
        }),
      {onRawResponse, onResponse, onWaiting},
      {parse: (txHash) => ({txHash, contract: contractAddress, from: accounts[0], to: toAddress, amount})},
    )
  }

  const isValid =
    contractAddress.startsWith('0x') &&
    contractAddress.length === 42 &&
    toAddress.startsWith('0x') &&
    toAddress.length === 42 &&
    amount &&
    BigInt(amount || 0) > 0n

  return (
    <ApiCardWithModal buttonLabel="ERC-20 transfer" clickFunction={transferClick} btnDisabled={!isValid}>
      <div className={ModalWindowContent.contentPadding}>
        <InputWithLabel
          inputName="Token Contract Address (0x...)"
          inputValue={contractAddress}
          onChangeFunction={(e) => setContractAddress(e.target.value)}
          placeholder="0xTokenContractAddress"
          wrapperClassName="mb-3"
        />
        <InputWithLabel
          inputName="Recipient Address (0x...)"
          inputValue={toAddress}
          onChangeFunction={(e) => setToAddress(e.target.value)}
          placeholder="0xRecipientAddress"
          wrapperClassName="mb-3"
        />
        <InputWithLabel
          inputName="Amount (in token's smallest unit, e.g. wei for 18-decimal tokens)"
          inputValue={amount}
          onChangeFunction={(e) => setAmount(e.target.value)}
          placeholder="1000000000000000000"
          wrapperClassName=""
        />
      </div>
    </ApiCardWithModal>
  )
}

export default TransferErc20Card
