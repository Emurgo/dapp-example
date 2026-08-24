import {estimateBytesPerToken, estimateMaxTokensPerTx, planTokenBatch, splitIntoChunks} from './tokenBatchPlan'
import {protocolParams} from './networkConfig'

const baseInput = {
  tokenName: 'TestTokenRefund',
  ticker: 'TTR',
  description: 'Token to test many tokens in the refund transactions',
  quantity: '10',
  isBatch: true,
  batchSize: 2,
  cip68LastToken: false,
}

describe('planTokenBatch', () => {
  it('indexes name, ticker and description from 0 for a batch', () => {
    const {tokens} = planTokenBatch(baseInput)
    expect(tokens).toHaveLength(2)
    expect(tokens[0]).toMatchObject({
      assetName: 'TestTokenRefund0',
      ticker: 'TTR0',
      description: 'Token to test many tokens in the refund transactions. Token 0.',
      quantity: '10',
      isCip68: false,
    })
    expect(tokens[1].assetName).toBe('TestTokenRefund1')
  })

  it('keeps the entered values verbatim when batching is off', () => {
    const {tokens, chunks} = planTokenBatch({...baseInput, isBatch: false, batchSize: 5})
    expect(chunks).toHaveLength(1)
    expect(tokens).toHaveLength(1)
    expect(tokens[0]).toMatchObject({assetName: 'TestTokenRefund', ticker: 'TTR'})
    expect(tokens[0].description).toBe('Token to test many tokens in the refund transactions')
  })

  it('does not double the full stop of a description that already ends with one', () => {
    const {tokens} = planTokenBatch({...baseInput, description: 'Refund test.', batchSize: 1})
    expect(tokens[0].description).toBe('Refund test. Token 0.')
  })

  it('flags only the last token as CIP-68', () => {
    const {tokens} = planTokenBatch({...baseInput, batchSize: 3, cip68LastToken: true})
    expect(tokens.map((token) => token.isCip68)).toEqual([false, false, true])
  })

  it('splits a 200 token batch into several chunks that each respect the estimate', () => {
    const {tokens, chunks, maxPerTx} = planTokenBatch({...baseInput, batchSize: 200})
    expect(tokens).toHaveLength(200)
    expect(chunks.length).toBeGreaterThan(1)
    chunks.forEach((chunk) => expect(chunk.length).toBeLessThanOrEqual(maxPerTx))
    expect(chunks.flat()).toHaveLength(200)
  })

  it('rejects an empty name, a bad quantity and an out-of-range batch size', () => {
    expect(() => planTokenBatch({...baseInput, tokenName: '   '})).toThrow(/name/)
    expect(() => planTokenBatch({...baseInput, quantity: '0'})).toThrow(/quantity/)
    expect(() => planTokenBatch({...baseInput, quantity: '1.5'})).toThrow(/quantity/)
    expect(() => planTokenBatch({...baseInput, batchSize: 0})).toThrow(/between 1 and/)
    expect(() => planTokenBatch({...baseInput, batchSize: 1001})).toThrow(/between 1 and/)
  })

  it('rejects an asset name over 32 bytes, and over 28 bytes for the CIP-68 token', () => {
    expect(() => planTokenBatch({...baseInput, tokenName: 'A'.repeat(32), batchSize: 1})).toThrow(/32 bytes/)
    expect(() => planTokenBatch({...baseInput, tokenName: 'A'.repeat(29), batchSize: 1})).not.toThrow()
    expect(() => planTokenBatch({...baseInput, tokenName: 'A'.repeat(29), batchSize: 1, cip68LastToken: true})).toThrow(
      /28 bytes/,
    )
  })

  it('sizes the batch against the longest (highest index) name', () => {
    const short = planTokenBatch({...baseInput, batchSize: 9}).maxPerTx
    const long = planTokenBatch({...baseInput, batchSize: 200}).maxPerTx
    expect(long).toBeLessThanOrEqual(short)
  })
})

describe('estimateMaxTokensPerTx', () => {
  const sizes = {nameLength: 18, tickerLength: 5, descriptionLength: 63}

  it('keeps the estimated payload inside both protocol limits', () => {
    const maxPerTx = estimateMaxTokensPerTx({...sizes, includeCip68: false})
    expect(maxPerTx * estimateBytesPerToken(sizes)).toBeLessThan(protocolParams.maxTxSize)
    expect(maxPerTx * (sizes.nameLength + 12)).toBeLessThan(protocolParams.maxValueSize)
  })

  it('reserves room for the CIP-68 reference output', () => {
    expect(estimateMaxTokensPerTx({...sizes, includeCip68: true})).toBeLessThanOrEqual(
      estimateMaxTokensPerTx({...sizes, includeCip68: false}),
    )
  })

  it('never returns less than one token per transaction', () => {
    expect(
      estimateMaxTokensPerTx({nameLength: 32, tickerLength: 32, descriptionLength: 5000, includeCip68: true}),
    ).toBe(1)
  })
})

describe('splitIntoChunks', () => {
  it('keeps every item and never exceeds the chunk size', () => {
    expect(splitIntoChunks([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    expect(splitIntoChunks([], 3)).toEqual([])
  })
})
