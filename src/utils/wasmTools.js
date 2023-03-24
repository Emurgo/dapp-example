import {hexToBytes} from './utils'
import {Buffer} from 'buffer'

export const toInt = (wasm, number) => wasm.Int.new_i32(number)

export const getTxBuilder = (wasm) => {
  return wasm?.TransactionBuilder.new(
    wasm.TransactionBuilderConfigBuilder.new()
      .fee_algo(wasm.LinearFee.new(wasm.BigNum.from_str('44'), wasm.BigNum.from_str('155381')))
      .coins_per_utxo_word(wasm.BigNum.from_str('34482'))
      .pool_deposit(wasm.BigNum.from_str('500000000'))
      .key_deposit(wasm.BigNum.from_str('2000000'))
      .ex_unit_prices(
        wasm.ExUnitPrices.new(
          wasm.UnitInterval.new(wasm.BigNum.from_str('577'), wasm.BigNum.from_str('10000')),
          wasm.UnitInterval.new(wasm.BigNum.from_str('721'), wasm.BigNum.from_str('10000000')),
        ),
      )
      .max_value_size(5000)
      .max_tx_size(16384)
      .build(),
  )
}

export const getWasmUtxos = (wasm, hexUtxos) => {
  const wasmUtxos = wasm.TransactionUnspentOutputs.new()
  for (let i = 0; i < hexUtxos.length; i++) {
    const wasmUtxo = wasm.TransactionUnspentOutput.from_bytes(hexToBytes(hexUtxos[i]))
    wasmUtxos.add(wasmUtxo)
  }

  return wasmUtxos
}

export const getLargestFirstMultiAsset = (wasm) => wasm.CoinSelectionStrategyCIP2.LargestFirstMultiAsset

export const getTransactionOutput = (wasm, wasmOutputAddress, buildTransactionInput) =>
  wasm.TransactionOutput.new(wasmOutputAddress, wasm.Value.new(wasm.BigNum.from_str(buildTransactionInput.amount)))

export const getAddressFromBytes = (wasm, changeAddress) => wasm.Address.from_bytes(hexToBytes(changeAddress))

export const getTransactionFromBytes = (wasm, txHex) => wasm.Transaction.from_bytes(hexToBytes(txHex))

export const getTransactionWitnessSetFromBytes = (wasm, witnessHex) =>
  wasm.TransactionWitnessSet.from_bytes(hexToBytes(witnessHex))

export const getSignedTransaction = (wasm, wasmUnsignedTransaction, wasmWitnessSet) =>
  wasm.Transaction.new(wasmUnsignedTransaction.body(), wasmWitnessSet, wasmUnsignedTransaction.auxiliary_data())

export const getPubKeyHash = (wasm, usedAddress) =>
  wasm.BaseAddress.from_address(usedAddress).payment_cred().to_keyhash()

export const getNativeScript = (wasm, pubKeyHash) =>
  wasm.NativeScript.new_script_pubkey(wasm.ScriptPubkey.new(pubKeyHash))

export const getTransactionOutputBuilder = (wasm, wasmChangeAddress) =>
  wasm.TransactionOutputBuilder.new().with_address(wasmChangeAddress).next()

export const getAssetName = (wasm, mintingTxInfo) => wasm.AssetName.new(Buffer.from(mintingTxInfo.NFTName, 'utf8'))
