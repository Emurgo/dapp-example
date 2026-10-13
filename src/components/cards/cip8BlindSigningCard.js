import logger from '../../utils/logger'
import React, {useState} from 'react'
import ApiCardWithModal from './apiCardWithModal'
import {ModalWindowContent} from '../ui-constants'
import InputWithLabel from '../inputWithLabel'

const Cip8BlindSigningCard = ({api, onRawResponse, onResponse, onWaiting}) => {
  const [cborHex, setCborHex] = useState('')

  const blindSignClick = async () => {
    onWaiting(true)
    try {
      if (!cborHex.trim()) {
        throw new Error('CBOR hex is required')
      }
      logger.log('[Cip8BlindSigningCard] Signing CBOR blindly:', cborHex)
      const witnessHex = await api?.signTx(cborHex.trim(), true)
      onRawResponse(witnessHex)
      onResponse(JSON.stringify({witness: witnessHex}, undefined, 2), false)
    } catch (e) {
      onRawResponse('')
      if (e.message) {
        onResponse(e.message, false)
      } else {
        onResponse(e)
      }
      logger.error(e)
    } finally {
      onWaiting(false)
    }
  }

  const apiProps = {
    buttonLabel: 'CIP-8 Blind Sign',
    clickFunction: blindSignClick,
    btnDisabled: !cborHex.trim(),
  }

  return (
    <ApiCardWithModal {...apiProps}>
      <div className={ModalWindowContent.contentPadding}>
        <InputWithLabel
          inputName="Transaction CBOR Hex"
          inputValue={cborHex}
          onChangeFunction={(event) => setCborHex(event.target.value)}
          placeholder="Paste raw transaction CBOR hex here"
          wrapperClassName=""
        />
      </div>
    </ApiCardWithModal>
  )
}

export default Cip8BlindSigningCard
