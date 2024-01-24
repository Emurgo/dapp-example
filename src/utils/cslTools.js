import {protocolParams} from './networkConfig'
import {hexToBytes, bytesToHex, wasmMultiassetToJSONs} from './utils'
import {Buffer} from 'buffer'

export const toInt = (wasm, number) => wasm.Int.new_i32(number)

export const getTxBuilder = (wasm) => {
  return wasm.TransactionBuilder.new(
    wasm.TransactionBuilderConfigBuilder.new()
      .fee_algo(
        wasm.LinearFee.new(
          wasm.BigNum.from_str(protocolParams.linearFee.minFeeA),
          wasm.BigNum.from_str(protocolParams.linearFee.minFeeB)
          ))
      .pool_deposit(wasm.BigNum.from_str(protocolParams.poolDeposit))
      .key_deposit(wasm.BigNum.from_str(protocolParams.keyDeposit))
      .coins_per_utxo_word(wasm.BigNum.from_str(protocolParams.coinsPerUtxoWord))
      .max_value_size(protocolParams.maxValueSize)
      .max_tx_size(protocolParams.maxTxSize)
      .ex_unit_prices(
        wasm.ExUnitPrices.new(
          wasm.UnitInterval.new(wasm.BigNum.from_str('577'), wasm.BigNum.from_str('10000')),
          wasm.UnitInterval.new(wasm.BigNum.from_str('721'), wasm.BigNum.from_str('10000000')),
        ),
      )
      .build(),
  )
}

export const getCslUtxos = (wasm, hexUtxos) => {
  const wasmUtxos = wasm.TransactionUnspentOutputs.new()
  for (const hexUtxo of hexUtxos) {
    const wasmUtxo = wasm.TransactionUnspentOutput.from_bytes(hexToBytes(hexUtxo))
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

export const getAssetName = (wasm, assetNameString) => wasm.AssetName.new(Buffer.from(assetNameString, 'utf8'))

export const getBech32AddressFromHex = (wasm, addressHex) => wasm.Address.from_bytes(hexToBytes(addressHex)).to_bech32()

export const getCslValue = (wasm, hexValue) => wasm.Value.from_bytes(hexToBytes(hexValue))

export const getUtxoFromHex = (wasm, hexUtxo) => {
  const utxo = {}
  const cslUtxo = wasm.TransactionUnspentOutput.from_bytes(hexToBytes(hexUtxo))
  const output = cslUtxo.output()
  const input = cslUtxo.input()
  utxo.tx_hash = bytesToHex(input.transaction_id().to_bytes())
  utxo.tx_index = input.index()
  utxo.receiver = output.address().to_bech32()
  utxo.amount = output.amount().coin().to_str()
  utxo.asset = wasmMultiassetToJSONs(output.amount().multiasset())
  return utxo
}

export const getTransactionHashFromHex = (wasm, txHex) => wasm.TransactionHash.from_hex(txHex)

export const getCertificateBuilder = (wasm) => wasm.CertificatesBuilder.new()

export const getCredential = (wasm, keyHash) => wasm.Credential.from_keyhash(keyHash)

export const keyHashFromHex = (wasm, hexValue) => wasm.Ed25519KeyHash.from_hex(hexValue)

export const keyHashFromBech32 = (wasm, bech32Value) => wasm.Ed25519KeyHash.from_bech32(bech32Value)

export const getCslCredentialFromHex = (wasm, hexValue) => {
  console.debug('[cslTools][getCslCredentialFromHex]::hexValue', hexValue)
  const keyHash = keyHashFromHex(wasm, hexValue)
  console.debug('[cslTools][getCslCredentialFromHex]::keyHash', keyHash)
  const cred = getCredential(wasm, keyHash)
  console.debug('[cslTools][getCslCredentialFromHex]::cred', cred)
  return cred
}

export const getCslCredentialFromBech32 = (wasm, bech32Value) => {
  console.debug('[cslTools][getCslCredentialFromBech32]::bech32Value', bech32Value)
  const keyHash = keyHashFromBech32(wasm, bech32Value)
  console.debug('[cslTools][getCslCredentialFromBech32]::keyHash', keyHash)
  const cred = getCredential(wasm, keyHash)
  console.debug('[cslTools][getCslCredentialFromBech32]::cred', cred)
  return cred
}

export const getDRepAbstain = (wasm) => wasm.DRep.new_always_abstain()

export const getDRepNoConfidence = (wasm) => wasm.DRep.new_always_no_confidence()

export const getDRepNewKeyHash = (wasm, credHash) => wasm.DRep.new_key_hash(credHash)

export const getURL = (wasm, url) => wasm.URL.new(url)

export const getAnchorHash = (wasm, urlHash) => wasm.AnchorDataHash.from_hex(urlHash)

export const getAnchor = (wasm, url, urlHash) => {
  const anchorURL = getURL(wasm, url)
  const anchorHash = getAnchorHash(wasm, urlHash)
  return wasm.Anchor.new(anchorURL, anchorHash)
}

// Vote Delegation Certificate
export const getVoteDelegCert = (wasm, stakeCred, dRepKeyHash) => wasm.VoteDelegation.new(stakeCred, dRepKeyHash)

export const getCertOfNewVoteDelegation = (wasm, voteCert) => wasm.Certificate.new_vote_delegation(voteCert)

// DRep Registration Certificate
export const getDRepRegCert = (wasm, dRepCred, dRepDeposit) =>
  wasm.DrepRegistration.new(dRepCred, wasm.BigNum.from_str(dRepDeposit))

export const getDRepRegWithAnchorCert = (wasm, dRepCred, dRepDeposit, anchor) =>
  wasm.DrepRegistration.new_with_anchor(dRepCred, wasm.BigNum.from_str(dRepDeposit), anchor)

export const getCertOfNewDRepReg = (wasm, dRepRegCert) => wasm.Certificate.new_drep_registration(dRepRegCert)

// DRep Update Certificate
export const getDRepUpdateCert = (wasm, dRepCred) => wasm.DrepUpdate.new(dRepCred)

export const getDRepUpdateWithAnchorCert = (wasm, dRepCred, anchor) => wasm.DrepUpdate.new_with_anchor(dRepCred, anchor)

export const getCertOfNewDRepUpdate = (wasm, dRepUpdateCert) => wasm.Certificate.new_drep_update(dRepUpdateCert)

// DRep Retirement Certificate
export const getDRepRetirementCert = (wasm, dRepCred, dRepRefundAmount) =>
  wasm.DrepDeregistration.new(dRepCred, wasm.BigNum.from_str(dRepRefundAmount))

export const getCertOfNewDRepRetirement = (wasm, dRepRetirementCert) =>
  wasm.Certificate.new_drep_deregistration(dRepRetirementCert)

// Vote
export const getVotingProcedureWithAnchor = (wasm, votingChoice, anchor) =>
  wasm.VotingProcedure.new_with_anchor(votingChoice, anchor)

export const getCslVotingBuilder = (wasm) => wasm.VotingBuilder.new()

export const getGovActionId = (wasm, govActionTxHashInHex, govActionIndex) =>
  wasm.GovernanceActionId.new(getTransactionHashFromHex(wasm, govActionTxHashInHex), govActionIndex)

export const getVoter = (wasm, dRepKeyHash) => wasm.Voter.new_drep(dRepKeyHash)

export const getVotingProcedure = (wasm, votingChoice) => wasm.VotingProcedure.new(votingChoice)
