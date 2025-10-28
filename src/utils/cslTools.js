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

export const getAddressFromBytes = (changeAddress) => wasm.Address.from_bytes(hexToBytes(changeAddress))

export const getTransactionFromBytes = (txHex) => wasm.Transaction.from_bytes(hexToBytes(txHex))

export const getTransactionWitnessSetNew = () => wasm.TransactionWitnessSet.new()

export const getTransactionWitnessSetFromBytes = (witnessHex) =>
  wasm.TransactionWitnessSet.from_bytes(hexToBytes(witnessHex))

export const getSignedTransaction = (wasmUnsignedTransaction, wasmWitnessSet) =>
  wasm.Transaction.new(wasmUnsignedTransaction.body(), wasmWitnessSet, wasmUnsignedTransaction.auxiliary_data())

export const getPubKeyHash = (usedAddress) => wasm.BaseAddress.from_address(usedAddress).payment_cred().to_keyhash()

export const getNativeScript = (pubKeyHash) => wasm.NativeScript.new_script_pubkey(wasm.ScriptPubkey.new(pubKeyHash))

export const getTransactionOutputBuilder = (wasmChangeAddress) =>
  wasm.TransactionOutputBuilder.new().with_address(wasmChangeAddress).next()

export const getAssetName = (assetNameString) => wasm.AssetName.new(Buffer.from(assetNameString, 'utf8'))

export const getBech32AddressFromHex = (addressHex) => wasm.Address.from_bytes(hexToBytes(addressHex)).to_bech32()

export const getAddressFromBech32 = (bech32Value) => wasm.Address.from_bech32(bech32Value)

export const getCslValue = (hexValue) => wasm.Value.from_bytes(hexToBytes(hexValue))

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

export const getTransactionHashFromHex = (txHex) => wasm.TransactionHash.from_hex(txHex)

export const getCertificateBuilder = () => wasm.CertificatesBuilder.new()

export const getCredential = (keyHash) => wasm.Credential.from_keyhash(keyHash)

export const getCredentialFromScriptHash = (scriptHash) => wasm.Credential.from_scripthash(scriptHash)

export const getAddressFromCred = (testId, cred) => wasm.EnterpriseAddress.new(testId, cred).to_address().to_bech32()

export const getPublicKeyFromHex = (publicKeyHex) => wasm.PublicKey.from_hex(publicKeyHex)

export const keyHashFromHex = (hexValue) => wasm.Ed25519KeyHash.from_hex(hexValue)

export const keyHashFromBech32 = (bech32Value) => wasm.Ed25519KeyHash.from_bech32(bech32Value)

export const getCslCredentialFromHex = (hexValue) => {
  console.debug('[cslTools][getCslCredentialFromHex]::hexValue', hexValue)
  const keyHash = keyHashFromHex(hexValue)
  console.debug('[cslTools][getCslCredentialFromHex]::keyHash', keyHash)
  const cred = getCredential(keyHash)
  console.debug('[cslTools][getCslCredentialFromHex]::cred', cred)
  return cred
}

export const getCslCredentialFromBech32 = (bech32Value) => {
  console.debug('[cslTools][getCslCredentialFromBech32]::bech32Value', bech32Value)
  const keyHash = keyHashFromBech32(bech32Value)
  console.debug('[cslTools][getCslCredentialFromBech32]::keyHash', keyHash)
  const cred = getCredential(keyHash)
  console.debug('[cslTools][getCslCredentialFromBech32]::cred', cred)
  return cred
}

export const getCslCredentialFromScriptFromBech32 = (bech32Value) => {
  console.debug('[cslTools][getCslCredentialFromScriptFromBech32]::bech32Value', bech32Value)
  const scriptHash = wasm.ScriptHash.from_bech32(bech32Value)
  console.debug('[cslTools][getCslCredentialFromScriptFromBech32]::scriptHash', scriptHash)
  const cred = getCredentialFromScriptHash(scriptHash)
  console.debug('[cslTools][getCslCredentialFromScriptFromBech32]::cred', cred)
  return cred
}

export const getCslCredentialFromScriptFromHex = (hexValue) => {
  console.debug('[cslTools][getCslCredentialFromScriptFromHex]::hexValue', hexValue)
  const scriptHash = wasm.ScriptHash.from_hex(hexValue)
  console.debug('[cslTools][getCslCredentialFromScriptFromHex]::scriptHash', scriptHash)
  const cred = getCredentialFromScriptHash(scriptHash)
  console.debug('[cslTools][getCslCredentialFromScriptFromHex]::cred', cred)
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
