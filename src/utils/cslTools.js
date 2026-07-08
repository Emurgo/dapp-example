import logger from './logger'
import {protocolParams} from './networkConfig'
import {hexToBytes, bytesToHex, wasmMultiassetToJSONs} from './utils'
import {Buffer} from 'buffer'
import * as wasm from '@emurgo/cardano-serialization-lib-browser'
import {bech32} from 'bech32'

export const toInt = (numberInStr) => wasm.Int.from_str(numberInStr)

export const strToBigNum = (numberIsStr) => wasm.BigNum.from_str(numberIsStr)

export const getSecretKey = () => wasm.Bip32PrivateKey.generate_ed25519_bip32()

export const getTxBuilder = () => {
  return wasm.TransactionBuilder.new(
    wasm.TransactionBuilderConfigBuilder.new()
      .fee_algo(
        wasm.LinearFee.new(
          strToBigNum(protocolParams.linearFee.minFeeA),
          strToBigNum(protocolParams.linearFee.minFeeB),
        ),
      )
      .pool_deposit(strToBigNum(protocolParams.poolDeposit))
      .key_deposit(strToBigNum(protocolParams.keyDeposit))
      .coins_per_utxo_byte(strToBigNum(Math.floor(parseFloat(protocolParams.coinsPerUtxoWord) / 8).toString(10)))
      .max_value_size(protocolParams.maxValueSize)
      .max_tx_size(protocolParams.maxTxSize)
      .ex_unit_prices(
        wasm.ExUnitPrices.new(
          wasm.UnitInterval.new(strToBigNum('577'), strToBigNum('10000')),
          wasm.UnitInterval.new(strToBigNum('721'), strToBigNum('10000000')),
        ),
      )
      .build(),
  )
}

export const getCslUtxos = (hexUtxos) => {
  const wasmUtxos = wasm.TransactionUnspentOutputs.new()
  for (const hexUtxo of hexUtxos) {
    const wasmUtxo = wasm.TransactionUnspentOutput.from_bytes(hexToBytes(hexUtxo))
    wasmUtxos.add(wasmUtxo)
  }

  return wasmUtxos
}

export const getLargestFirstMultiAsset = () => wasm.CoinSelectionStrategyCIP2.LargestFirstMultiAsset

export const getTransactionOutput = (wasmOutputAddress, buildTransactionInput) => {
  if (buildTransactionInput.amount) {
    return wasm.TransactionOutput.new(wasmOutputAddress, wasm.Value.new(strToBigNum(buildTransactionInput.amount)))
  }
  return wasm.TransactionOutput.new(wasmOutputAddress, wasm.Value.new(buildTransactionInput))
}

// ---- CIP-20 (transaction message metadata, label 674) ----

// Splits a string into an array of chunks each <= 64 bytes when UTF-8 encoded.
// CSL's metadatum text strings are capped at 64 BYTES (not chars); anything
// larger makes encode_json_str_to_metadatum throw. We accumulate whole code
// points (iterating the string yields code points, not UTF-16 units) so we
// never split a multibyte character mid-sequence.
export const chunkMessageTo64Bytes = (message) => {
  const encoder = new TextEncoder()
  const chunks = []
  let current = ''
  let currentBytes = 0
  for (const ch of message) {
    const chBytes = encoder.encode(ch).length
    if (currentBytes + chBytes > 64) {
      if (current) chunks.push(current)
      current = ch
      currentBytes = chBytes
    } else {
      current += ch
      currentBytes += chBytes
    }
  }
  if (current) chunks.push(current)
  return chunks
}

