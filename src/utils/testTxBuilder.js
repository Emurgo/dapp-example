import * as wasm from '@emurgo/cardano-serialization-lib-browser'
import {Buffer} from 'buffer'
import {hexToBytes, bytesToHex} from './utils'
import {getTxBuilder, strToBigNum} from './cslTools'

// ---------------------------------------------------------------------------
// Deterministic test data (matches reference cardano-tx-test.tsx)
// ---------------------------------------------------------------------------

const FAKE_TX_HASH = 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90'
const PAYMENT_KEY_HASH = '01020304050607080910111213141516171819202122232425262728'
const STAKE_KEY_HASH = 'aa11bb22cc33dd44ee55ff6677889900aabbccddeeff001122334455'
const POOL_KEY_HASH = 'deadbeef01234567890abcdef01234567890abcdef01234567890abc'
const DREP_KEY_HASH = '5566778899aabbccddeeff0011223344556677889900aabb11223344'
const COMMITTEE_COLD_HASH = '6677889900aabbccddeeff001122334455667788990011aabb223344'
const COMMITTEE_HOT_HASH = '7788990011aabbccddeeff00112233445566778899002233aabb4455'
const REQUIRED_SIGNER_HASH = '8899aabbccddeeff00112233445566778899aabbccddeeff00112233'
const DATUM_HASH = '2222222222222222222222222222222222222222222222222222222222222222'
const SCRIPT_DATA_HASH = 'f1e2d3c4b5a69788796a5b4c3d2e1f00f1e2d3c4b5a69788796a5b4c3d2e1f00'
const COLLATERAL_TX_HASH = '3333333333333333333333333333333333333333333333333333333333333333'
const REF_INPUT_TX_HASH = '4444444444444444444444444444444444444444444444444444444444444444'
const INLINE_DATUM_HEX = '182a' // CBOR integer 42

// ---------------------------------------------------------------------------
// Feature metadata for UI
// ---------------------------------------------------------------------------

/** Credential features that support W/K/S mode toggle */
export const CREDENTIAL_FEATURES = new Set([
  'legacyStakeReg',
  'legacyStakeDeReg',
  'conwayStakeReg',
  'conwayStakeDeReg',
  'stakeDelegation',
  'voteDelegation',
  'stakeVoteDelegation',
  'stakeRegDelegation',
  'voteRegDelegation',
  'stakeVoteRegDelegation',
  'withdrawal',
])

export const FEATURE_GROUPS = [
  {
    label: 'Certificates',
    features: [
      {key: 'legacyStakeReg', label: 'Stake Registration (kind 0)'},
      {key: 'legacyStakeDeReg', label: 'Stake Deregistration (kind 1)'},
      {key: 'stakeDelegation', label: 'Stake Delegation (kind 2)'},
      {key: 'conwayStakeReg', label: 'Conway Stake Reg (kind 7)'},
      {key: 'conwayStakeDeReg', label: 'Conway Stake Dereg (kind 8)'},
      {key: 'voteDelegation', label: 'Vote Delegation (kind 9)'},
    ],
  },
  {
    label: 'Combined Certs',
    features: [
      {key: 'stakeVoteDelegation', label: 'Stake+Vote Delegation (kind 10)'},
      {key: 'stakeRegDelegation', label: 'Stake Reg+Delegation (kind 11)'},
      {key: 'voteRegDelegation', label: 'Vote Reg+Delegation (kind 12)'},
      {key: 'stakeVoteRegDelegation', label: 'Stake+Vote Reg+Del (kind 13)'},
    ],
  },
  {
    label: 'Governance Certs',
    features: [
      {key: 'drepRegistration', label: 'DRep Registration (kind 16)'},
      {key: 'drepRetirement', label: 'DRep Retirement (kind 17)'},
      {key: 'drepUpdate', label: 'DRep Update (kind 18)'},
      {key: 'authCommittee', label: 'Authorize Committee (kind 14)'},
      {key: 'resignCommittee', label: 'Resign Committee (kind 15)'},
    ],
  },
  {
    label: 'Governance',
    features: [
      {key: 'votingProcedure', label: 'Voting procedure (DRep vote)'},
      {key: 'treasury', label: 'Treasury value (Conway)'},
      {key: 'donation', label: 'Treasury donation (Conway)'},
    ],
  },
  {
    label: 'Signers',
    features: [{key: 'requiredSigners', label: 'Required signers'}],
  },
  {
    label: 'Mint / Burn',
    features: [
      {key: 'mint', label: 'Mint tokens'},
      {key: 'burn', label: 'Burn tokens'},
    ],
  },
  {
    label: 'Withdrawals',
    features: [{key: 'withdrawal', label: 'Stake withdrawal'}],
  },
  {
    label: 'Outputs',
    features: [
      {key: 'outputDatumHash', label: 'Output with datum hash'},
      {key: 'outputInlineDatum', label: 'Output with inline datum (Babbage)'},
      {key: 'outputRefScript', label: 'Output with reference script (Babbage)'},
    ],
  },
  {
    label: 'Plutus',
    features: [
      {key: 'collateralInputs', label: 'Collateral inputs'},
      {key: 'collateralReturn', label: 'Collateral return output'},
      {key: 'totalCollateral', label: 'Total collateral'},
      {key: 'refInputs', label: 'Reference inputs'},
      {key: 'scriptDataHash', label: 'Script data hash'},
    ],
  },
  {
    label: 'Metadata',
    features: [
      {key: 'auxDataHash', label: 'Auxiliary data hash'},
      {key: 'validity', label: 'Validity interval (since + until)'},
    ],
  },
]

