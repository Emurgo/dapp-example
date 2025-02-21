import React, {useState} from 'react'
import ApiCardWithModal from './apiCardWithModal'
import {ModalWindowContent, CommonStyles} from '../ui-constants'
import {getUtxoFromHex} from '../../utils/cslTools'

const GetUtxosCard = ({api, onRawResponse, onResponse, onWaiting}) => {
  const [getUtxosInput, setGetUtxosInput] = useState({amount: '', page: 0, limit: 10})

  const getUtxosClick = () => {
    onWaiting(true)
    api
      ?.getUtxos(getUtxosInput.amount, {page: getUtxosInput.page, limit: getUtxosInput.limit})
      .then((hexUtxos) => {
        onWaiting(false)
        onRawResponse(hexUtxos)
        let utxos = []
        for (const hexUtxo of hexUtxos) {
          const utxo = getUtxoFromHex(hexUtxo)
          utxos.push(utxo)
        }
        onResponse(utxos)
      })
      .catch((e) => {
        onWaiting(false)
        onRawResponse('')
        onResponse(e)
        console.log(e)
      })
  }

  const apiProps = {
    buttonLabel: 'getUtxos',
    clickFunction: getUtxosClick,
  }

  return (
    <ApiCardWithModal {...apiProps}>
      <div className={ModalWindowContent.contentPadding}>
        <label htmlFor="amount" className={ModalWindowContent.contentLabelStyle}>
          Amount (lovelaces)
        </label>
        <input
          type="number"
          min="0"
          id="amount"
          className={CommonStyles.inputStyles}
          placeholder=""
          value={getUtxosInput.amount}
          onChange={(event) => setGetUtxosInput({...getUtxosInput, amount: event.target.value})}
        />
      </div>
      <div className="grid gap-4 mb-3 md:grid-cols-2 px-2">
        <div>
          <label htmlFor="page" className={ModalWindowContent.contentLabelStyle}>
            Page
          </label>
          <input
            type="number"
            min="0"
            id="page"
            className={CommonStyles.inputStyles}
            placeholder=""
            value={getUtxosInput.page}
            onChange={(event) => setGetUtxosInput({...getUtxosInput, page: Number(event.target.value)})}
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
            placeholder=""
            value={getUtxosInput.limit}
            onChange={(event) => setGetUtxosInput({...getUtxosInput, limit: Number(event.target.value)})}
          />
        </div>
      </div>
    </ApiCardWithModal>
  )
}

export default GetUtxosCard
