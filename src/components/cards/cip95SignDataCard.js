import React, {useState} from 'react'
import ApiCardWithModal from './apiCardWithModal'
import {Buffer} from 'buffer'
import {CommonStyles, ModalWindowContent} from '../ui-constants'

const Cip95SignDataCard = ({api, wasm, onRawResponse, onResponse, onWaiting}) => {
  const [message, setMessage] = useState('')
  const [addressOrDRep, setAddressOrDRep] = useState('')

  const getPayloadHex = (payload) => {
    if (payload.startsWith('0x')) {
      return Buffer.from(payload.replace('^0x', ''), 'hex').toString('hex')
    }

    return Buffer.from(payload, 'utf8').toString('hex')
  }

  const signDataClick = async () => {
    onWaiting(true)

    const payloadHex = getPayloadHex(message)

    api?.cip95
      .signData(addressOrDRep, payloadHex)
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
        <div>
          <label htmlFor="addressOrDRepID" className={ModalWindowContent.contentLabelStyle}>
            Address or DRepID (HEX)
          </label>
          <input
            type="text"
            id="addressOrDRepID"
            className={CommonStyles.inputStyles}
            placeholder=""
            value={addressOrDRep}
            onChange={(event) => setAddressOrDRep(event.target.value)}
          />
        </div>
        <div className="mt-3">
          <label htmlFor="signMessage" className={ModalWindowContent.contentLabelStyle}>
            Message
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
      </div>
    </ApiCardWithModal>
  )
}

export default Cip95SignDataCard
