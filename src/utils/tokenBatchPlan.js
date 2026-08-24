import {Buffer} from 'buffer'
import {protocolParams} from './networkConfig'

// Planning for batch token minting: names, per-token metadata, and how many
// tokens fit in one transaction. Pure JS on purpose (no CSL/wasm) so the sizing
// math can be unit-tested and reasoned about on its own.

// Cardano caps an asset name at 32 bytes. A CIP-67 label prefix eats 4 of them.
export const MAX_ASSET_NAME_BYTES = 32
export const CIP67_PREFIX_BYTES = 4

// CIP-67 asset name label prefixes.
export const CIP67_REFERENCE_NFT_PREFIX = '000643b0' // (100) reference token
export const CIP67_FUNGIBLE_TOKEN_PREFIX = '0014df10' // (333) fungible user token

// Sizing constants for estimateMaxTokensPerTx. These are estimates, not exact
// CBOR measurements — SAFETY_FACTOR absorbs the error, and a too-large batch
// still fails loudly at build_tx() rather than producing an invalid tx.
const BASE_TX_BYTES = 1800 // inputs, change output, witness, native script, fee/ttl, aux hash
const CIP68_EXTRA_BYTES = 450 // extra ref-token output + inline datum + second mint entry
const VALUE_HEADROOM_BYTES = 100 // policy id + map headers inside the output value
const SAFETY_FACTOR = 0.85
export const MAX_BATCH_SIZE = 1000

const utf8Len = (value) => Buffer.byteLength(value, 'utf8')

// Bytes a single token adds to the transaction:
//  - the mint field entry and the pooled output's value entry (name + quantity)
//  - its CIP-25 label-721 entry (asset name as key, plus name/ticker/description)
export const estimateBytesPerToken = ({nameLength, tickerLength, descriptionLength}) => {
  const mintAndOutputBytes = 2 * (nameLength + 10)
  const metadataBytes = 2 * nameLength + tickerLength + descriptionLength + 30
  return mintAndOutputBytes + metadataBytes
}

// Two independent protocol limits bind: the 16 KB transaction size, and the
// max value size of the single pooled output holding every minted asset.
export const estimateMaxTokensPerTx = ({nameLength, tickerLength, descriptionLength, includeCip68}) => {
  const perToken = estimateBytesPerToken({nameLength, tickerLength, descriptionLength})
  const txBudget = protocolParams.maxTxSize - BASE_TX_BYTES - (includeCip68 ? CIP68_EXTRA_BYTES : 0)
  const byTxSize = Math.floor(txBudget / perToken)
  const byValueSize = Math.floor((protocolParams.maxValueSize - VALUE_HEADROOM_BYTES) / (nameLength + 12))
  return Math.max(1, Math.floor(SAFETY_FACTOR * Math.min(byTxSize, byValueSize)))
}

// "…refund transactions" + index 3 -> "…refund transactions. Token 3."
const indexedDescription = (description, index) => {
  const base = description.trim().replace(/\.+$/, '')
  return base.length === 0 ? `Token ${index}.` : `${base}. Token ${index}.`
}

export const splitIntoChunks = (items, chunkSize) => {
  const chunks = []
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize))
  }
  return chunks
}

/**
 * Expands the form input into the concrete tokens to mint and groups them into
 * per-transaction chunks.
 *
 * With `isBatch` false this yields exactly one token that keeps the entered
 * name/ticker/description verbatim. With `isBatch` true each token gets its
 * index appended (TestTokenRefund0, TTR0, "…. Token 0.").
 *
 * @returns {{tokens: Array, chunks: Array<Array>, maxPerTx: number}}
 * @throws {Error} on input that cannot produce a valid transaction
 */
export const planTokenBatch = ({tokenName, ticker, description, quantity, isBatch, batchSize, cip68LastToken}) => {
  const name = tokenName.trim()
  if (name.length === 0) {
    throw new Error("The token name shouldn't be empty")
  }
  const count = isBatch ? Number(batchSize) : 1
  if (!Number.isInteger(count) || count < 1 || count > MAX_BATCH_SIZE) {
    throw new Error(`The number of tokens must be a whole number between 1 and ${MAX_BATCH_SIZE}`)
  }
  if (!/^\d+$/.test(String(quantity).trim()) || Number(quantity) <= 0) {
    throw new Error('The token quantity must be a whole number greater than 0')
  }

  const tokens = []
  for (let index = 0; index < count; index++) {
    const isCip68 = cip68LastToken && index === count - 1
    const assetName = isBatch ? `${name}${index}` : name
    const nameBudget = MAX_ASSET_NAME_BYTES - (isCip68 ? CIP67_PREFIX_BYTES : 0)
    if (utf8Len(assetName) > nameBudget) {
      throw new Error(
        `Asset name "${assetName}" is ${utf8Len(assetName)} bytes — the limit here is ${nameBudget} bytes` +
          (isCip68 ? ' (a CIP-68 name also carries a 4-byte label prefix)' : ''),
      )
    }
    tokens.push({
      assetName,
      ticker: isBatch ? `${ticker.trim()}${index}` : ticker.trim(),
      description: isBatch ? indexedDescription(description, index) : description.trim(),
      quantity: String(quantity).trim(),
      isCip68,
    })
  }

  // Size against the longest token in the batch (the highest index has the most
  // digits) so every chunk is safe, not just the first.
  const longest = tokens[tokens.length - 1]
  const maxPerTx = estimateMaxTokensPerTx({
    nameLength: utf8Len(longest.assetName),
    tickerLength: utf8Len(longest.ticker),
    descriptionLength: utf8Len(longest.description),
    includeCip68: Boolean(cip68LastToken),
  })

  return {tokens, chunks: splitIntoChunks(tokens, maxPerTx), maxPerTx}
}
