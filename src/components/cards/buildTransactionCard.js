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
      <div className="px-4 pb-3">
        <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-300">
          Amount
        </label>
        <input
          type="number"
          min="1000000"
          id="amount"
          className="appearance-none border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
          placeholder=""
          value={buildTransactionInput.amount}
          onChange={(event) => setBuildTransactionInput({...buildTransactionInput, amount: event.target.value})}
        />
      </div>
      <div className="px-4 pb-3">
        <label htmlFor="receiverAddress" className="block mb-2 text-sm font-medium text-gray-300">
          Receiver address
        </label>
        <input
          type="text"
          id="receiverAddress"
          className="appearance-none border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
          placeholder=""
          value={buildTransactionInput.address}
          onChange={(event) => setBuildTransactionInput({...buildTransactionInput, address: event.target.value})}
        />
      </div>
    </ApiCardWithModal>
  )
}

export default BuildTransactionCard
