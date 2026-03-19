import React, {useState} from 'react'
import ApiCardWithModal from '../apiCardWithModal'
import {ModalWindowContent, CommonStyles} from '../../ui-constants'
import {ethToHexWei} from '../../../utils/ethereumUtils'

const SendEthTransactionCard = ({accounts, onRawResponse, onResponse, onWaiting}) => {
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')

  const sendTxClick = async () => {
    if (!accounts || accounts.length === 0) {
      onResponse('No account connected')
      return
    }
    onWaiting(true)
    try {
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: accounts[0],
            to: toAddress,
            value: ethToHexWei(amount),
          },
        ],
      })
      onRawResponse(txHash)
      onResponse({txHash, from: accounts[0], to: toAddress, amountEth: amount})
    } catch (e) {
      onRawResponse('')
      onResponse(e)
      console.error(e)
    } finally {
      onWaiting(false)
    }
  }

  const isValid = toAddress.startsWith('0x') && toAddress.length === 42 && amount && parseFloat(amount) > 0

  return (
    <ApiCardWithModal buttonLabel="eth_sendTransaction" clickFunction={sendTxClick} btnDisabled={!isValid}>
      <div className={ModalWindowContent.contentPadding}>
        <div className="mb-3">
          <label htmlFor="ethToAddress" className={ModalWindowContent.contentLabelStyle}>
            To Address (0x...)
          </label>
          <input
            type="text"
            id="ethToAddress"
            className={CommonStyles.inputStyles}
            placeholder="0xRecipientAddress"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="ethAmount" className={ModalWindowContent.contentLabelStyle}>
            Amount (ETH)
          </label>
          <input
            type="number"
            id="ethAmount"
            className={CommonStyles.inputStyles}
            placeholder="0.001"
            step="0.001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>
    </ApiCardWithModal>
  )
}

export default SendEthTransactionCard
