import logger from '../../utils/logger'
import React, {useState} from 'react'
import ApiCardWithModal from './apiCardWithModal'
import {Buffer} from 'buffer'
import {ModalWindowContent} from '../ui-constants'
import InputWithLabel from '../inputWithLabel'

const Cip95SignDataCard = ({api, onRawResponse, onResponse, onWaiting}) => {
  const [message, setMessage] = useState('')
  const [addressOrDRep, setAddressOrDRep] = useState('')

  const getPayloadHex = (payload) => {
    if (payload.startsWith('0x')) {
      const reg = /^[0-9A-Fa-f]*$/g
      const remainingPart = payload.substring(2)
      if (reg.test(remainingPart)) {
        return Buffer.from(remainingPart, 'hex').toString('hex')
      } else {
        throw new Error(`!!!ERROR!!!\nIt is not a suitable payload: "${payload}"`)
      }
    }

    return Buffer.from(payload, 'utf8').toString('hex')
  }

  const signDataClick = async () => {
    onWaiting(true)
    try {
      const payloadHex = getPayloadHex(message)
      const signDataResponse = await api?.cip95.signData(addressOrDRep, payloadHex)
      onRawResponse('')
      onResponse(signDataResponse)
    } catch (error) {
      onRawResponse('')
      if (error.message) {
        onResponse(error.message, false)
      } else {
        onResponse(error)
      }
      logger.error(error)
    } finally {
      onWaiting(false)
    }
  }

  const apiProps = {
    buttonLabel: 'signData',
    clickFunction: signDataClick,
  }

  return (
    <ApiCardWithModal {...apiProps}>
      <div className={ModalWindowContent.contentPadding}>
        <InputWithLabel
          inputName="Address or DRepID (HEX)"
          inputValue={addressOrDRep}
          onChangeFunction={(event) => setAddressOrDRep(event.target.value)}
          wrapperClassName=""
        />
        <InputWithLabel
          inputName="Message"
          inputValue={message}
          onChangeFunction={(event) => setMessage(event.target.value)}
        />
      </div>
    </ApiCardWithModal>
  )
}

export default Cip95SignDataCard
