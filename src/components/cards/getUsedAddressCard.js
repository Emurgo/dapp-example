import React, {useState} from 'react'
import {hexArrayToBech32Addresses} from '../../utils/cslTools'
import ApiCardWithModal from './apiCardWithModal'
import InputWithLabel from '../inputWithLabel'
import runApiCall from '../../utils/runApiCall'

const GetUsedAddresses = ({api, onRawResponse, onResponse, onWaiting}) => {
  const [usedAddressInput, setUsedAddressInput] = useState({page: 0, limit: 5})

  const getUsedAddressesClick = () =>
    runApiCall(
      () => api.getUsedAddresses(usedAddressInput),
      {onRawResponse, onResponse, onWaiting},
      {
        parse: hexArrayToBech32Addresses,
      },
    )

  const apiProps = {
    buttonLabel: 'getUsedAddresses',
    clickFunction: getUsedAddressesClick,
  }

  return (
    <ApiCardWithModal {...apiProps}>
      <div className="grid gap-6 mb-6 md:grid-cols-2 px-2">
        <InputWithLabel
          inputName="Page"
          type="number"
          min="0"
          placeholder="0"
          inputValue={usedAddressInput.page}
          onChangeFunction={(event) => setUsedAddressInput({...usedAddressInput, page: Number(event.target.value)})}
          wrapperClassName=""
        />
        <InputWithLabel
          inputName="Limit"
          type="number"
          min="0"
          placeholder="5"
          inputValue={usedAddressInput.limit}
          onChangeFunction={(event) => setUsedAddressInput({...usedAddressInput, limit: Number(event.target.value)})}
          wrapperClassName=""
        />
      </div>
    </ApiCardWithModal>
  )
}

export default GetUsedAddresses
