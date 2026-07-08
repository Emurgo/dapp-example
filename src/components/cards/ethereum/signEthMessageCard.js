import React, {useState} from 'react'
import ApiCardWithModal from '../apiCardWithModal'
import {ModalWindowContent, CommonStyles} from '../../ui-constants'
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
        <label htmlFor="ethSignMessage" className={ModalWindowContent.contentLabelStyle}>
          Message to sign
        </label>
        <input
          type="text"
          id="ethSignMessage"
          className={CommonStyles.inputStyles}
          placeholder="Hello, Ethereum!"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
    </ApiCardWithModal>
  )
}

export default SignEthMessageCard