// Builds an unsigned CIP-20 transaction:
//  - one explicit 1 ADA output to `receiverBech32`
//  - a label-674 { "msg": [...] } metadata entry from `messageLines`
//  - inputs coin-selected MANUALLY largest-first (so the first-picked input is
//    deterministic — CSL's add_inputs_from reorders body inputs canonically, so
//    tx.body().inputs().get(0) is NOT the first-selected input)
//  - change (and any native assets on the selected inputs) returned to the
//    address of the first-picked (largest) UTxO
// Build order is load-bearing: output -> set_auxiliary_data -> inputs -> change
// -> build_tx(). Aux data MUST be set before inputs/change or build_tx() throws
// locally ("Fee is less than the minimum fee") because the fee would be
// computed without the metadata bytes.
// Returns { txHex, details: { sizeBytes, fee, targetValue, changeValue, changeAddr, selectedCount } }.
export const buildCip20Tx = ({hexUtxos, receiverBech32, messageLines, pickedHexUtxos}) => {
  // Manual mode: caller hand-picked a specific set of UTxOs to spend (skip coin
  // selection, use exactly those). Otherwise auto largest-first selection.
  const manual = Array.isArray(pickedHexUtxos) && pickedHexUtxos.length > 0
  const sourceHex = manual ? pickedHexUtxos : hexUtxos
  if (!sourceHex || sourceHex.length === 0) {
    throw new Error('No UTxOs available to build the transaction')
  }

  // Decode + sort by coin value, largest first (BigNum compare — lovelace can
  // exceed Number's safe-integer range).
  const decoded = sourceHex.map((hex) => {
    const wasmUtxo = wasm.TransactionUnspentOutput.from_bytes(hexToBytes(hex))
    return {wasmUtxo, coin: wasmUtxo.output().amount().coin()}
  })
  decoded.sort((a, b) => b.coin.compare(a.coin))

  const TARGET_LOVELACE = '1000000' // 1 ADA
  // Fee headroom: the max fee for a tx up to the 16 KB cap is < 1 ADA
  // (44 * 16384 + 155381 ≈ 0.88 ADA), so selecting inputs until they cover
  // 1 ADA output + 1 ADA headroom guarantees the built fee is coverable.
  const TARGET = strToBigNum(TARGET_LOVELACE)
  const NEEDED = strToBigNum('2000000')

  const buildWith = (selected) => {
    const txBuilder = getTxBuilder()

    // 1. explicit 1 ADA output to the receiver
    const receiverAddr = getAddressFromBech32(receiverBech32)
    txBuilder.add_output(wasm.TransactionOutput.new(receiverAddr, wasm.Value.new(strToBigNum(TARGET_LOVELACE))))

    // 2. CIP-20 auxiliary data (BEFORE inputs/change so fee accounts for it)
    const auxData = wasm.AuxiliaryData.new()
    const metadata = wasm.GeneralTransactionMetadata.new()
    const metadatum = wasm.encode_json_str_to_metadatum(
      JSON.stringify({msg: messageLines}),
      wasm.MetadataJsonSchema.NoConversions,
    )
    metadata.insert(strToBigNum('674'), metadatum)
    auxData.set_metadata(metadata)
    txBuilder.set_auxiliary_data(auxData)

    // 3. inputs, largest-first
    for (const u of selected) {
      const output = u.wasmUtxo.output()
      txBuilder.add_regular_input(output.address(), u.wasmUtxo.input(), output.amount())
    }

    // 4. change to the first-picked (largest) UTxO's address
    txBuilder.add_change_if_needed(selected[0].wasmUtxo.output().address())

    // 5. finalize (throws if > max_tx_size)
    return txBuilder.build_tx()
  }

  // Manual mode → use EXACTLY the picked UTxOs (a too-small pick is caught by
  // build_tx below, via the exhaustedAll branch). Auto mode → coin-select
  // largest-first NUMERICALLY: accumulate until the running total covers the
  // output + fee headroom (or we run out of UTxOs). No string-matching on CSL
  // errors to decide selection — that decision is a pure BigNum comparison.
  let selected
  if (manual) {
    selected = decoded
  } else {
    selected = []
    let running = strToBigNum('0')
    for (const u of decoded) {
      selected.push(u)
      running = running.checked_add(u.coin)
      if (running.compare(NEEDED) >= 0) break
    }
    // Not enough even for the 1 ADA output — definitely insufficient.
    if (running.compare(TARGET) < 0) {
      throw new Error('Insufficient funds: your UTxOs do not cover the 1 ADA output.')
    }
  }

  const exhaustedAll = selected.length === decoded.length

  try {
    const tx = buildWith(selected)
    const body = tx.body()
    const outputs = body.outputs()
    let changeValue = '0'
    let changeAddr = selected[0].wasmUtxo.output().address().to_bech32()
    if (outputs.len() > 1) {
      const changeOut = outputs.get(outputs.len() - 1)
      changeValue = changeOut.amount().coin().to_str()
      changeAddr = changeOut.address().to_bech32()
    }
    const txBytes = tx.to_bytes()
    return {
      txHex: bytesToHex(txBytes),
      details: {
        sizeBytes: txBytes.length,
        fee: body.fee().to_str(),
        targetValue: outputs.get(0).amount().coin().to_str(),
        changeValue,
        changeAddr,
        selectedCount: selected.length,
      },
    }
  } catch (e) {
    const msg = String(e?.message ?? e)
    if (/maximum transaction size/i.test(msg)) {
      const found = msg.match(/Found:\s*(\d+)/)
      throw new Error(
        `Transaction exceeds the 16 KB limit${found ? ` (${found[1]} bytes)` : ''} — shorten the message or select fewer inputs.`,
      )
    }
    // Relabel as friendly "insufficient funds" ONLY when we used every selected
    // UTxO AND CSL actually reported an input shortfall. Any other failure
    // (value-size, malformed input, unexpected) is surfaced as-is, not masked.
    if (exhaustedAll && /insufficient|not enough/i.test(msg)) {
      throw new Error('Insufficient funds: your UTxOs do not cover the 1 ADA output plus the network fee.')
    }
    throw e // real/unexpected error — surface as-is
  }
}

