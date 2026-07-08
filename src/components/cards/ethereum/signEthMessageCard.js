import React, {useState} from 'react'
import ApiCardWithModal from '../apiCardWithModal'
import {ModalWindowContent} from '../../ui-constants'
import InputWithLabel from '../../inputWithLabel'
import runApiCall from '../../../utils/runApiCall'

const SignEthMessageCard = ({accounts, onRawResponse, onResponse, onWaiting}) => {
  const [message, setMessage] = useState('')

  const signMessageClick = () => {
    if (!accounts || accounts.length === 0) {
      onResponse('No account connected')
      return
    }
    return runApiCall(
      () => window.ethereum.request({method: 'personal_sign', params: [message, accounts[0]]}),
      {onRawResponse, onResponse, onWaiting},
      {parse: (signature) => ({account: accounts[0], message, signature})},
    )
  }

  return (
    <ApiCardWithModal buttonLabel="personal_sign" clickFunction={signMessageClick} btnDisabled={!message}>
      <div className={ModalWindowContent.contentPadding}>
        <InputWithLabel
          inputName="Message to sign"
          inputValue={message}
          onChangeFunction={(e) => setMessage(e.target.value)}
          placeholder="Hello, Ethereum!"
          wrapperClassName=""
        />
      </div>
    </ApiCardWithModal>
  )
}

export default SignEthMessageCard
