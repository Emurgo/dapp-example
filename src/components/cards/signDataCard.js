import React, {useState} from 'react'
import ApiCardWithModal from './apiCardWithModal'
import {Buffer} from 'buffer'
import {CommonStyles, ModalWindowContent} from '../ui-constants'
import {getBech32AddressFromHex} from '../../utils/cslTools'

const SignDataCard = ({api, onRawResponse, onResponse, onWaiting}) => {
  const [message, setMessage] = useState('')

  const getAddress = async () => {
    try {
      const rewardHexAddress = (await api?.getRewardAddresses())[0]
      return getBech32AddressFromHex(rewardHexAddress)
    } catch (error) {
      throw new Error(error)
    }
  }

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
      const address = await getAddress()
      const payloadHex = getPayloadHex(message)
      const signDataResponse = await api?.signData(address, payloadHex)
      onRawResponse('')
      onResponse(signDataResponse)
    } catch (error) {
      onRawResponse('')
      if (error.message) {
        onResponse(error.message, false)
      } else {
        onResponse(error)
      }
      console.error(error)
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
