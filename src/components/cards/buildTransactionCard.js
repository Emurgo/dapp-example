import React, {useState} from 'react'
import {bytesToHex} from '../../utils/utils'
import {
  getAddressFromBytes,
  getLargestFirstMultiAsset,
  getTxBuilder,
  getTransactionOutput,
  getCslUtxos,
  getAddressFromBech32,
} from '../../utils/cslTools'
import ApiCardWithModal from './apiCardWithModal'
import {ModalWindowContent, CommonStyles} from '../ui-constants'
import CheckboxWithLabel from '../checkboxWithLabel'

const BuildTransactionCard = ({api, onRawResponse, onResponse, onWaiting}) => {
  const [buildTransactionInput, setBuildTransactionInput] = useState({amount: '2000000', address: '', sendAll: false})

  const buildTransactionClick = async () => {
    const txBuilder = getTxBuilder()

    try {
      onWaiting(true)
      let wasmChangeAddress
      let isSendAll = buildTransactionInput.sendAll
      if (isSendAll) {
        if (!buildTransactionInput.address) {
          alert('Receiver address is required')
          throw new Error('Receiver address is required')
        }
      } else {
        const changeAddress = await api?.getChangeAddress()
        wasmChangeAddress = getAddressFromBytes(changeAddress)
      }
      const wasmOutputAddress = buildTransactionInput.address
        ? getAddressFromBech32(buildTransactionInput.address)
        : wasmChangeAddress

      const hexUtxos = await api?.getUtxos()
      const wasmUtxos = getCslUtxos(hexUtxos)

      if (isSendAll) {
        for (let i = 0; i < wasmUtxos.len(); i++) {
          const wasmUtxo = wasmUtxos.get(i)
          const output = wasmUtxo.output()
          txBuilder.add_regular_input(
            output.address(),
            wasmUtxo.input(),
            output.amount(),
          )
        }

        // Sending everything to the receiver
        txBuilder.add_change_if_needed(wasmOutputAddress)
      } else {
        const wasmOutput = getTransactionOutput(wasmOutputAddress, buildTransactionInput)
        txBuilder.add_output(wasmOutput)

        txBuilder.add_inputs_from(wasmUtxos, getLargestFirstMultiAsset())
        txBuilder.add_change_if_needed(wasmChangeAddress)
      }

      const wasmUnsignedTransaction = txBuilder.build_tx()

      onRawResponse(bytesToHex(wasmUnsignedTransaction.to_bytes()))
      onResponse('', false)
    } catch (error) {
      onRawResponse('')
      onResponse(error)
    } finally {
      onWaiting(false)
    }
  }

  const apiProps = {
    buttonLabel: 'buildTx',
    clickFunction: buildTransactionClick,
    halfOpacity: true,
  }

  const isAmountInputDisabled = buildTransactionInput.sendAll

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
            className={isAmountInputDisabled ? CommonStyles.inputStylesDisabled : CommonStyles.inputStyles}
            placeholder=""
            value={buildTransactionInput.amount}
            onChange={(event) => setBuildTransactionInput({...buildTransactionInput, amount: event.target.value})}
            disabled={isAmountInputDisabled}
          />
        </div>
        <CheckboxWithLabel
          currentState={buildTransactionInput.sendAll}
          onChangeFunc={(event) => {
            setBuildTransactionInput({
              ...buildTransactionInput,
              amount: '',
              sendAll: event.target.checked,
            })
          }}
          name="sendAll"
          labelText="Send all (no change)"
        />
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
