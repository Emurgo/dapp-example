import React, {useState} from 'react'
import {bytesToHex} from '../../utils/utils'
import {
  getAddressFromBytes,
  getLargestFirstMultiAsset,
  getTxBuilder,
  getTransactionOutput,
  getWasmUtxos,
} from '../../utils/wasmTools'
import ApiCardWithModal from './apiCardWithModal'
import {ModalWindowContent, CommonStyles} from '../ui-constants'

const BuildTransactionCard = ({api, wasm, onRawResponse, onResponse, onWaiting}) => {
  const [buildTransactionInput, setBuildTransactionInput] = useState({amount: '2000000', address: ''})

  const buildTransactionClick = async () => {
    const txBuilder = getTxBuilder(wasm)

    try {
      onWaiting(true)
      const changeAddress = await api?.getChangeAddress()
      const wasmChangeAddress = getAddressFromBytes(wasm, changeAddress)
      const wasmOutputAddress = buildTransactionInput.address
        ? wasm.Address.from_bech32(buildTransactionInput.address)
        : wasmChangeAddress
      const wasmOutput = getTransactionOutput(wasm, wasmOutputAddress, buildTransactionInput)
      txBuilder.add_output(wasmOutput)

      const hexUtxos = await api?.getUtxos()

      const wasmUtxos = getWasmUtxos(wasm, hexUtxos)
      txBuilder.add_inputs_from(wasmUtxos, getLargestFirstMultiAsset(wasm))
      txBuilder.add_change_if_needed(wasmChangeAddress)

      const wasmUnsignedTransaction = txBuilder.build_tx()

      onWaiting(false)
      onRawResponse(bytesToHex(wasmUnsignedTransaction.to_bytes()))
      onResponse('', false)
    } catch (error) {
      onWaiting(false)
      onRawResponse('')
      onRawResponse(error)
    }
  }

  const apiProps = {
    buttonLabel: 'buildTx',
    clickFunction: buildTransactionClick,
    halfOpacity: true,
  }

  return (
    <ApiCardWithModal {...apiProps}>
      <div className={ModalWindowContent.contentPadding}>
        <div>
          <label htmlFor="amount" className={ModalWindowContent.contentLabelStyle}>
            Amount
          </label>
          <input
            type="number"
            min="1000000"
            id="amount"
            className={CommonStyles.inputStyles}
            placeholder=""
            value={buildTransactionInput.amount}
            onChange={(event) => setBuildTransactionInput({...buildTransactionInput, amount: event.target.value})}
          />
        </div>
        <div className="mt-3">
          <label htmlFor="receiverAddress" className={ModalWindowContent.contentLabelStyle}>
            Receiver address
          </label>
          <input
            type="text"
            id="receiverAddress"
            className={CommonStyles.inputStyles}
            placeholder=""
            value={buildTransactionInput.address}
            onChange={(event) => setBuildTransactionInput({...buildTransactionInput, address: event.target.value})}
          />
        </div>
      </div>
    </ApiCardWithModal>
  )
}

export default BuildTransactionCard