// Descending comparator for lovelace amount strings (UI sort of decoded UTxOs).
// Uses wasm.BigNum (not native BigInt, which trips the react-app ESLint no-undef).
export const compareLovelaceDesc = (aStr, bStr) =>
  wasm.BigNum.from_str(bStr).compare(wasm.BigNum.from_str(aStr))

export const getAddressFromBytes = (changeAddress) => wasm.Address.from_bytes(hexToBytes(changeAddress))

export const getTransactionFromBytes = (txHex) => wasm.Transaction.from_bytes(hexToBytes(txHex))

export const getTransactionWitnessSetNew = () => wasm.TransactionWitnessSet.new()

export const getTransactionWitnessSetFromBytes = (witnessHex) =>
  wasm.TransactionWitnessSet.from_bytes(hexToBytes(witnessHex))


export const getPubKeyHash = (usedAddress) => wasm.BaseAddress.from_address(usedAddress).payment_cred().to_keyhash()

export const getNativeScript = (pubKeyHash) => wasm.NativeScript.new_script_pubkey(wasm.ScriptPubkey.new(pubKeyHash))

export const getTransactionOutputBuilder = (wasmChangeAddress) =>
  wasm.TransactionOutputBuilder.new().with_address(wasmChangeAddress).next()

export const getAssetName = (assetNameString) => wasm.AssetName.new(Buffer.from(assetNameString, 'utf8'))

export const getBech32AddressFromHex = (addressHex) => wasm.Address.from_bytes(hexToBytes(addressHex)).to_bech32()

// Decode an array of hex addresses (as returned by the wallet) to bech32.
export const hexArrayToBech32Addresses = (hexAddresses) => hexAddresses.map(getBech32AddressFromHex)

export const getAddressFromBech32 = (bech32Value) => wasm.Address.from_bech32(bech32Value)

export const getCslValue = (hexValue) => wasm.Value.from_hex(hexValue)

export const getAmountInHex = (amount) => wasm.Value.new(wasm.BigNum.from_str(amount)).to_hex()

export const getUtxoFromHex = (hexUtxo) => {
  const utxo = {}
  const cslUtxo = wasm.TransactionUnspentOutput.from_bytes(hexToBytes(hexUtxo))
  const output = cslUtxo.output()
  const input = cslUtxo.input()
  utxo.tx_hash = bytesToHex(input.transaction_id().to_bytes())
  utxo.tx_index = input.index()
  utxo.receiver = output.address().to_bech32()
  utxo.amount = output.amount().coin().to_str()
  utxo.asset = wasmMultiassetToJSONs(output.amount().multiasset())
  utxo.hex = hexUtxo
  return utxo
}

// Decode an array of hex UTxOs (as returned by the wallet) to UTxO objects.
export const hexArrayToUtxos = (hexUtxos) => hexUtxos.map(getUtxoFromHex)

export const getTransactionHashFromHex = (txHex) => wasm.TransactionHash.from_hex(txHex)

export const getCertificateBuilder = () => wasm.CertificatesBuilder.new()

export const getCredential = (keyHash) => wasm.Credential.from_keyhash(keyHash)

export const getCredentialFromScriptHash = (scriptHash) => wasm.Credential.from_scripthash(scriptHash)

export const getAddressFromCred = (testId, cred) => wasm.EnterpriseAddress.new(testId, cred).to_address().to_bech32()

