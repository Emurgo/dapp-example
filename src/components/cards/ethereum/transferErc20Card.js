/* global BigInt */
import React, {useState} from 'react'
import ApiCardWithModal from '../apiCardWithModal'
import {ModalWindowContent, CommonStyles} from '../../ui-constants'
import {transferData} from '../../../utils/ethereumUtils'

const TransferErc20Card = ({accounts, onRawResponse, onResponse, onWaiting}) => {
  const [contractAddress, setContractAddress] = useState('')
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')

  const transferClick = async () => {
    if (!accounts || accounts.length === 0) {
      onResponse('No account connected')
      return
    }
    onWaiting(true)
    try {
      const amountWei = BigInt(amount).toString()
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: accounts[0],
            to: contractAddress,
            data: transferData(toAddress, amountWei),
          },
        ],
      })
      onRawResponse(txHash)
      onResponse({txHash, contract: contractAddress, from: accounts[0], to: toAddress, amount})
    } catch (e) {
      onRawResponse('')
      onResponse(e)
      console.error(e)
    } finally {
      onWaiting(false)
    }
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
        <div className="mb-3">
          <label htmlFor="transferContract" className={ModalWindowContent.contentLabelStyle}>
            Token Contract Address (0x...)
          </label>
          <input
            type="text"
            id="transferContract"
            className={CommonStyles.inputStyles}
            placeholder="0xTokenContractAddress"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="transferTo" className={ModalWindowContent.contentLabelStyle}>
            Recipient Address (0x...)
          </label>
          <input
            type="text"
            id="transferTo"
            className={CommonStyles.inputStyles}
            placeholder="0xRecipientAddress"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="transferAmount" className={ModalWindowContent.contentLabelStyle}>
            Amount (in token's smallest unit, e.g. wei for 18-decimal tokens)
          </label>
          <input
            type="text"
            id="transferAmount"
            className={CommonStyles.inputStyles}
            placeholder="1000000000000000000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>
    </ApiCardWithModal>
  )
}

export default TransferErc20Card
