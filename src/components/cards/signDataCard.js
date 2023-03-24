import React, {useState} from 'react'
import ApiCardWithModal from './apiCardWithModal'
import {Buffer} from 'buffer'

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
      <div className="px-4 pb-3">
        <label htmlFor="signMessage" className="block mb-2 text-sm font-medium text-gray-300">
          Sign Data
        </label>
        <input
          type="text"
          id="signMessage"
          className="appearance-none border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
          placeholder=""
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </div>
    </ApiCardWithModal>
  )
}

export default SignDataCard
