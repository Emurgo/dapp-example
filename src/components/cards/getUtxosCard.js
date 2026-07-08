import React, {useState} from 'react'
import ApiCardWithModal from './apiCardWithModal'
import {ModalWindowContent} from '../ui-constants'
import InputWithLabel from '../inputWithLabel'
import {hexArrayToUtxos} from '../../utils/cslTools'
import runApiCall from '../../utils/runApiCall'

const GetUtxosCard = ({api, onRawResponse, onResponse, onWaiting}) => {
  const [getUtxosInput, setGetUtxosInput] = useState({amount: '', page: 0, limit: 10})

  const getUtxosClick = () =>
    runApiCall(
      () => api.getUtxos(getUtxosInput.amount, {page: getUtxosInput.page, limit: getUtxosInput.limit}),
      {onRawResponse, onResponse, onWaiting},
      {parse: hexArrayToUtxos},
    )

  const apiProps = {
    buttonLabel: 'getUtxos',
    clickFunction: getUtxosClick,
  }

  return (
    <ApiCardWithModal {...apiProps}>
      <div className={ModalWindowContent.contentPadding}>
        <InputWithLabel
          inputName="Amount (lovelaces)"
          type="number"
          min="0"
          inputValue={getUtxosInput.amount}
          onChangeFunction={(event) => setGetUtxosInput({...getUtxosInput, amount: event.target.value})}
          wrapperClassName=""
        />
      </div>
      <div className="grid gap-4 mb-3 md:grid-cols-2 px-2">
        <InputWithLabel
          inputName="Page"
          type="number"
          min="0"
          inputValue={getUtxosInput.page}
          onChangeFunction={(event) => setGetUtxosInput({...getUtxosInput, page: Number(event.target.value)})}
          wrapperClassName=""
        />
        <InputWithLabel
          inputName="Limit"
          type="number"
          min="0"
          inputValue={getUtxosInput.limit}
          onChangeFunction={(event) => setGetUtxosInput({...getUtxosInput, limit: Number(event.target.value)})}
          wrapperClassName=""
        />
      </div>
    </ApiCardWithModal>
  )
}

export default GetUtxosCard
