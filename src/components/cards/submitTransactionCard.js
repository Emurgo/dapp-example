import React, {useState} from 'react'
import ApiCardWithModal from './apiCardWithModal'
import {ModalWindowContent} from '../ui-constants'
import InputWithLabel from '../inputWithLabel'
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
        <InputWithLabel
          inputName="Signed Tx Hex"
          inputValue={submitTransactionInput}
          onChangeFunction={(event) => setSubmitTransactionInput(event.target.value)}
          wrapperClassName=""
        />
      </div>
    </ApiCardWithModal>
  )
}

export default SubmitTransactionCard
