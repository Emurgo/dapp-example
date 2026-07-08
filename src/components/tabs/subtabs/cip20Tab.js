import React, {useState, useEffect, useMemo} from 'react'
import Popup from 'reactjs-popup'
import useCardano from '../../../hooks/cardanoProvider'
import {CONNECTED} from '../../../utils/connectionStates'
import {hexToBytes, chunkMessageTo64Bytes} from '../../../utils/utils'
import {
  getUtxoFromHex,
  getAddressFromBech32,
  getFixedTxFromBytes,
  getTransactionWitnessSetFromBytes,
  buildCip20Tx,
  compareLovelaceDesc,
} from '../../../utils/cslTools'
import {CommonStyles} from '../../ui-constants'
import CheckboxWithLabel from '../../checkboxWithLabel'

// Reusable read-only CBOR popup with a copy button.
const RawCborPopup = ({label, value}) => (
  <Popup
    trigger={
      <button className="h-12 px-4 rounded-lg border border-gray-600 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white">
        {label}
      </button>
    }
    modal
    overlayStyle={{background: 'rgba(0,0,0,0.75)'}}
    contentStyle={{width: 'min(90vw, 560px)', border: 'none', padding: 0}}
  >
    {(close) => (
      <div className="bg-gray-900 border rounded-md border-gray-700 p-4 text-gray-300">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-white">{label}</span>
          <button
            className="rounded-md bg-red-500 hover:bg-red-700 active:bg-red-300 py-1 px-2 text-white"
            onClick={close}
          >
            &times;
          </button>
        </div>
        <textarea
          className="w-full h-48 rounded bg-gray-700 text-gray-300 px-3 py-2 break-all"
          readOnly
          value={value}
        />
        <button
          className="mt-2 rounded-lg bg-orange-700 hover:bg-orange-800 active:bg-orange-500 px-4 py-2 text-white"
          onClick={() => navigator.clipboard?.writeText(value).catch(() => {})}
        >
          Copy
        </button>
      </div>
    )}
  </Popup>
)

