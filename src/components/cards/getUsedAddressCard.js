import React, {useState} from 'react'
import {getBech32AddressFromHex} from '../../utils/cslTools'
import ApiCardWithModal from './apiCardWithModal'
import {ModalWindowContent, CommonStyles} from '../ui-constants'

const GetUsedAddresses = ({api, onRawResponse, onResponse, onWaiting}) => {
  const [usedAddressInput, setUsedAddressInput] = useState({page: 0, limit: 5})

  const getUsedAddressesClick = () => {
    onWaiting(true)
    api
      ?.getUsedAddresses(usedAddressInput)
      .then((hexAddresses) => {
        onWaiting(false)
        onRawResponse(hexAddresses)
        const addresses = []
        for (const hexAddr of hexAddresses) {
          addresses.push(getBech32AddressFromHex(hexAddr))
        }
        onResponse(addresses)
      })
      .catch((e) => {
        onWaiting(false)
        onRawResponse('')
        onResponse(e)
        console.log(e)
      })
  }

  const apiProps = {
    buttonLabel: 'getUsedAddresses',
    clickFunction: getUsedAddressesClick,
  }

  return (
    <ApiCardWithModal {...apiProps}>
      <div className="grid gap-6 mb-6 md:grid-cols-2 px-2">
        <div>
          <label htmlFor="page" className={ModalWindowContent.contentLabelStyle}>
            Page
          </label>
          <input
            type="number"
            min="0"
            id="page"
            className={CommonStyles.inputStyles}
            placeholder="0"
            value={usedAddressInput.page}
            onChange={(event) => setUsedAddressInput({...usedAddressInput, page: Number(event.target.value)})}
          />
        </div>
        <div>
          <label htmlFor="limit" className={ModalWindowContent.contentLabelStyle}>
            Limit
          </label>
          <input
            type="number"
            min="0"
            id="limit"
            className={CommonStyles.inputStyles}
            placeholder="5"
            value={usedAddressInput.limit}
            onChange={(event) => setUsedAddressInput({...usedAddressInput, limit: Number(event.target.value)})}
          />
        </div>
      </div>
    </ApiCardWithModal>
  )
}

export default GetUsedAddresses