// ---------------------------------------------------------------------------
// Credential resolution helpers
// ---------------------------------------------------------------------------

/** Canonical test native script for 'script' mode — its hash is the script credential */
function getTestScriptNativeScript() {
  return wasm.NativeScript.new_script_pubkey(
    wasm.ScriptPubkey.new(wasm.Ed25519KeyHash.from_hex(PAYMENT_KEY_HASH)),
  )
}

function resolveStakeCred(mode, walletRewardAddrHex) {
  if (mode === 'wallet' && walletRewardAddrHex) {
    const rewardAddr = wasm.RewardAddress.from_address(
      wasm.Address.from_bytes(hexToBytes(walletRewardAddrHex)),
    )
    return rewardAddr.payment_cred()
  }
  if (mode === 'script') {
    return wasm.Credential.from_scripthash(getTestScriptNativeScript().hash())
  }
  // 'key' mode (default)
  return wasm.Credential.from_keyhash(wasm.Ed25519KeyHash.from_hex(STAKE_KEY_HASH))
}

function resolveRewardAddr(mode, walletRewardAddrHex, networkId) {
  if (mode === 'wallet' && walletRewardAddrHex) {
    return wasm.RewardAddress.from_address(
      wasm.Address.from_bytes(hexToBytes(walletRewardAddrHex)),
    )
  }
  const cred = resolveStakeCred(mode, walletRewardAddrHex)
  return wasm.RewardAddress.new(networkId, cred)
}

/** Adds a certificate using native script witness when mode is 'script' */
function addCertToBuilder(certBuilder, cert, mode) {
  if (mode === 'script') {
    certBuilder.add_with_native_script(cert, wasm.NativeScriptSource.new(getTestScriptNativeScript()))
  } else {
    certBuilder.add(cert)
  }
}

// ---------------------------------------------------------------------------
// Main builder
// ---------------------------------------------------------------------------

/**
 * Build a synthetic test transaction with the selected features enabled.
 * Uses a fake input UTXO — the tx is for signing tests only, not submittable.
 *
 * @param {Set<string>} enabledFeatures
 * @param {Object} credModes - per-feature mode: 'wallet'|'key'|'script'
 * @param {string|null} walletRewardAddrHex - hex reward address from wallet
 * @param {string} walletChangeAddrHex - hex change address from wallet
 * @param {number} networkId - 0=testnet, 1=mainnet
 * @returns {{ txHex: string, txBodyHex: string }}
 */
