import React, {useState} from 'react'
import ApiCardWithModal from './apiCardWithModal'
import {Buffer} from 'buffer'
import {CommonStyles, ModalWindowContent} from '../ui-constants'

const SignDataCard = ({api, wasm, onRawResponse, onResponse, onWaiting}) => {
  const [message, setMessage] = useState('')

  const getAddress = async () => {
    let address
    try {
      const usedAddresses = await api?.getUsedAddresses({page: 0, limit: 5})
      if (usedAddresses && usedAddresses.length > 0) {
        address = usedAddresses[0]
      } else {
        const unusedAddresses = await api?.getUnusedAddresses()
        if (unusedAddresses && unusedAddresses.length > 0) {
          address = unusedAddresses[0]
        }
      }
    } catch (error) {
      throw new Error(error)
    }

    return address
  }

  const getPayloadHex = (payload) => {
    if (payload.startsWith('0x')) {
      return Buffer.from(payload.replace('^0x', ''), 'hex').toString('hex')
    }

    return Buffer.from(payload, 'utf8').toString('hex')
  }

  const signDataClick = async () => {
    onWaiting(true)

    const address = await getAddress()
    const payloadHex = getPayloadHex(message)

    api
      ?.signData(address, payloadHex)
      .then((sig) => {
        onWaiting(false)
        onRawResponse('')
        onResponse(sig)
      })
      .catch((e) => {
        onWaiting(false)
        onRawResponse('')
        onResponse(e)
        console.error(e)
      })
  }

  const apiProps = {
    buttonLabel: 'signData',
    clickFunction: signDataClick,
  }

  return (
    <ApiCardWithModal {...apiProps}>
      <div className={ModalWindowContent.contentPadding}>
        <label htmlFor="signMessage" className={ModalWindowContent.contentLabelStyle}>
          Sign Data
        </label>
        <input
          type="text"
          id="signMessage"
          className={CommonStyles.inputStyles}
          placeholder=""
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </div>
    </ApiCardWithModal>
  )
}

export default SignDataCard
