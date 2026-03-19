import React, {useState} from 'react'
import ApiCardWithModal from '../apiCardWithModal'
import {ModalWindowContent, CommonStyles} from '../../ui-constants'

const SignEthMessageCard = ({accounts, onRawResponse, onResponse, onWaiting}) => {
  const [message, setMessage] = useState('')

  const signMessageClick = async () => {
    if (!accounts || accounts.length === 0) {
      onResponse('No account connected')
      return
    }
    onWaiting(true)
    try {
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, accounts[0]],
      })
      onRawResponse(signature)
      onResponse({account: accounts[0], message, signature})
    } catch (e) {
      onRawResponse('')
      onResponse(e)
      console.error(e)
    } finally {
      onWaiting(false)
    }
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