export const getPublicKeyFromHex = (publicKeyHex) => wasm.PublicKey.from_hex(publicKeyHex)

export const keyHashFromHex = (hexValue) => wasm.Ed25519KeyHash.from_hex(hexValue)

export const keyHashFromBech32 = (bech32Value) => wasm.Ed25519KeyHash.from_bech32(bech32Value)

export const getCslCredentialFromHex = (hexValue) => {
  logger.debug('[cslTools][getCslCredentialFromHex]::hexValue', hexValue)
  const keyHash = keyHashFromHex(hexValue)
  logger.debug('[cslTools][getCslCredentialFromHex]::keyHash', keyHash)
  const cred = getCredential(keyHash)
  logger.debug('[cslTools][getCslCredentialFromHex]::cred', cred)
  return cred
}

export const getCslCredentialFromBech32 = (bech32Value) => {
  logger.debug('[cslTools][getCslCredentialFromBech32]::bech32Value', bech32Value)
  const keyHash = keyHashFromBech32(bech32Value)
  logger.debug('[cslTools][getCslCredentialFromBech32]::keyHash', keyHash)
  const cred = getCredential(keyHash)
  logger.debug('[cslTools][getCslCredentialFromBech32]::cred', cred)
  return cred
}

export const getCslCredentialFromScriptFromBech32 = (bech32Value) => {
  logger.debug('[cslTools][getCslCredentialFromScriptFromBech32]::bech32Value', bech32Value)
  const scriptHash = wasm.ScriptHash.from_bech32(bech32Value)
  logger.debug('[cslTools][getCslCredentialFromScriptFromBech32]::scriptHash', scriptHash)
  const cred = getCredentialFromScriptHash(scriptHash)
  logger.debug('[cslTools][getCslCredentialFromScriptFromBech32]::cred', cred)
  return cred
}

export const getCslCredentialFromScriptFromHex = (hexValue) => {
  logger.debug('[cslTools][getCslCredentialFromScriptFromHex]::hexValue', hexValue)
  const scriptHash = wasm.ScriptHash.from_hex(hexValue)
  logger.debug('[cslTools][getCslCredentialFromScriptFromHex]::scriptHash', scriptHash)
  const cred = getCredentialFromScriptHash(scriptHash)
  logger.debug('[cslTools][getCslCredentialFromScriptFromHex]::cred', cred)
  return cred
}

/**
 * 
 * @param {wasm.Credential} dRepCred 
 * @returns {boolean}
 */
export const dRepIsScript = (dRepCred) => dRepCred.kind() === wasm.CredKind.Script

export const getDRepAbstain = () => wasm.DRep.new_always_abstain()

export const getDRepNoConfidence = () => wasm.DRep.new_always_no_confidence()

export const getDRepNewKeyHash = (credHash) => wasm.DRep.new_key_hash(credHash)

export const getURL = (url) => wasm.URL.new(url)

export const getAnchorHash = (urlHash) => wasm.AnchorDataHash.from_hex(urlHash)

export const getAnchor = (url, urlHash) => {
  const anchorURL = getURL(url)
  const anchorHash = getAnchorHash(urlHash)
  return wasm.Anchor.new(anchorURL, anchorHash)
}

// Vote Delegation Certificate
export const getVoteDelegCert = (stakeCred, dRepKeyHash) => wasm.VoteDelegation.new(stakeCred, dRepKeyHash)

export const getCertOfNewVoteDelegation = (voteCert) => wasm.Certificate.new_vote_delegation(voteCert)

// DRep Registration Certificate
export const getDRepRegCert = (dRepCred, dRepDeposit) => wasm.DRepRegistration.new(dRepCred, strToBigNum(dRepDeposit))

export const getDRepRegWithAnchorCert = (dRepCred, dRepDeposit, anchor) =>
  wasm.DRepRegistration.new_with_anchor(dRepCred, strToBigNum(dRepDeposit), anchor)

export const getCertOfNewDRepReg = (dRepRegCert) => wasm.Certificate.new_drep_registration(dRepRegCert)

// DRep Update Certificate
export const getDRepUpdateCert = (dRepCred) => wasm.DRepUpdate.new(dRepCred)

export const getDRepUpdateWithAnchorCert = (dRepCred, anchor) => wasm.DRepUpdate.new_with_anchor(dRepCred, anchor)

