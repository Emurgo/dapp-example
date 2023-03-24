import React, {useState} from 'react'
import {bytesToHex, hexToBytes, wasmMultiassetToJSONs} from '../../utils/utils'
import ApiCardWithModal from './apiCardWithModal'

const GetUtxosCard = ({api, wasm, onRawResponse, onResponse, onWaiting}) => {
  const [getUtxosInput, setGetUtxosInput] = useState({amount: '', page: 0, limit: 10})

  const getUtxosClick = () => {
    onWaiting(true)
    api
      ?.getUtxos(getUtxosInput.amount, {page: getUtxosInput.page, limit: getUtxosInput.limit})
      .then((hexUtxos) => {
        onWaiting(false)
        onRawResponse(hexUtxos)
        let utxos = []
        for (let i = 0; i < hexUtxos.length; i++) {
          const utxo = {}
          const wasmUtxo = wasm.TransactionUnspentOutput.from_bytes(hexToBytes(hexUtxos[i]))
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
    buttonLabel: 'getUtxos',
    clickFunction: getUtxosClick,
  }

  return (
    <ApiCardWithModal {...apiProps}>
      <div className="px-4 pb-3">
        <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-300">
          Amount
        </label>
        <input
          type="number"
          min="0"
          id="amount"
          className="appearance-none border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
          placeholder=""
          value={getUtxosInput.amount}
          onChange={(event) => setGetUtxosInput({...getUtxosInput, amount: event.target.value})}
        />
      </div>
      <div className="grid gap-6 mb-6 md:grid-cols-2 px-4">
        <div>
          <label htmlFor="page" className="block mb-2 text-sm font-medium text-gray-300">
            Page
          </label>
          <input
            type="number"
            min="0"
            id="page"
            className="appearance-none border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
            placeholder=""
            value={getUtxosInput.page}
            onChange={(event) => setGetUtxosInput({...getUtxosInput, page: Number(event.target.value)})}
          />
        </div>
        <div>
          <label htmlFor="limit" className="block mb-2 text-sm font-medium text-gray-300">
            Limit
          </label>
          <input
            type="number"
            min="0"
            id="limit"
            className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
            placeholder=""
            value={getUtxosInput.limit}
            onChange={(event) => setGetUtxosInput({...getUtxosInput, limit: Number(event.target.value)})}
          />
        </div>
      </div>
    </ApiCardWithModal>
  )
}

export default GetUtxosCard
