import React from 'react'
import {
  getAddressFromBech32,
  getCslUtxos,
  getLargestFirstMultiAsset,
  getTransactionFromBytes,
  getTransactionOutput,
  getTransactionWitnessSetFromBytes,
  getTxBuilder,
  strToBigNum,
  getSignedTransaction,
} from '../../utils/cslTools'
import {bytesToHex} from '../../utils/utils'

const Cip95BuildSignSubmitCard = (props) => {
  const {api, wasm, onWaiting, onError, getters, setters} = props
  const {setCertBuilder, setVotingBuilder} = setters
  const {certBuilder, votingBuilder, changeAddress, usedAddress, totalRefunds, hexUtxos} = getters

  const buildSignSubmit = () => {
    onWaiting(true)
    try {
      // build Tx
      const txBuilder = getTxBuilder(wasm)
      // adding certs, votes to the tx
      if (certBuilder) {
        txBuilder.set_certs_builder(certBuilder)
        setCertBuilder(null)
      }
      if (votingBuilder) {
        txBuilder.set_voting_builder(votingBuilder)
        setVotingBuilder(null)
      }
      // gov actions will be here in future

      // Set output and change addresses to those of our wallet
      const shelleyOutputAddress = getAddressFromBech32(wasm, usedAddress)
      const shelleyChangeAddress = getAddressFromBech32(wasm, changeAddress)

      // Add output of 1 ADA plus total needed for refunds
      let outputValue = strToBigNum(wasm, '1000000')
      if (totalRefunds.length > 0) {
        outputValue = outputValue.checked_add(strToBigNum(wasm, totalRefunds))
      }

      txBuilder.add_output(getTransactionOutput(wasm, shelleyOutputAddress, outputValue))
      // Find the available UTxOs in the wallet and use them as Inputs for the transaction
      const wasmUtxos = getCslUtxos(wasm, hexUtxos)
      txBuilder.add_inputs_from(wasmUtxos, getLargestFirstMultiAsset(wasm))
      // Set change address, incase too much ADA provided for fee
      txBuilder.add_change_if_needed(shelleyChangeAddress)
      const wasmUnsignedTransaction = txBuilder.build_tx()
      // sign Tx
      const unsignedTxHex = bytesToHex(wasmUnsignedTransaction.to_bytes())

      api
        .signTx(unsignedTxHex)
        .then((witnessHex) => {
          const wasmUnsignedTransaction = getTransactionFromBytes(wasm, unsignedTxHex)
          const wasmWitnessSet = getTransactionWitnessSetFromBytes(wasm, witnessHex)
          const wasmSignedTransaction = getSignedTransaction(wasm, wasmUnsignedTransaction, wasmWitnessSet)
          const signedTxHex = bytesToHex(wasmSignedTransaction.to_bytes())

          // submit tx
          api
            .submitTx(signedTxHex)
            .then((txId) => {
              onWaiting(false)
              console.log('The transaction is sent:', txId)
            })
            .catch((e) => {
              onWaiting(false)
              console.log(e)
            })
        })
        .catch((e) => {
          onWaiting(false)
          console.log(e)
        })

      onWaiting(false)
    } catch (e) {
      console.error(e)
      onError()
      onWaiting(false)
    }
  }

  return (
    <div className="flex">
      <div className="flex-auto mt-5">
        <button
          className="w-full py-1 rounded-md text-xl text-white font-semibold bg-green-700 hover:bg-green-800 active:bg-green-500"
          onClick={buildSignSubmit}
        >
          Build, Sign, Submit
        </button>
      </div>
    </div>
  )
}

export default Cip95BuildSignSubmitCard