export const getCertOfNewDRepUpdate = (dRepUpdateCert) => wasm.Certificate.new_drep_update(dRepUpdateCert)

// DRep Retirement Certificate
export const getDRepRetirementCert = (dRepCred, dRepRefundAmount) =>
  wasm.DRepDeregistration.new(dRepCred, strToBigNum(dRepRefundAmount))

export const getCertOfNewDRepRetirement = (dRepRetirementCert) =>
  wasm.Certificate.new_drep_deregistration(dRepRetirementCert)

// Vote
export const getVotingProcedureWithAnchor = (votingChoice, anchor) =>
  wasm.VotingProcedure.new_with_anchor(votingChoice, anchor)

export const getCslVotingBuilder = () => wasm.VotingBuilder.new()

export const getGovActionId = (govActionTxHashInHex, govActionIndex) =>
  wasm.GovernanceActionId.new(getTransactionHashFromHex(govActionTxHashInHex), govActionIndex)

export const getVoter = (dRepKeyHash) => wasm.Voter.new_drep_credential(dRepKeyHash)

export const getVotingProcedure = (votingChoice) => wasm.VotingProcedure.new(votingChoice)

// Register Stake Key Certificate
export const getStakeKeyRegCertWithCoin = (stakeCred, deposit) =>
  wasm.StakeRegistration.new_with_explicit_deposit(stakeCred, strToBigNum(deposit))

export const getStakeKeyRegCert = (stakeCred) => wasm.StakeRegistration.new(stakeCred)

export const getCertOfNewStakeReg = (stakeKeyRegCert) => wasm.Certificate.new_stake_registration(stakeKeyRegCert)

// Unregister Stake key Certificate
export const getStakeKeyDeregCertWithCoin = (stakeCred, deposit) =>
  wasm.StakeDeregistration.new_with_explicit_refund(stakeCred, strToBigNum(deposit))

export const getStakeKeyDeregCert = (stakeCred) => wasm.StakeDeregistration.new(stakeCred)

export const getCertOfNewStakeDereg = (stakeKeyDeregCert) =>
  wasm.Certificate.new_stake_deregistration(stakeKeyDeregCert)

// Committee Hot Authorization Certificate
export const getCommitteeHotAuth = (coldCred, hotCred) => wasm.CommitteeHotAuth.new(coldCred, hotCred)

export const getCertOfNewCommitteeHotAuth = (committeeHotAuthCert) =>
  wasm.Certificate.new_committee_hot_auth(committeeHotAuthCert)

export const getCslRewardAddressFromHex = (networkType, rewardAddressHex) => {
  switch (networkType) {
    case 'mainnet':
      return wasm.RewardAddress.new(wasm.NetworkInfo.mainnet().network_id(), wasm.Credential.from_hex(rewardAddressHex))
    case 'preview':
      return wasm.RewardAddress.new(
        wasm.NetworkInfo.testnet_preview().network_id(),
        wasm.Credential.from_hex(rewardAddressHex),
      )
    default:
      return wasm.RewardAddress.new(
        wasm.NetworkInfo.testnet_preprod().network_id(),
        wasm.Credential.from_hex(rewardAddressHex),
      )
  }
}

export const getCslRewardAddress = (networkType, stakeKeyHashCredential) => {
  switch (networkType) {
    case 'mainnet':
      return wasm.RewardAddress.new(wasm.NetworkInfo.mainnet().network_id(), stakeKeyHashCredential)
    case 'preview':
      return wasm.RewardAddress.new(wasm.NetworkInfo.testnet_preview().network_id(), stakeKeyHashCredential)
    default:
      return wasm.RewardAddress.new(wasm.NetworkInfo.testnet_preprod().network_id(), stakeKeyHashCredential)
  }
}

export const getWithdrawalsBuilder = () => wasm.WithdrawalsBuilder.new()

export const getFixedTxFromBytes = (txBytes) => wasm.FixedTransaction.from_bytes(txBytes)

export const convertBase32ToHex = (data) => {
  return bytesToHex(bech32.fromWords(data))
}

export const base32ToHex = (base32) => {
  const base32Words = bech32.decodeUnsafe(base32, base32.length)
  return convertBase32ToHex(base32Words?.words)
}

export const hexToBase32 = (hex, prefix) => {
  return bech32.encode(prefix, bech32.toWords(hexToBytes(hex)))
}
