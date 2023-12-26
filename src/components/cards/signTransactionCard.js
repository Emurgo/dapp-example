import React, {useState} from 'react'
import {bytesToHex} from '../../utils/utils'
import {
  getAddressFromBytes,
  getLargestFirstMultiAsset,
  getSignedTransaction,
  getTransactionFromBytes,
  getTransactionWitnessSetFromBytes,
  getTxBuilder,
  getTransactionOutput,
  getWasmUtxos,
} from '../../utils/wasmTools'
import ApiCardWithModal from './apiCardWithModal'
import {CommonStyles, ModalWindowContent} from '../ui-constants'

const SignTransactionCard = ({api, wasm, onRawResponse, onResponse, onWaiting}) => {
  const defaultValue = {amount: '2000000', address: ''}
  const [signTransactionInput, setSignTransactionInput] = useState('')

  const buildTransaction = async (buildTransactionInput) => {
    const txBuilder = getTxBuilder(wasm)

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
    setSignTransactionInput(bytesToHex(wasmUnsignedTransaction.to_bytes()))
    return bytesToHex(wasmUnsignedTransaction.to_bytes())
  }

  const signTransactionClick = async () => {
    onWaiting(true)
    let txHex = signTransactionInput
    if (!txHex) {
      txHex = await buildTransaction(defaultValue)
    }
    api
      ?.signTx(txHex)
      .then((witnessHex) => {
        onWaiting(false)
        onRawResponse(witnessHex)
        const wasmUnsignedTransaction = getTransactionFromBytes(wasm, txHex)
        const wasmWitnessSet = getTransactionWitnessSetFromBytes(wasm, witnessHex)
        const wasmSignedTransaction = getSignedTransaction(wasm, wasmUnsignedTransaction, wasmWitnessSet)
        onResponse(bytesToHex(wasmSignedTransaction.to_bytes()), false)
      })
      .catch((e) => {
        onWaiting(false)
        onRawResponse('')
        onResponse(e)
        console.log(e)
      })
  }
  const apiProps = {
    buttonLabel: 'signTx',
    clickFunction: signTransactionClick,
  }

  return (
    <ApiCardWithModal {...apiProps}>
      <div className={ModalWindowContent.contentPadding}>
        <label htmlFor="txHex" className={ModalWindowContent.contentLabelStyle}>
          Tx Hex
        </label>
        <input
          type="text"
          id="txHex"
          className={CommonStyles.inputStyles}
          placeholder=""
          value={signTransactionInput}
          onChange={(event) => setSignTransactionInput(event.target.value)}
        />
      </div>
    </ApiCardWithModal>
  )
}

export default SignTransactionCard
