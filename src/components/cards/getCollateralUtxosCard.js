import React, {useState} from 'react'
import ApiCardWithModal from './apiCardWithModal'
import {CommonStyles, ModalWindowContent} from '../ui-constants'
import {getAmountInHex, getUtxoFromHex} from '../../utils/cslTools'

const GetCollateralUtxosCard = ({api, wasm, onRawResponse, onResponse, onWaiting}) => {
  const [getCollateralUtxosInput, setGetCollateralUtxosInput] = useState('2000000')

  const amountInHex = getAmountInHex(wasm, getCollateralUtxosInput)

  const getCollateralUtxosClick = () => {
    onWaiting(true)
    api
      ?.getCollateral(amountInHex)
      .then((hexUtxos) => {
        onWaiting(false)
        onRawResponse(hexUtxos)
        let utxos = []
        for (const hexUtxo of hexUtxos) {
          const utxo = getUtxoFromHex(wasm, hexUtxo)
          utxos.push(utxo)
        }
        onResponse(utxos)
      })
      .catch((e) => {
        onWaiting(false)
        onRawResponse('')
        onResponse(e)
        console.log(e)
      })
  }

  const apiProps = {
    buttonLabel: 'getCollateral',
    clickFunction: getCollateralUtxosClick,
  }

  return (
    <ApiCardWithModal {...apiProps}>
      <div className={ModalWindowContent.contentPadding}>
        <label htmlFor="amount" className={ModalWindowContent.contentLabelStyle}>
          Amount
        </label>
        <input
          type="number"
          min="0"
          id="amount"
          className={CommonStyles.inputStyles}
          placeholder="2000000"
          value={getCollateralUtxosInput}
          onChange={(event) => setGetCollateralUtxosInput(event.target.value)}
        />
      </div>
    </ApiCardWithModal>
  )
}

export default GetCollateralUtxosCard