export function buildTestTx(enabledFeatures, credModes, walletRewardAddrHex, walletChangeAddrHex, networkId = 0) {
  const txBuilder = getTxBuilder()
  const getMode = (feat) => credModes[feat] || 'key'

  // Change address (destination for outputs)
  const changeAddr = wasm.Address.from_bytes(hexToBytes(walletChangeAddrHex))

  // Native script used for mint/burn — defined here so the policy ID is available
  // when constructing the fake UTXO (burn requires tokens in inputs)
  const mintPolicyKeyHash = wasm.Ed25519KeyHash.from_hex(PAYMENT_KEY_HASH)
  const mintNativeScript = wasm.NativeScript.new_script_pubkey(
    wasm.ScriptPubkey.new(mintPolicyKeyHash),
  )

  // Fake input UTXO: enterprise address with 10,000 ADA
  // When burn is enabled, also include the tokens to be burned so coin selection can balance
  const paymentCred = wasm.Credential.from_keyhash(wasm.Ed25519KeyHash.from_hex(PAYMENT_KEY_HASH))
  const fakeInputAddr = wasm.EnterpriseAddress.new(networkId, paymentCred).to_address()
  const fakeInput = wasm.TransactionInput.new(wasm.TransactionHash.from_hex(FAKE_TX_HASH), 0)
  const fakeValue = wasm.Value.new(strToBigNum('10000000000'))
  if (enabledFeatures.has('burn')) {
    const burnMultiAsset = wasm.MultiAsset.new()
    const burnAssets = wasm.Assets.new()
    burnAssets.insert(
      wasm.AssetName.new(Buffer.from('4255524e', 'hex')),
      strToBigNum('500'),
    )
    burnMultiAsset.insert(mintNativeScript.hash(), burnAssets)
    fakeValue.set_multiasset(burnMultiAsset)
  }
  const fakeOutput = wasm.TransactionOutput.new(fakeInputAddr, fakeValue)
  const fakeUtxo = wasm.TransactionUnspentOutput.new(fakeInput, fakeOutput)
  const fakeUtxos = wasm.TransactionUnspentOutputs.new()
  fakeUtxos.add(fakeUtxo)

  // Base output: 2 ADA to change address
  txBuilder.add_output(
    wasm.TransactionOutput.new(changeAddr, wasm.Value.new(strToBigNum('2000000'))),
  )

  // ---- Certificates ----
  const certBuilder = wasm.CertificatesBuilder.new()
  let hasCerts = false

  if (enabledFeatures.has('legacyStakeReg')) {
    const cred = resolveStakeCred(getMode('legacyStakeReg'), walletRewardAddrHex)
    certBuilder.add(wasm.Certificate.new_stake_registration(wasm.StakeRegistration.new(cred)))
    hasCerts = true
  }
  if (enabledFeatures.has('legacyStakeDeReg')) {
    const cred = resolveStakeCred(getMode('legacyStakeDeReg'), walletRewardAddrHex)
    addCertToBuilder(certBuilder, wasm.Certificate.new_stake_deregistration(wasm.StakeDeregistration.new(cred)), getMode('legacyStakeDeReg'))
    hasCerts = true
  }
  if (enabledFeatures.has('stakeDelegation')) {
    const cred = resolveStakeCred(getMode('stakeDelegation'), walletRewardAddrHex)
    const poolKeyHash = wasm.Ed25519KeyHash.from_hex(POOL_KEY_HASH)
    addCertToBuilder(
      certBuilder,
      wasm.Certificate.new_stake_delegation(wasm.StakeDelegation.new(cred, poolKeyHash)),
      getMode('stakeDelegation'),
    )
    hasCerts = true
  }
  if (enabledFeatures.has('conwayStakeReg')) {
    const cred = resolveStakeCred(getMode('conwayStakeReg'), walletRewardAddrHex)
    addCertToBuilder(
      certBuilder,
      wasm.Certificate.new_stake_registration(
        wasm.StakeRegistration.new_with_explicit_deposit(cred, strToBigNum('2000000')),
      ),
      getMode('conwayStakeReg'),
    )
    hasCerts = true
  }
  if (enabledFeatures.has('conwayStakeDeReg')) {
    const cred = resolveStakeCred(getMode('conwayStakeDeReg'), walletRewardAddrHex)
    addCertToBuilder(
      certBuilder,
      wasm.Certificate.new_stake_deregistration(
        wasm.StakeDeregistration.new_with_explicit_refund(cred, strToBigNum('2000000')),
      ),
      getMode('conwayStakeDeReg'),
    )
    hasCerts = true
  }
  if (enabledFeatures.has('voteDelegation')) {
    const cred = resolveStakeCred(getMode('voteDelegation'), walletRewardAddrHex)
    addCertToBuilder(
      certBuilder,
      wasm.Certificate.new_vote_delegation(
        wasm.VoteDelegation.new(cred, wasm.DRep.new_always_abstain()),
      ),
      getMode('voteDelegation'),
    )
    hasCerts = true
  }
  if (enabledFeatures.has('stakeVoteDelegation')) {
    const cred = resolveStakeCred(getMode('stakeVoteDelegation'), walletRewardAddrHex)
    const poolKeyHash = wasm.Ed25519KeyHash.from_hex(POOL_KEY_HASH)
    addCertToBuilder(
      certBuilder,
      wasm.Certificate.new_stake_and_vote_delegation(
        wasm.StakeAndVoteDelegation.new(cred, poolKeyHash, wasm.DRep.new_always_abstain()),
      ),
      getMode('stakeVoteDelegation'),
    )
    hasCerts = true
  }
  if (enabledFeatures.has('stakeRegDelegation')) {
    const cred = resolveStakeCred(getMode('stakeRegDelegation'), walletRewardAddrHex)
    const poolKeyHash = wasm.Ed25519KeyHash.from_hex(POOL_KEY_HASH)
    addCertToBuilder(
      certBuilder,
      wasm.Certificate.new_stake_registration_and_delegation(
        wasm.StakeRegistrationAndDelegation.new(cred, poolKeyHash, strToBigNum('2000000')),
      ),
      getMode('stakeRegDelegation'),
    )
    hasCerts = true
  }
  if (enabledFeatures.has('voteRegDelegation')) {
    const cred = resolveStakeCred(getMode('voteRegDelegation'), walletRewardAddrHex)
    addCertToBuilder(
      certBuilder,
      wasm.Certificate.new_vote_registration_and_delegation(
        wasm.VoteRegistrationAndDelegation.new(
          cred,
          wasm.DRep.new_always_abstain(),
          strToBigNum('2000000'),
        ),
      ),
      getMode('voteRegDelegation'),
    )
    hasCerts = true
  }
  if (enabledFeatures.has('stakeVoteRegDelegation')) {
    const cred = resolveStakeCred(getMode('stakeVoteRegDelegation'), walletRewardAddrHex)
    const poolKeyHash = wasm.Ed25519KeyHash.from_hex(POOL_KEY_HASH)
    addCertToBuilder(
      certBuilder,
      wasm.Certificate.new_stake_vote_registration_and_delegation(
        wasm.StakeVoteRegistrationAndDelegation.new(
          cred,
          poolKeyHash,
          wasm.DRep.new_always_abstain(),
          strToBigNum('2000000'),
        ),
      ),
      getMode('stakeVoteRegDelegation'),
    )
    hasCerts = true
  }
  if (enabledFeatures.has('drepRegistration')) {
    const drepCred = wasm.Credential.from_keyhash(wasm.Ed25519KeyHash.from_hex(DREP_KEY_HASH))
    certBuilder.add(
      wasm.Certificate.new_drep_registration(
        wasm.DRepRegistration.new(drepCred, strToBigNum('500000000')),
      ),
    )
    hasCerts = true
  }
  if (enabledFeatures.has('drepRetirement')) {
    const drepCred = wasm.Credential.from_keyhash(wasm.Ed25519KeyHash.from_hex(DREP_KEY_HASH))
    certBuilder.add(
      wasm.Certificate.new_drep_deregistration(
        wasm.DRepDeregistration.new(drepCred, strToBigNum('500000000')),
      ),
    )
    hasCerts = true
  }
  if (enabledFeatures.has('drepUpdate')) {
    const drepCred = wasm.Credential.from_keyhash(wasm.Ed25519KeyHash.from_hex(DREP_KEY_HASH))
    certBuilder.add(wasm.Certificate.new_drep_update(wasm.DRepUpdate.new(drepCred)))
    hasCerts = true
  }
  if (enabledFeatures.has('authCommittee')) {
    const coldCred = wasm.Credential.from_keyhash(wasm.Ed25519KeyHash.from_hex(COMMITTEE_COLD_HASH))
    const hotCred = wasm.Credential.from_keyhash(wasm.Ed25519KeyHash.from_hex(COMMITTEE_HOT_HASH))
    certBuilder.add(
      wasm.Certificate.new_committee_hot_auth(wasm.CommitteeHotAuth.new(coldCred, hotCred)),
    )
    hasCerts = true
  }
  if (enabledFeatures.has('resignCommittee')) {
    const coldCred = wasm.Credential.from_keyhash(wasm.Ed25519KeyHash.from_hex(COMMITTEE_COLD_HASH))
    certBuilder.add(
      wasm.Certificate.new_committee_cold_resign(wasm.CommitteeColdResign.new(coldCred)),
    )
    hasCerts = true
  }

  if (hasCerts) {
    txBuilder.set_certs_builder(certBuilder)
  }

  // ---- Withdrawals ----
  if (enabledFeatures.has('withdrawal')) {
    const withdrawalsBuilder = wasm.WithdrawalsBuilder.new()
    if (getMode('withdrawal') === 'script') {
      const nativeScript = getTestScriptNativeScript()
      const scriptCred = wasm.Credential.from_scripthash(nativeScript.hash())
      const scriptRewardAddr = wasm.RewardAddress.new(networkId, scriptCred)
      withdrawalsBuilder.add_with_native_script(
        scriptRewardAddr,
        strToBigNum('1500000'),
        wasm.NativeScriptSource.new(nativeScript),
      )
    } else {
      const rewardAddr = resolveRewardAddr(getMode('withdrawal'), walletRewardAddrHex, networkId)
      withdrawalsBuilder.add(rewardAddr, strToBigNum('1500000'))
    }
    txBuilder.set_withdrawals_builder(withdrawalsBuilder)
  }

  // ---- Voting Procedure ----
  if (enabledFeatures.has('votingProcedure')) {
    const votingBuilder = wasm.VotingBuilder.new()
    const drepCred = wasm.Credential.from_keyhash(wasm.Ed25519KeyHash.from_hex(DREP_KEY_HASH))
    const voter = wasm.Voter.new_drep_credential(drepCred)
    const govActionId = wasm.GovernanceActionId.new(
      wasm.TransactionHash.from_hex(FAKE_TX_HASH),
      0,
    )
    const votingProcedure = wasm.VotingProcedure.new(wasm.VoteKind.Yes)
    votingBuilder.add(voter, govActionId, votingProcedure)
    txBuilder.set_voting_builder(votingBuilder)
  }

  // ---- Required Signers ----
  if (enabledFeatures.has('requiredSigners')) {
    txBuilder.add_required_signer(wasm.Ed25519KeyHash.from_hex(REQUIRED_SIGNER_HASH))
  }

  // ---- Treasury & Donation (Conway) ----
  if (enabledFeatures.has('treasury')) {
    txBuilder.set_current_treasury_value(strToBigNum('50000000000'))
  }
  if (enabledFeatures.has('donation')) {
    txBuilder.add_treasury_donation(strToBigNum('1000000'))
  }

  // ---- Mint / Burn ----
  if (enabledFeatures.has('mint') || enabledFeatures.has('burn')) {
    const mintBuilder = wasm.MintBuilder.new()
    const mintWitness = wasm.MintWitness.new_native_script(
      wasm.NativeScriptSource.new(mintNativeScript),
    )
    if (enabledFeatures.has('mint')) {
      mintBuilder.add_asset(
        mintWitness,
        wasm.AssetName.new(Buffer.from('4d494e54', 'hex')), // 'MINT'
        wasm.Int.new(strToBigNum('1000')),
      )
    }
    if (enabledFeatures.has('burn')) {
      mintBuilder.add_asset(
        mintWitness,
        wasm.AssetName.new(Buffer.from('4255524e', 'hex')), // 'BURN'
        wasm.Int.new_negative(strToBigNum('500')),
      )
    }
    txBuilder.set_mint_builder(mintBuilder)
  }

  // ---- Special Outputs ----
  if (enabledFeatures.has('outputDatumHash')) {
    const output = wasm.TransactionOutputBuilder.new()
      .with_address(changeAddr)
      .with_data_hash(wasm.DataHash.from_hex(DATUM_HASH))
      .next()
      .with_value(wasm.Value.new(strToBigNum('3000000')))
      .build()
    txBuilder.add_output(output)
  }
  if (enabledFeatures.has('outputInlineDatum')) {
    const plutusData = wasm.PlutusData.from_bytes(hexToBytes(INLINE_DATUM_HEX))
    const output = wasm.TransactionOutputBuilder.new()
      .with_address(changeAddr)
      .with_plutus_data(plutusData)
      .next()
      .with_value(wasm.Value.new(strToBigNum('3000000')))
      .build()
    txBuilder.add_output(output)
  }
  if (enabledFeatures.has('outputRefScript')) {
    const policyKeyHash = wasm.Ed25519KeyHash.from_hex(PAYMENT_KEY_HASH)
    const nativeScript = wasm.NativeScript.new_script_pubkey(wasm.ScriptPubkey.new(policyKeyHash))
    const scriptRef = wasm.ScriptRef.new_native_script(nativeScript)
    const output = wasm.TransactionOutputBuilder.new()
      .with_address(changeAddr)
      .with_script_ref(scriptRef)
      .next()
      .with_value(wasm.Value.new(strToBigNum('5000000')))
      .build()
    txBuilder.add_output(output)
  }

  // ---- Collateral ----
  if (enabledFeatures.has('collateralInputs')) {
    const collateralInput = wasm.TransactionInput.new(
      wasm.TransactionHash.from_hex(COLLATERAL_TX_HASH),
      0,
    )
    const collateralAmount = wasm.Value.new(strToBigNum('20000000'))
    const txInputsBuilder = wasm.TxInputsBuilder.new()
    txInputsBuilder.add_key_input(
      wasm.Ed25519KeyHash.from_hex(PAYMENT_KEY_HASH),
      collateralInput,
      collateralAmount,
    )
    txBuilder.set_collateral(txInputsBuilder)
  }
  if (enabledFeatures.has('collateralReturn')) {
    txBuilder.set_collateral_return(
      wasm.TransactionOutput.new(changeAddr, wasm.Value.new(strToBigNum('10000000'))),
    )
  }
  if (enabledFeatures.has('totalCollateral')) {
    txBuilder.set_total_collateral(strToBigNum('10000000'))
  }

  // ---- Reference Inputs ----
  if (enabledFeatures.has('refInputs')) {
    txBuilder.add_reference_input(
      wasm.TransactionInput.new(wasm.TransactionHash.from_hex(REF_INPUT_TX_HASH), 0),
    )
  }

  // ---- Script Data Hash ----
  if (enabledFeatures.has('scriptDataHash')) {
    txBuilder.set_script_data_hash(wasm.ScriptDataHash.from_hex(SCRIPT_DATA_HASH))
  }

  // ---- Auxiliary Data ----
  if (enabledFeatures.has('auxDataHash')) {
    const auxData = wasm.AuxiliaryData.new()
    const metadata = wasm.GeneralTransactionMetadata.new()
    const metadataVal = wasm.encode_json_str_to_metadatum(
      JSON.stringify({testTx: 1}),
      wasm.MetadataJsonSchema.NoConversions,
    )
    metadata.insert(wasm.BigNum.from_str('0'), metadataVal)
    auxData.set_metadata(metadata)
    txBuilder.set_auxiliary_data(auxData)
  }

  // ---- Validity Interval ----
  if (enabledFeatures.has('validity')) {
    txBuilder.set_validity_start_interval_bignum(strToBigNum('100000'))
    txBuilder.set_ttl_bignum(strToBigNum('200000'))
  }

  // Coin selection from fake UTXO pool + change
  txBuilder.add_inputs_from(fakeUtxos, wasm.CoinSelectionStrategyCIP2.LargestFirstMultiAsset)
  txBuilder.add_change_if_needed(changeAddr)

  const tx = txBuilder.build_tx()
  return {
    txHex: bytesToHex(tx.to_bytes()),
    txBodyHex: bytesToHex(tx.body().to_bytes()),
  }
}
