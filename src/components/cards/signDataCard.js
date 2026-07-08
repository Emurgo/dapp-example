import logger from '../../utils/logger'
import React, {useState} from 'react'
import ApiCardWithModal from './apiCardWithModal'
import {Buffer} from 'buffer'
import {ModalWindowContent} from '../ui-constants'
import {getBech32AddressFromHex} from '../../utils/cslTools'
import SelectWithLabel from '../selectWithLabel'
import InputWithLabel from '../inputWithLabel'

const SignDataCard = ({api, onRawResponse, onResponse, onWaiting}) => {
  const [message, setMessage] = useState('')
  const [address, setAddress] = useState('')
  const [encodingType, setEncodingType] = useState('hex')

  const getAddress = async () => {
    // If user provided an address, use it directly
    if (address.trim()) {
      return address.trim()
    }
    // Otherwise, use the reward address as default
    try {
      const rewardAddresses = await api?.getRewardAddresses()
      const rewardHexAddress = rewardAddresses?.[0]
      if (!rewardHexAddress) {
        throw new Error('No reward address available — enter an address manually')
      }
      return getBech32AddressFromHex(rewardHexAddress)
    } catch (error) {
      throw error
    }
  }

  const getPayloadHex = (payload, encoding) => {
    if (encoding === 'hex') {
      // Remove '0x' prefix if present
      const hexString = payload.startsWith('0x') ? payload.substring(2) : payload
      const reg = /^[0-9A-Fa-f]+$/i
      if (reg.test(hexString)) {
        // Validate hex string length is even (required for proper byte conversion)
        if (hexString.length % 2 !== 0) {
          throw new Error(`!!!ERROR!!!\nHex string must have even length: "${payload}"`)
        }
        // Return the hex string directly (without 0x prefix) as wallet expects hex string
        return hexString.toLowerCase()
      } else {
        throw new Error(`!!!ERROR!!!\nIt is not a valid hex string: "${payload}"`)
      }
    }

    // Convert UTF-8 string to hex string
    return Buffer.from(payload, 'utf8').toString('hex')
  }

  const signDataClick = async () => {
    onWaiting(true)

    try {
      const address = await getAddress()
      const payloadHex = getPayloadHex(message, encodingType)
      
      // Log the inputs for debugging
      logger.log('SignData inputs:', { address, payloadHex, originalMessage: message, encodingType })
      
      const signDataResponse = await api?.signData(address, payloadHex)
      
      // Show raw response with inputs for debugging
      const debugInfo = {
        inputs: {
          address,
          payloadHex,
          originalMessage: message,
          encodingType
        },
        response: signDataResponse
      }
      const rawResponseString = JSON.stringify(debugInfo, null, 2)
      onRawResponse(rawResponseString)
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

  const encodingOptions = [
    {label: 'UTF-8', value: 'utf8'},
    {label: 'Hex', value: 'hex'},
  ]

  return (
    <ApiCardWithModal {...apiProps}>
      <div className={ModalWindowContent.contentPadding}>
        <InputWithLabel
          inputName="Address (optional - defaults to reward address)"
          inputValue={address}
          onChangeFunction={(event) => setAddress(event.target.value)}
          wrapperClassName=""
        />
        <SelectWithLabel
          selectName="Message Encoding"
          selectArray={encodingOptions}
          onChangeFunction={(event) => setEncodingType(event.target.value)}
          defaultValue={encodingType}
        />
        <InputWithLabel
          inputName="Message to sign"
          inputValue={message}
          onChangeFunction={(event) => setMessage(event.target.value)}
          placeholder={encodingType === 'hex' ? 'e.g., 0x48656c6c6f or 48656c6c6f' : 'e.g., Hello'}
        />
      </div>
    </ApiCardWithModal>
  )
}

export default SignDataCard