const Cip20Tab = () => {
  const {api, connectionState} = useCardano()

  const [hexUtxos, setHexUtxos] = useState([])
  const [decodedUtxos, setDecodedUtxos] = useState([])
  const [loadingUtxos, setLoadingUtxos] = useState(false)
  const [networkId, setNetworkId] = useState(null)

  const [receiver, setReceiver] = useState('')
  const [message, setMessage] = useState('')

  const [step, setStep] = useState('idle') // idle | constructed | signed | submitted
  const [unsignedTxHex, setUnsignedTxHex] = useState('')
  const [txDetails, setTxDetails] = useState(null)
  const [signedTxHex, setSignedTxHex] = useState('')
  const [txId, setTxId] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const [pickInputs, setPickInputs] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickedHexes, setPickedHexes] = useState(() => new Set())

  // Fetch UTxOs (and network id) when the wallet API becomes available.
  useEffect(() => {
    if (!api) return
    let cancelled = false
    setLoadingUtxos(true)
    ;(async () => {
      try {
        const hex = (await api.getUtxos()) ?? []
        if (cancelled) return
        const decoded = hex.map((h) => getUtxoFromHex(h))
        decoded.sort((a, b) => compareLovelaceDesc(a.amount, b.amount))
        setHexUtxos(hex)
        setDecodedUtxos(decoded)
        // A changed UTxO set (e.g. reconnect-in-place) invalidates picks AND any
        // pending constructed/signed tx — force a fresh Construct so we never
        // sign/submit against stale inputs (inlined rather than resetTx() to keep
        // it out of the effect deps).
        setPickedHexes(new Set())
        setPickerOpen(false)
        setStep('idle')
        setUnsignedTxHex('')
        setTxDetails(null)
        setSignedTxHex('')
        setTxId('')
        setError('')
      } catch (e) {
        if (!cancelled) setError(String(e?.message ?? e))
      } finally {
        if (!cancelled) setLoadingUtxos(false)
      }
    })()
    api
      .getNetworkId()
      .then((id) => {
        if (!cancelled) setNetworkId(id)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [api])

  // Any edit to the inputs invalidates a previously constructed/signed tx so the
  // user can never sign or submit something that differs from what's displayed.
  const resetTx = () => {
    setStep('idle')
    setUnsignedTxHex('')
    setTxDetails(null)
    setSignedTxHex('')
    setTxId('')
    setError('')
  }

  const onReceiverChange = (value) => {
    setReceiver(value)
    resetTx()
  }

  const onMessageChange = (value) => {
    setMessage(value)
    resetTx()
  }

  const hasUtxos = decodedUtxos.length > 0

  const receiverValid = useMemo(() => {
    if (!receiver) return false
    try {
      const addr = getAddressFromBech32(receiver)
      // Best-effort network match (skip if the method isn't available).
      if (networkId != null && typeof addr.network_id === 'function') {
        return addr.network_id() === networkId
      }
      return true
    } catch {
      return false
    }
  }, [receiver, networkId])

  // Lock the inputs while a sign/submit is in flight, so an edit can't slip in
  // during the async window and leave a signed/submittable tx that no longer
  // matches the displayed fields (the async counterpart to resetTx-on-edit).
  const fieldsDisabled = !hasUtxos || busy || loadingUtxos
  const canConstruct = hasUtxos && receiverValid && message.trim().length > 0 && !busy && !loadingUtxos
  // Picks still present in the CURRENT UTxO set (guards against stale picks).
  const pickCount = decodedUtxos.filter((u) => pickedHexes.has(u.hex)).length

  const handleConstruct = (picked) => {
    // Clear ALL prior tx state (incl. any stale signedTxHex/txId from a previous
    // sign) before rebuilding, so nothing downstream can reference a signature
    // that belongs to a different transaction.
    resetTx()
    try {
      const messageLines = chunkMessageTo64Bytes(message)
      const {txHex, details} = buildCip20Tx({
        hexUtxos,
        receiverBech32: receiver,
        messageLines,
        pickedHexUtxos: Array.isArray(picked) ? picked : undefined,
      })
      setUnsignedTxHex(txHex)
      setTxDetails(details)
      setStep('constructed')
    } catch (e) {
      setError(String(e?.message ?? e))
    }
  }

  const handleSign = async () => {
    setError('')
    setBusy(true)
    try {
      const witnessHex = await api.signTx(unsignedTxHex, false)
      const signedTx = getFixedTxFromBytes(hexToBytes(unsignedTxHex))
      const walletWitnessSet = getTransactionWitnessSetFromBytes(witnessHex)
      const vkeys = walletWitnessSet.vkeys()
      if (vkeys) {
        for (let i = 0; i < vkeys.len(); i++) {
          signedTx.add_vkey_witness(vkeys.get(i))
        }
      }
      setSignedTxHex(signedTx.to_hex())
      setStep('signed')
    } catch (e) {
      setError(String(e?.message ?? e))
    } finally {
      setBusy(false)
    }
  }

  const handleSubmit = async () => {
    if (!window.confirm('Submit transaction to the network?')) return
    setError('')
    setBusy(true)
    try {
      const id = await api.submitTx(signedTxHex)
      setTxId(id)
      setStep('submitted')
      // Refresh UTxOs so a follow-up Construct doesn't target inputs we just
      // spent. Best-effort — the wallet may not reflect the pending spend
      // immediately. Keep the submitted result (step/txId) visible.
      try {
        const hex = (await api.getUtxos()) ?? []
        const decoded = hex.map((h) => getUtxoFromHex(h))
        decoded.sort((a, b) => compareLovelaceDesc(a.amount, b.amount))
        setHexUtxos(hex)
        setDecodedUtxos(decoded)
        setPickedHexes(new Set())
      } catch {
        // keep last-known UTxOs if the refresh fails
      }
    } catch (e) {
      setError(String(e?.message ?? e))
    } finally {
      setBusy(false)
    }
  }

  const labelStyle = 'block mb-1 ml-1 text-base font-medium text-gray-300'
  const detailRow = (label, value) => (
    <div className="flex justify-between gap-3 border-b border-gray-800 py-1">
      <span className="text-gray-400">{label}</span>
      <span className="text-orange-500 break-all text-right">{value}</span>
    </div>
  )

  return (
    <div className="py-5 px-5 text-gray-300">
      {connectionState === CONNECTED ? (
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4">
          {/* LEFT: UTxO summary */}
          <div className="block p-5 h-fit rounded-lg border shadow-md bg-gray-900 border-gray-700">
            <span className="text-white font-semibold">UTxOs</span>
            <p className="mt-2 text-orange-500">
              {loadingUtxos ? 'Loading UTxOs…' : hasUtxos ? `Found ${decodedUtxos.length} UTxOs` : 'No UTxOs found'}
            </p>
            <CheckboxWithLabel
              currentState={pickInputs}
              onChangeFunc={(e) => {
                if (busy) return
                setPickInputs(e.target.checked)
                setPickedHexes(new Set())
                resetTx()
              }}
              name="cip20PickInputs"
              labelText="Pick inputs"
              disabled={fieldsDisabled}
            />
          </div>

          {/* MAIN: form + flow */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div>
              <label htmlFor="cip20Receiver" className={labelStyle}>
                Receiver address
              </label>
              <input
                type="text"
                id="cip20Receiver"
                className={fieldsDisabled ? CommonStyles.inputStylesDisabled : CommonStyles.inputStyles}
                placeholder="addr1..."
                value={receiver}
                disabled={fieldsDisabled}
                onChange={(e) => onReceiverChange(e.target.value)}
              />
              {receiver && !receiverValid && (
                <p className="mt-1 ml-1 text-sm text-red-400">Invalid address (or wrong network).</p>
              )}
            </div>

            <div>
              <label htmlFor="cip20Message" className={labelStyle}>
                CIP-20 message
              </label>
              <textarea
                id="cip20Message"
                rows={4}
                className={fieldsDisabled ? CommonStyles.inputStylesDisabled : CommonStyles.inputStyles}
                placeholder="Your transaction message…"
                value={message}
                disabled={fieldsDisabled}
                onChange={(e) => onMessageChange(e.target.value)}
              />
            </div>

            <button
              className={`h-12 rounded-lg text-white text-base ${
                canConstruct
                  ? 'bg-orange-700 hover:bg-orange-800 active:bg-orange-500'
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
              onClick={() => (pickInputs ? setPickerOpen(true) : handleConstruct())}
              disabled={!canConstruct}
            >
              Construct Transaction
            </button>

            {error && <div className="p-3 rounded-lg bg-red-900 text-white break-all">{error}</div>}

            {txDetails && step !== 'idle' && (
              <div className="block p-4 rounded-lg border shadow-md bg-gray-900 border-gray-700 text-sm">
                <span className="text-white font-semibold">Transaction details</span>
                <div className="mt-2">
                  {detailRow('Size', `${txDetails.sizeBytes} / 16384 bytes`)}
                  {detailRow('Fee', `${txDetails.fee} lovelace`)}
                  {detailRow('Output to receiver', `${txDetails.targetValue} lovelace`)}
                  {detailRow('Change back', `${txDetails.changeValue} lovelace`)}
                  {detailRow('Change address', txDetails.changeAddr)}
                  {detailRow('Inputs selected', String(txDetails.selectedCount))}
                </div>
              </div>
            )}

            {step === 'constructed' && (
              <div className="flex flex-wrap gap-2">
                <RawCborPopup label="Get raw CBOR" value={unsignedTxHex} />
                <button
                  className="h-12 px-4 rounded-lg text-white bg-orange-700 hover:bg-orange-800 active:bg-orange-500 disabled:bg-gray-600"
                  onClick={handleSign}
                  disabled={busy}
                >
                  Sign
                </button>
              </div>
            )}

            {step === 'signed' && (
              <div className="flex flex-wrap gap-2">
                <RawCborPopup label="Get raw signed CBOR" value={signedTxHex} />
                <button
                  className="h-12 px-4 rounded-lg text-white bg-orange-700 hover:bg-orange-800 active:bg-orange-500 disabled:bg-gray-600"
                  onClick={handleSubmit}
                  disabled={busy}
                >
                  Submit
                </button>
              </div>
            )}

            {step === 'submitted' && txId && (
              <div className="p-3 rounded-lg bg-green-900 text-white break-all">
                <span className="font-semibold">Submitted. Tx ID: </span>
                {txId}
              </div>
            )}

            {/* Input picker (only relevant when "Pick inputs" is checked) */}
            <Popup
              open={pickerOpen}
              onClose={() => setPickerOpen(false)}
              modal
              overlayStyle={{background: 'rgba(0,0,0,0.75)'}}
              contentStyle={{
                width: 'min(90vw, 640px)',
                maxHeight: '90vh',
                overflowY: 'auto',
                border: 'none',
                padding: 0,
              }}
            >
              <div className="bg-gray-900 border rounded-md border-gray-700 p-4 text-gray-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-white">Select input UTxOs</span>
                  <button
                    className="rounded-md bg-red-500 hover:bg-red-700 active:bg-red-300 py-1 px-2 text-white"
                    onClick={() => setPickerOpen(false)}
                  >
                    &times;
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {decodedUtxos.map((u) => {
                    const assetCount = u.asset.reduce((n, o) => n + Object.keys(o).length, 0)
                    return (
                      <label
                        key={`${u.tx_hash}:${u.tx_index}`}
                        className="flex items-start gap-2 cursor-pointer rounded border border-gray-700 p-2 hover:bg-gray-800"
                      >
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={pickedHexes.has(u.hex)}
                          onChange={() => {
                            setPickedHexes((prev) => {
                              const next = new Set(prev)
                              if (next.has(u.hex)) next.delete(u.hex)
                              else next.add(u.hex)
                              return next
                            })
                            // A pick change invalidates any pending constructed/signed
                            // tx (same rule as receiver/message edits and refetch).
                            resetTx()
                          }}
                        />
                        <div className="min-w-0">
                          <div className="font-mono text-xs break-all text-gray-300">
                            {u.tx_hash}:{u.tx_index}
                          </div>
                          <div className="text-orange-500 text-sm">
                            {Number(u.amount) / 1e6} ADA · {assetCount} asset{assetCount === 1 ? '' : 's'}
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
                <button
                  className={`mt-4 w-full h-11 rounded-lg text-white ${
                    pickCount > 0
                      ? 'bg-orange-700 hover:bg-orange-800 active:bg-orange-500'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                  disabled={pickCount === 0}
                  onClick={() => {
                    setPickerOpen(false)
                    handleConstruct(decodedUtxos.filter((u) => pickedHexes.has(u.hex)).map((u) => u.hex))
                  }}
                >
                  Continue ({pickCount} selected)
                </button>
              </div>
            </Popup>
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  )
}

export default Cip20Tab
