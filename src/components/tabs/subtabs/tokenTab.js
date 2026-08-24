import logger from '../../../utils/logger'
import {useMemo, useState} from 'react'
import useCardano from '../../../hooks/cardanoProvider'
import {getTransactionWitnessSetFromBytes} from '../../../utils/cslTools'
import {CONNECTED} from '../../../utils/connectionStates'
import {firstOrThrow} from '../../../utils/helpFunctions'
import {MAX_BATCH_SIZE, planTokenBatch} from '../../../utils/tokenBatchPlan'
import {buildBatchChunkTx, chainUtxosAfterTx} from '../../../utils/tokenBatchMint'
import InputWithLabel from '../../inputWithLabel'

const TokenTab = () => {
  const {api, connectionState} = useCardano()
  const [currentTokenName, setCurrentTokenName] = useState('')
  const [currentTokenTicker, setCurrentTokenTicker] = useState('')
  const [currentTokenDescription, setCurrentTokenDescription] = useState('')
  const [currentQuantity, setCurrentQuantity] = useState('10')
  const [isBatch, setIsBatch] = useState(false)
  const [batchSize, setBatchSize] = useState('1')
  const [cip68LastToken, setCip68LastToken] = useState(false)
  const [currentErrorState, setCurrentErrorState] = useState(false)
  const [signingRejected, setSigningRejected] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [isMinting, setIsMinting] = useState(false)
  const [batchStatus, setBatchStatus] = useState('')
  const [submittedTxIds, setSubmittedTxIds] = useState([])

  const handleError = (errorObject) => {
    if (errorObject.code === 2) {
      setSigningRejected(true)
    } else {
      setCurrentErrorState(true)
    }
    setTimeout(() => {
      setCurrentErrorState(false)
      setSigningRejected(false)
    }, 5000)
  }

  const handleValidationError = (message) => {
    setValidationError(message)
    setTimeout(() => setValidationError(''), 5000)
  }

  const handleErrors = () => {
    if (signingRejected) {
      return (
        <div className="text-red-500 text-2xl font-bold text-center">
          <p /> !!! Signing rejected !!!
        </div>
      )
    } else if (currentErrorState) {
      return (
        <div className="text-red-500 text-2xl font-bold text-center">
          <p /> !!! The error appeared. Please check logs !!!
        </div>
      )
    } else if (validationError) {
      return <div className="text-red-500 text-xl font-bold text-center">{validationError}</div>
    } else {
      return <></>
    }
  }

  // Live preview of how the entered batch will be split, or the reason it
  // cannot be minted. Reporting the reason while typing matters: the limits
  // depend on the other fields (a CIP-68 asset name loses 4 bytes to its label
  // prefix), so a name that is fine on its own can become invalid when the
  // batch size grows or CIP-68 is ticked.
  const batchPreview = useMemo(() => {
    // An untouched form is not an error to shout about — pressing Mint reports it.
    if (currentTokenName.trim().length === 0) {
      return {}
    }
    try {
      const {tokens, chunks, maxPerTx} = planTokenBatch({
        tokenName: currentTokenName,
        ticker: currentTokenTicker,
        description: currentTokenDescription,
        quantity: currentQuantity,
        isBatch,
        batchSize,
        cip68LastToken,
      })
      return {tokenCount: tokens.length, txCount: chunks.length, maxPerTx, firstName: tokens[0].assetName}
    } catch (error) {
      return {error: error.message}
    }
  }, [
    currentTokenName,
    currentTokenTicker,
    currentTokenDescription,
    currentQuantity,
    isBatch,
    batchSize,
    cip68LastToken,
  ])

  const mintTokens = async () => {
    setValidationError('')
    setSubmittedTxIds([])
    setBatchStatus('')

    let plan
    try {
      plan = planTokenBatch({
        tokenName: currentTokenName,
        ticker: currentTokenTicker,
        description: currentTokenDescription,
        quantity: currentQuantity,
        isBatch,
        batchSize,
        cip68LastToken,
      })
    } catch (error) {
      handleValidationError(error.message)
      logger.error(error)
      return
    }

    logger.debug(
      `[TokenTab][mint] ${plan.tokens.length} token(s) in ${plan.chunks.length} tx(s), max ${plan.maxPerTx} per tx`,
    )

    setIsMinting(true)
    try {
      const changeAddressHex = await api?.getChangeAddress()
      const usedAddresses = await api?.getUsedAddresses()
      const usedAddressHex = firstOrThrow(usedAddresses, 'No used address available from wallet')
      let hexUtxos = await api?.getUtxos()

      for (const [index, chunk] of plan.chunks.entries()) {
        const progress = `transaction ${index + 1} of ${plan.chunks.length}`
        setBatchStatus(`Building ${progress} (${chunk.length} token(s))...`)
        const {fixedTx, explicitOutputCount} = buildBatchChunkTx({
          chunk,
          hexUtxos,
          changeAddressHex,
          usedAddressHex,
        })
        logger.log(`[TokenTab][mint] Unsigned Tx (${progress}):`, fixedTx.to_hex())

        setBatchStatus(`Waiting for signature - ${progress}...`)
        const witnessHex = await api?.signTx(fixedTx.to_hex())
        const vkeys = getTransactionWitnessSetFromBytes(witnessHex).vkeys()
        for (let i = 0; i < vkeys.len(); i++) {
          fixedTx.add_vkey_witness(vkeys.get(i))
        }
        const signedTxHex = fixedTx.to_hex()
        logger.log(`[TokenTab][mint] Signed Tx (${progress}):`, signedTxHex)

        setBatchStatus(`Submitting ${progress}...`)
        const txId = await api?.submitTx(signedTxHex)
        logger.log(`[TokenTab][mint] Transaction successfully submitted: ${txId}`)
        setSubmittedTxIds((previous) => [...previous, txId])

        // Chain forward: the wallet still reports the spent UTxOs until this tx
        // is confirmed, so the next chunk must build on a locally updated set.
        hexUtxos = chainUtxosAfterTx({fixedTx, hexUtxos, explicitOutputCount})
      }
      setBatchStatus(`Done - ${plan.tokens.length} token(s) minted in ${plan.chunks.length} transaction(s).`)
    } catch (error) {
      setBatchStatus('Stopped - see the error above and the logs.')
      handleError(error)
      logger.error(error)
    } finally {
      setIsMinting(false)
    }
  }

  return (
    <div>
      {connectionState === CONNECTED ? (
        <>
          <div className="grid justify-items-center py-5 px-5">
            <div className="block p-6 min-w-full rounded-lg border shadow-md bg-gray-800 border-gray-700">
              <div className="text-white text-center">
                <p />
                Note: Currently the functionality of this is extremely limited, it is really only here to mint really
                basic Tokens for testing.
                <p />
                The minting policy is hardcoded to basically just use the pubkeyhash of your first used address, so all
                the tokens you mint here will have the same policy id.
                <p />
                Ticker and description are written as CIP-25 (label 721) metadata. A batch is minted into a single
                pooled output per transaction, and is split across several transactions when it does not fit into one.
                <p />
                {handleErrors()}
              </div>
            </div>
          </div>
          <div className="grid justify-items-center py-5 px-5">
            <div className="block p-6 min-w-full rounded-lg border shadow-md bg-gray-800 border-gray-700">
              <div className="flex pb-5">
                <div className="flex-1">
                  {/* Inputs */}
                  <InputWithLabel
                    inputName="Token Name"
                    inputValue={currentTokenName}
                    onChangeFunction={(event) => {
                      setCurrentTokenName(event.target.value)
                    }}
                  />
                  <InputWithLabel
                    inputName="Token Ticker"
                    inputValue={currentTokenTicker}
                    onChangeFunction={(event) => {
                      setCurrentTokenTicker(event.target.value)
                    }}
                  />
                  <InputWithLabel
                    inputName="Token Description"
                    inputValue={currentTokenDescription}
                    onChangeFunction={(event) => {
                      setCurrentTokenDescription(event.target.value)
                    }}
                  />
                  <InputWithLabel
                    inputName="Token Quantity"
                    type="number"
                    min={1}
                    inputValue={currentQuantity}
                    onChangeFunction={(event) => {
                      setCurrentQuantity(event.target.value)
                    }}
                  />
                  <div className="text-l tracking-tight text-gray-300 mt-3">
                    <input
                      type="checkbox"
                      id="isBatch"
                      name="batchCheckbox"
                      checked={isBatch}
                      onChange={() => setIsBatch(!isBatch)}
                    />
                    <label htmlFor="isBatch" className="font-bold">
                      <span /> Generate batch of different tokens
                    </label>
                    {isBatch ? (
                      <InputWithLabel
                        inputName="Number Of Tokens"
                        type="number"
                        min={1}
                        inputValue={batchSize}
                        onChangeFunction={(event) => setBatchSize(event.target.value)}
                        helpText={
                          batchPreview.tokenCount
                            ? `${batchPreview.tokenCount} token(s) starting at "${batchPreview.firstName}" - about ` +
                              `${batchPreview.maxPerTx} fit per transaction, so this needs ${batchPreview.txCount} ` +
                              `transaction(s) and ${batchPreview.txCount} signature(s). Max ${MAX_BATCH_SIZE}.`
                            : `Each token gets its index appended: name0, ticker0, "... Token 0.". Max ${MAX_BATCH_SIZE}.`
                        }
                      />
                    ) : (
                      <></>
                    )}
                  </div>
                  <div className="text-l tracking-tight text-gray-300 mt-3">
                    <input
                      type="checkbox"
                      id="cip68LastToken"
                      name="cip68Checkbox"
                      checked={cip68LastToken}
                      onChange={() => setCip68LastToken(!cip68LastToken)}
                    />
                    <label htmlFor="cip68LastToken" className="font-bold">
                      <span /> Make the last token a CIP-68 token
                    </label>
                    <p /> Mints it as a (333) fungible token plus a (100) reference token whose inline datum carries the
                    metadata. The reference token is sent to your own change address.
                  </div>
                </div>
              </div>
              {/* Single place for "this batch cannot be minted", shown while
                  typing rather than only after pressing Mint. */}
              {batchPreview.error ? (
                <div className="text-red-500 font-bold text-center pb-3">{batchPreview.error}</div>
              ) : (
                <></>
              )}
              <div className="flex pb-5">
                <button
                  type="button"
                  className="text-white font-medium text-base rounded-lg w-full px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800 disabled:bg-gray-600"
                  onClick={mintTokens}
                  disabled={isMinting || Boolean(batchPreview.error)}
                >
                  {isMinting ? 'Minting...' : 'Mint'}
                </button>
              </div>
              {batchStatus ? <div className="text-white text-center">{batchStatus}</div> : <></>}
              {submittedTxIds.length > 0 ? (
                <div className="mt-3">
                  <label htmlFor="submittedTxIds" className="block mb-2 text-sm font-medium text-gray-300">
                    Submitted Transactions
                  </label>
                  <textarea
                    className="w-full rounded bg-gray-900 text-white px-2 readonly"
                    rows="5"
                    id="submittedTxIds"
                    readOnly
                    value={submittedTxIds.join('\n')}
                  />
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
        </>
      ) : (
        <div></div>
      )}
    </div>
  )
}

export default TokenTab
