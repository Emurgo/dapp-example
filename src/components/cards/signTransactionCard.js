import React, {useState} from 'react'
import {bytesToHex, hexToBytes} from '../../utils/utils'
import {
  getAddressFromBytes,
  getFixedTxFromBytes,
  getLargestFirstMultiAsset,
  getTransactionWitnessSetFromBytes,
  getTxBuilder,
  getTransactionOutput,
  getCslUtxos,
  getAddressFromBech32,
} from '../../utils/cslTools'
import ApiCardWithModal from './apiCardWithModal'
import {CommonStyles, ModalWindowContent} from '../ui-constants'

const SignTransactionCard = ({api, onRawResponse, onResponse, onWaiting}) => {
  const defaultValue = {amount: '2000000', address: ''}
  const [signTransactionInput, setSignTransactionInput] = useState('')
  const [partialSign, setPartialSign] = useState(false)

  const buildTransaction = async (buildTransactionInput) => {
    const txBuilder = getTxBuilder()

    const changeAddress = await api?.getChangeAddress()
    const wasmChangeAddress = getAddressFromBytes(changeAddress)
    const wasmOutputAddress = buildTransactionInput.address
      ? getAddressFromBech32(buildTransactionInput.address)
      : wasmChangeAddress
    const wasmOutput = getTransactionOutput(wasmOutputAddress, buildTransactionInput)
    txBuilder.add_output(wasmOutput)

    const hexUtxos = await api?.getUtxos()

    const cslUtxos = getCslUtxos(hexUtxos)
    txBuilder.add_inputs_from(cslUtxos, getLargestFirstMultiAsset())
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
    console.log('[SignTransactionCard] Unsingned Tx:', txHex)
    api
      ?.signTx(txHex, partialSign)
      .then((witnessHex) => {
        onWaiting(false)
        onRawResponse(witnessHex)
        const signedTx = getFixedTxFromBytes(hexToBytes(txHex))
        const walletWitnessSet = getTransactionWitnessSetFromBytes(witnessHex)
        const walletVkeys = walletWitnessSet.vkeys()
        if (walletVkeys) {
          for (let i = 0; i < walletVkeys.len(); i++) {
            signedTx.add_vkey_witness(walletVkeys.get(i))
          }
        }
        onResponse(
          JSON.stringify({signedTx: signedTx.to_hex(), witness: witnessHex}, undefined, 2),
          false,
        )
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
          Unsigned Transaction Hex
        </label>
        <input
          type="text"
          id="txHex"
          className={CommonStyles.inputStyles}
          placeholder=""
          value={signTransactionInput}
          onChange={(event) => setSignTransactionInput(event.target.value)}
        />
        <label htmlFor="partialSign" className={ModalWindowContent.contentLabelStyle}>
          Partially Sign Transaction?
        </label>
        <div id="partialSign" className="flex gap-4 text-gray-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="partialSign"
              value="false"
              checked={partialSign === false}
              onChange={() => setPartialSign(false)}
            />
            false
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="partialSign"
              value="true"
              checked={partialSign === true}
              onChange={() => setPartialSign(true)}
            />
            true
          </label>
        </div>
      </div>
    </ApiCardWithModal>
  )
}

export default SignTransactionCard
