import {hexToBytes, bytesToHex, wasmMultiassetToJSONs} from './utils'
import {Buffer} from 'buffer'
import {
  Address,
  AssetName,
  BaseAddress,
  BigNum,
  CertificatesBuilder,
  CoinSelectionStrategyCIP2,
  ExUnitPrices,
  Int,
  LinearFee,
  NativeScript,
  ScriptPubkey,
  Transaction,
  TransactionBuilder,
  TransactionBuilderConfigBuilder,
  TransactionOutput,
  TransactionOutputBuilder,
  TransactionUnspentOutput,
  TransactionUnspentOutputs,
  TransactionWitnessSet,
  Value,
  UnitInterval,
} from '@emurgo/cardano-serialization-lib-browser'

export const toInt = (number) => Int.new_i32(number)

export const getTxBuilder = () => {
  return TransactionBuilder.new(
    TransactionBuilderConfigBuilder.new()
      .fee_algo(LinearFee.new(BigNum.from_str('44'), BigNum.from_str('155381')))
      .coins_per_utxo_word(BigNum.from_str('34482'))
      .pool_deposit(BigNum.from_str('500000000'))
      .key_deposit(BigNum.from_str('2000000'))
      .ex_unit_prices(
        ExUnitPrices.new(
          UnitInterval.new(BigNum.from_str('577'), BigNum.from_str('10000')),
          UnitInterval.new(BigNum.from_str('721'), BigNum.from_str('10000000')),
        ),
      )
      .max_value_size(5000)
      .max_tx_size(16384)
      .build(),
  )
}

export const getCslUtxos = (hexUtxos) => {
  const wasmUtxos = TransactionUnspentOutputs.new()
  for (const hexUtxo of hexUtxos) {
    const wasmUtxo = TransactionUnspentOutput.from_bytes(hexToBytes(hexUtxo))
    wasmUtxos.add(wasmUtxo)
  }

  return wasmUtxos
}

export const getLargestFirstMultiAsset = () => CoinSelectionStrategyCIP2.LargestFirstMultiAsset

export const getTransactionOutput = (wasmOutputAddress, buildTransactionInput) =>
  TransactionOutput.new(wasmOutputAddress, Value.new(BigNum.from_str(buildTransactionInput.amount)))

export const getAddressFromBytes = (changeAddress) => Address.from_bytes(hexToBytes(changeAddress))

export const getTransactionFromBytes = (txHex) => Transaction.from_bytes(hexToBytes(txHex))

export const getTransactionWitnessSetFromBytes = (witnessHex) =>
  TransactionWitnessSet.from_bytes(hexToBytes(witnessHex))

export const getSignedTransaction = (wasmUnsignedTransaction, wasmWitnessSet) =>
  Transaction.new(wasmUnsignedTransaction.body(), wasmWitnessSet, wasmUnsignedTransaction.auxiliary_data())

export const getPubKeyHash = (usedAddress) => BaseAddress.from_address(usedAddress).payment_cred().to_keyhash()

export const getNativeScript = (pubKeyHash) => NativeScript.new_script_pubkey(ScriptPubkey.new(pubKeyHash))

export const getTransactionOutputBuilder = (wasmChangeAddress) =>
  TransactionOutputBuilder.new().with_address(wasmChangeAddress).next()

export const getAssetName = (assetNameString) => AssetName.new(Buffer.from(assetNameString, 'utf8'))

export const getBech32AddressFromHex = (addressHex) => Address.from_bytes(hexToBytes(addressHex)).to_bech32()

export const getCslValue = (hexValue) => Value.from_bytes(hexToBytes(hexValue))

export const getUtxoFromHex = (hexUtxo) => {
  const utxo = {}
  const cslUtxo = TransactionUnspentOutput.from_bytes(hexToBytes(hexUtxo))
  const output = cslUtxo.output()
  const input = cslUtxo.input()
  utxo.tx_hash = bytesToHex(input.transaction_id().to_bytes())
  utxo.tx_index = input.index()
  utxo.receiver = output.address().to_bech32()
  utxo.amount = output.amount().coin().to_str()
  utxo.asset = wasmMultiassetToJSONs(output.amount().multiasset())
  return utxo
}

export const getCertificateBuilder = () => CertificatesBuilder.new()
