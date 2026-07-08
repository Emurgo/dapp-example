/* global BigInt */
import React, {useState} from 'react'
import ApiCardWithModal from '../apiCardWithModal'
import {ModalWindowContent} from '../../ui-constants'
import InputWithLabel from '../../inputWithLabel'
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
        <InputWithLabel
          inputName="Token Contract Address (0x...)"
          inputValue={contractAddress}
          onChangeFunction={(e) => setContractAddress(e.target.value)}
          placeholder="0xTokenContractAddress"
          wrapperClassName="mb-3"
        />
        <InputWithLabel
          inputName="Holder Address (optional, defaults to connected account)"
          inputValue={holderAddress}
          onChangeFunction={(e) => setHolderAddress(e.target.value)}
          placeholder="0xHolderAddress (optional)"
          wrapperClassName=""
        />
      </div>
    </ApiCardWithModal>
  )
}

export default GetErc20BalanceCard
