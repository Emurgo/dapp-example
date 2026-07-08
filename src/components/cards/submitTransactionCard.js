import React, {useState} from 'react'
import ApiCardWithModal from './apiCardWithModal'
import {CommonStyles, ModalWindowContent} from '../ui-constants'
import runApiCall from '../../utils/runApiCall'

const SubmitTransactionCard = ({api, onRawResponse, onResponse, onWaiting}) => {
  const [submitTransactionInput, setSubmitTransactionInput] = useState('')

  const submitTransactionClick = () =>
    runApiCall(() => api.submitTx(submitTransactionInput), {onRawResponse, onResponse, onWaiting}, {stringify: false})

  const apiProps = {
    buttonLabel: 'submitTx',
    clickFunction: submitTransactionClick,
  }

  return (
    <ApiCardWithModal {...apiProps}>
      <div className={ModalWindowContent.contentPadding}>
        <label htmlFor="txHex" className={ModalWindowContent.contentLabelStyle}>
          Signed Tx Hex
        </label>
        <input
          type="text"
          id="txHex"
          className={CommonStyles.inputStyles}
          placeholder=""
          value={submitTransactionInput}
          onChange={(event) => setSubmitTransactionInput(event.target.value)}
        />
      </div>
    </ApiCardWithModal>
  )
}

export default SubmitTransactionCard
