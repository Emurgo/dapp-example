import React, {useState} from 'react'
import {bytesToHex, hexToBytes, wasmMultiassetToJSONs} from '../../utils/utils'
import ApiCardWithModal from './apiCardWithModal'
import {CommonStyles, ModalWindowContent} from '../ui-constants'

const GetCollateralUtxosCard = ({api, wasm, onRawResponse, onResponse, onWaiting}) => {
  const [getCollateralUtxosInput, setGetCollateralUtxosInput] = useState('2000000')

  const getCollateralUtxosClick = () => {
    onWaiting(true)
    api
      ?.getCollateral(getCollateralUtxosInput)
      .then((hexUtxos) => {
        onWaiting(false)
        onRawResponse(hexUtxos)
        let utxos = []
        for (const element of hexUtxos) {
          const utxo = {}
          const wasmUtxo = wasm.TransactionUnspentOutput.from_bytes(hexToBytes(element))
          const output = wasmUtxo.output()
          const input = wasmUtxo.input()
          utxo.tx_hash = bytesToHex(input.transaction_id().to_bytes())
          utxo.tx_index = input.index()
          utxo.receiver = output.address().to_bech32()
          utxo.amount = output.amount().coin().to_str()
          utxo.asset = wasmMultiassetToJSONs(output.amount().multiasset())
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
