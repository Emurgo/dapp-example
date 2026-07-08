/* global BigInt */
import React, {useState} from 'react'
import ApiCardWithModal from '../apiCardWithModal'
import {ModalWindowContent, CommonStyles} from '../../ui-constants'
import {balanceOfData} from '../../../utils/ethereumUtils'
import runApiCall from '../../../utils/runApiCall'

const GetErc20BalanceCard = ({accounts, onRawResponse, onResponse, onWaiting}) => {
  const [contractAddress, setContractAddress] = useState('')
  const [holderAddress, setHolderAddress] = useState('')

  const getBalanceClick = () => {
    const holder = holderAddress || (accounts && accounts[0])
    if (!holder) {
      onResponse('No address to check')
      return
    }
    return runApiCall(
      () =>
        window.ethereum.request({
          method: 'eth_call',
          params: [{to: contractAddress, data: balanceOfData(holder)}, 'latest'],
        }),
      {onRawResponse, onResponse, onWaiting},
      // result is a 32-byte hex; parse as BigInt
      {parse: (result) => ({contract: contractAddress, holder, rawHex: result, balance: BigInt(result).toString()})},
    )
  }

  const isValid = contractAddress.startsWith('0x') && contractAddress.length === 42

  return (
    <ApiCardWithModal buttonLabel="ERC-20 balanceOf" clickFunction={getBalanceClick} btnDisabled={!isValid}>
      <div className={ModalWindowContent.contentPadding}>
        <div className="mb-3">
          <label htmlFor="erc20Contract" className={ModalWindowContent.contentLabelStyle}>
            Token Contract Address (0x...)
          </label>
          <input
            type="text"
            id="erc20Contract"
            className={CommonStyles.inputStyles}
            placeholder="0xTokenContractAddress"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="erc20Holder" className={ModalWindowContent.contentLabelStyle}>
            Holder Address (optional, defaults to connected account)
          </label>
          <input
            type="text"
            id="erc20Holder"
            className={CommonStyles.inputStyles}
            placeholder="0xHolderAddress (optional)"
            value={holderAddress}
            onChange={(e) => setHolderAddress(e.target.value)}
          />
        </div>
      </div>
    </ApiCardWithModal>
  )
}

export default GetErc20BalanceCard
