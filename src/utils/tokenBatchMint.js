import {Buffer} from 'buffer'
import logger from './logger'
import {
  buildAssetOutputWithMinCoin,
  getAddressFromBytes,
  getAssetName,
  getAssetNameFromHex,
  getCip68Datum,
  getCslUtxos,
  getFixedTxFromBytes,
  getInputKeysFromBody,
  getLargestFirstMultiAsset,
  getMintBuilder,
  getMultiAssetForPolicy,
  getNativeScript,
  getNativeScriptMintWitness,
  getPubKeyHash,
  getTxBuilder,
  getUnspentOutputHex,
  getUtxoFromHex,
  strToBigNum,
  toInt,
} from './cslTools'
import {chunkMessageTo64Bytes} from './utils'
import {CIP67_FUNGIBLE_TOKEN_PREFIX, CIP67_REFERENCE_NFT_PREFIX} from './tokenBatchPlan'

// Builds the mint transaction for one chunk of a token batch. Every asset in a
// chunk lands in ONE pooled output, so the min-ada deposit is paid once per
// transaction instead of once per token.

// CIP-25 stores a field as a plain string when it fits in one 64-byte chunk, or
// as an array of <=64-byte chunks when longer. Applied to ticker and description
// (asset `name` is already capped at 32 bytes).
const sliceBy64Bytes = (value) => {
  const chunks = chunkMessageTo64Bytes(value)
  return chunks.length <= 1 ? value : chunks
}

const cip67AssetNameHex = (prefix, assetName) => `${prefix}${Buffer.from(assetName, 'utf8').toString('hex')}`

/**
 * Builds an unsigned mint transaction for one chunk of tokens.
 *
 * Build order is load-bearing: mint + metadata must be registered before
 * inputs/change so coin selection and the fee account for them.
 *
 * @returns {{fixedTx, explicitOutputCount: number, policyId: string, pubkeyHash}}
 */
export const buildBatchChunkTx = ({chunk, hexUtxos, changeAddressHex, usedAddressHex}) => {
  const wasmChangeAddress = getAddressFromBytes(changeAddressHex)
  const pubkeyHash = getPubKeyHash(getAddressFromBytes(usedAddressHex))
  const wasmNativeScript = getNativeScript(pubkeyHash)
  const wasmScriptHash = wasmNativeScript.hash()
  const policyId = wasmScriptHash.to_hex()

  const txBuilder = getTxBuilder()
  const mintBuilder = getMintBuilder()
  const mintWitness = getNativeScriptMintWitness(wasmNativeScript)

  const pooledAssets = []
  const metadata = {[policyId]: {}, version: '1.0'}
  const referenceOutputs = []

  for (const token of chunk) {
    if (token.isCip68) {
      // CIP-68: a (100) reference token carrying the metadata as an inline
      // datum, plus the (333) fungible token the user actually holds.
      const referenceAssetName = getAssetNameFromHex(cip67AssetNameHex(CIP67_REFERENCE_NFT_PREFIX, token.assetName))
      const userAssetName = getAssetNameFromHex(cip67AssetNameHex(CIP67_FUNGIBLE_TOKEN_PREFIX, token.assetName))
      mintBuilder.add_asset(mintWitness, referenceAssetName, toInt('1'))
      mintBuilder.add_asset(mintWitness, userAssetName, toInt(token.quantity))
      pooledAssets.push({assetName: userAssetName, quantity: token.quantity})
      const datum = getCip68Datum({
        name: token.assetName,
        description: token.description,
        ticker: token.ticker,
        decimals: 0,
      })
      referenceOutputs.push(
        buildAssetOutputWithMinCoin(
          wasmChangeAddress,
          getMultiAssetForPolicy(wasmScriptHash, [{assetName: referenceAssetName, quantity: '1'}]),
          datum,
        ),
      )
    } else {
      const wasmAssetName = getAssetName(token.assetName)
      mintBuilder.add_asset(mintWitness, wasmAssetName, toInt(token.quantity))
      pooledAssets.push({assetName: wasmAssetName, quantity: token.quantity})
      metadata[policyId][token.assetName] = {
        name: token.assetName,
        ticker: sliceBy64Bytes(token.ticker),
        description: sliceBy64Bytes(token.description),
      }
    }
  }

  txBuilder.set_mint_builder(mintBuilder)
  // A chunk holding only the CIP-68 token has no 721 entries — its metadata
  // lives in the reference token's datum instead.
  if (Object.keys(metadata[policyId]).length > 0) {
    logger.debug(`[tokenBatchMint] 721 metadata -> ${JSON.stringify(metadata)}`)
    txBuilder.add_json_metadatum(strToBigNum('721'), JSON.stringify(metadata))
  }

  txBuilder.add_output(
    buildAssetOutputWithMinCoin(wasmChangeAddress, getMultiAssetForPolicy(wasmScriptHash, pooledAssets)),
  )
  for (const referenceOutput of referenceOutputs) {
    txBuilder.add_output(referenceOutput)
  }
  const explicitOutputCount = 1 + referenceOutputs.length

  txBuilder.add_inputs_from(getCslUtxos(hexUtxos), getLargestFirstMultiAsset())
  txBuilder.add_required_signer(pubkeyHash)
  txBuilder.add_change_if_needed(wasmChangeAddress)

  const fixedTx = getFixedTxFromBytes(txBuilder.build_tx().to_bytes())
  return {fixedTx, explicitOutputCount, policyId, pubkeyHash}
}

/**
 * Advances the local UTxO set after a chunk is submitted: drops the inputs the
 * transaction spent and adds back its change outputs as synthetic UTxOs. The
 * wallet cannot do this for us — getUtxos() keeps reporting the pre-submission
 * set until the transaction is confirmed, so the next chunk would double-spend.
 *
 * The pooled mint output (and any CIP-68 reference outputs) are deliberately
 * NOT added back: they hold the freshly minted assets, and later chunks have
 * no reason to spend them.
 */
export const chainUtxosAfterTx = ({fixedTx, hexUtxos, explicitOutputCount}) => {
  const body = fixedTx.body()
  const spentKeys = getInputKeysFromBody(body)
  const remaining = hexUtxos.filter((hexUtxo) => {
    const utxo = getUtxoFromHex(hexUtxo)
    return !spentKeys.has(`${utxo.tx_hash}#${utxo.tx_index}`)
  })

  const outputs = body.outputs()
  if (outputs.len() <= explicitOutputCount) {
    logger.debug('[tokenBatchMint][chainUtxosAfterTx] no change output produced — nothing to chain forward')
    return remaining
  }

  // add_change_if_needed appends change after the explicit mint/reference
  // outputs. Leftover multi-assets can force several change UTxOs when one
  // would exceed maxValueSize — chain every one of them, not only the last.
  const txHashHex = fixedTx.transaction_hash().to_hex()
  for (let changeIndex = explicitOutputCount; changeIndex < outputs.len(); changeIndex++) {
    remaining.push(getUnspentOutputHex(txHashHex, changeIndex, outputs.get(changeIndex)))
  }

  return remaining
}
