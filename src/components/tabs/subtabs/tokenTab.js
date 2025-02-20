import {useState} from 'react'
import useYoroi from '../../../hooks/yoroiProvider'
import useWasm from '../../../hooks/useWasm'
import {hexToBytes, bytesToHex} from '../../../utils/utils'
import {
  getAddressFromBytes,
  getAssetName,
  getNativeScript,
  getPubKeyHash,
  getTransactionOutputBuilder,
  getTxBuilder,
  toInt,
} from '../../../utils/cslTools'
import {CONNECTED} from '../../../utils/connectionStates'
import InputWithLabel from '../../inputWithLabel'

const TokenTab = () => {
  const {api, connectionState} = useYoroi()
  const wasm = useWasm()
  const [currentTokenName, setCurrentTokenName] = useState('')
  const [currentTokenTicker, setCurrentTokenTicker] = useState('')
  const [currentTokenDescription, setCurrentTokenDescription] = useState('')
  const [currentQuantity, setCurrentQuantity] = useState('10')
  const [currentErrorState, setCurrentErrorState] = useState(false)
  const [tokenNameErrorState, setTokenNameErrorState] = useState(false)
  const [tokenQuantityErrorState, setTokenQuantityErrorState] = useState(false)

  const handleError = () => {
    setCurrentErrorState(true)
    setTimeout(() => setCurrentErrorState(false), 5000)
  }

  const handleEmptyTokenName = () => {
    setTokenNameErrorState(true)
    setTimeout(() => setTokenNameErrorState(false), 5000)
  }

  const handleEmptyTokenQuantity = () => {
    setTokenQuantityErrorState(true)
    setTimeout(() => setTokenQuantityErrorState(false), 5000)
  }

  const handleErrors = () => {
    if (currentErrorState) {
      return (
        <div className="text-red-500 text-2xl font-bold text-center">
          <p /> !!! The error appeared. Please check logs !!!
        </div>
      )
    } else if (tokenNameErrorState) {
      return (
        <div className="text-red-500 text-2xl font-bold text-center">
          <p /> !!! The token name is not suitable !!!
        </div>
      )
    } else if (tokenQuantityErrorState) {
      return (
        <div className="text-red-500 text-2xl font-bold text-center">
          <p /> !!! The token quantity should be not 0 (zero) !!!
        </div>
      )
    } else {
      return (<></>)
    }
  }

  const mintToken = async () => {
    const clearTokenName = currentTokenName.trim()
    if (clearTokenName.length === 0) {
      handleEmptyTokenName()
      console.error("The token name shouldn't be empty")
      return
    }

    console.log('currentQuantity', currentQuantity);
    console.log('typeof currentQuantity', typeof currentQuantity);
    if (currentQuantity === '0') {
      handleEmptyTokenQuantity()
      console.error("The token quantity shouldn't be 0(zero)")
      return
    }

    const txBuilder = getTxBuilder(wasm)

    const changeAddress = await api?.getChangeAddress()
    console.debug(`[dApp][Tokens_Tab][mint] changeAddress -> ${changeAddress}`)

    const wasmChangeAddress = getAddressFromBytes(wasm, changeAddress)
    const usedAddresses = await api?.getUsedAddresses()
    const usedAddress = getAddressFromBytes(wasm, usedAddresses[0])
    const pubkeyHash = getPubKeyHash(wasm, usedAddress)
    const wasmNativeScript = getNativeScript(wasm, pubkeyHash)

    // magic should happen here
    txBuilder.add_mint_asset_and_output_min_required_coin(
      wasmNativeScript,
      getAssetName(wasm, clearTokenName),
      toInt(wasm, currentQuantity),
      getTransactionOutputBuilder(wasm, wasmChangeAddress),
    )

    console.debug(`[dApp][Tokens_Tab][mint] getting UTxOs`)
    const hexInputUtxos = await api?.getUtxos()

    console.debug(`[dApp][Tokens_Tab][mint] preparing wasmUTxOs`)
    const wasmUtxos = wasm.TransactionUnspentOutputs.new()
    for (const hexInputUtxo of hexInputUtxos) {
      const wasmUtxo = wasm.TransactionUnspentOutput.from_bytes(hexToBytes(hexInputUtxo))
      wasmUtxos.add(wasmUtxo)
    }

    console.debug(`[dApp][Tokens_Tab][mint] adding inputs`)
    txBuilder.add_inputs_from(wasmUtxos, wasm.CoinSelectionStrategyCIP2.LargestFirstMultiAsset)
    txBuilder.add_required_signer(pubkeyHash)
    txBuilder.add_change_if_needed(wasmChangeAddress)

    const unsignedTransactionHex = bytesToHex(txBuilder.build_tx().to_bytes())
    console.debug(`[dApp][Tokens_Tab][mint] signing the tx`)

    try {
      const transactionHex = await api?.signTx({tx: unsignedTransactionHex, returnTx: true})
      console.debug(`[dApp][Tokens_Tab][mint] TransactionHex: ${transactionHex}`)
      const txId = await api.submitTx(transactionHex)
      console.debug(`[dApp][Tokens_Tab][mint] Transaction successfully submitted: ${txId}`)
    } catch (error) {
      handleError()
      console.error(error)
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
                      setCurrentTokenDescription(event.target.value)
                    }}
                  />
                  <InputWithLabel
                    inputName="Token Description"
                    inputValue={currentTokenDescription}
                    onChangeFunction={(event) => {
                      setCurrentTokenTicker(event.target.value)
                    }}
                  />
                  <InputWithLabel
                    inputName="Token Quantity"
                    type="number"
                    inputValue={currentQuantity}
                    onChangeFunction={(event) => {
                      setCurrentQuantity(event.target.value)
                    }}
                  />
                </div>
              </div>
              <div className="flex pb-5">
                <button
                  type="button"
                  className="text-white font-medium text-base rounded-lg w-full px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
                  onClick={mintToken}
                >
                  Mint
                </button>
              </div>
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
