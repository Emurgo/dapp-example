import {useState} from 'react'
import useYoroi from '../../../hooks/yoroiProvider'
import {
  getAddressFromBytes,
  getAssetName,
  getCslUtxos,
  getFixedTxFromBytes,
  getLargestFirstMultiAsset,
  getNativeScript,
  getPubKeyHash,
  getTransactionOutputBuilder,
  getTransactionWitnessSetFromBytes,
  getTxBuilder,
  toInt,
} from '../../../utils/cslTools'
import {CONNECTED} from '../../../utils/connectionStates'
import InputWithLabel from '../../inputWithLabel'

const TokenTab = () => {
  const {api, connectionState} = useYoroi()
  const [currentTokenName, setCurrentTokenName] = useState('')
  const [currentTokenTicker, setCurrentTokenTicker] = useState('')
  const [currentTokenDescription, setCurrentTokenDescription] = useState('')
  const [currentQuantity, setCurrentQuantity] = useState('10')
  const [currentErrorState, setCurrentErrorState] = useState(false)
  const [signingRejected, setSigningRejected] = useState(false)
  const [tokenNameErrorState, setTokenNameErrorState] = useState(false)
  const [tokenQuantityErrorState, setTokenQuantityErrorState] = useState(false)

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

  const handleEmptyTokenName = () => {
    setTokenNameErrorState(true)
    setTimeout(() => setTokenNameErrorState(false), 5000)
  }

  const handleEmptyTokenQuantity = () => {
    setTokenQuantityErrorState(true)
    setTimeout(() => setTokenQuantityErrorState(false), 5000)
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
    } else if (tokenNameErrorState) {
      return (
        <div className="text-red-500 text-2xl font-bold text-center">
          <p /> !!! The token name is not suitable !!!
        </div>
      )
    } else if (tokenQuantityErrorState) {
      return (
        <div className="text-red-500 text-2xl font-bold text-center">
          <p /> !!! The token quantity is not suitable !!!
        </div>
      )
    } else {
      return <></>
    }
  }

  const mintToken = async () => {
    const clearTokenName = currentTokenName.trim()
    if (clearTokenName.length === 0) {
      handleEmptyTokenName()
      console.error("The token name shouldn't be empty")
      return
    }

    if (currentQuantity === '0') {
      handleEmptyTokenQuantity()
      console.error("The token quantity isn't suitable")
      return
    }
    let quantityInt = 0
    try {
      quantityInt = toInt(currentQuantity)
    } catch (error) {
      handleEmptyTokenQuantity()
      console.error(error)
      return
    }

    const txBuilder = getTxBuilder()

    const changeAddress = await api?.getChangeAddress()
    console.debug(`[dApp][Tokens_Tab][mint] changeAddress -> ${changeAddress}`)

    const wasmChangeAddress = getAddressFromBytes(changeAddress)
    try {
      const usedAddresses = await api?.getUsedAddresses()
      const usedAddress = getAddressFromBytes(usedAddresses[0])
      const pubkeyHash = getPubKeyHash(usedAddress)
      const wasmNativeScript = getNativeScript(pubkeyHash)

      // magic should happen here
      txBuilder.add_mint_asset_and_output_min_required_coin(
        wasmNativeScript,
        getAssetName(clearTokenName),
        quantityInt,
        getTransactionOutputBuilder(wasmChangeAddress),
      )

      console.debug(`[TokenTab][mint] getting UTxOs`)
      const hexInputUtxos = await api?.getUtxos()

      console.debug(`[TokenTab][mint] preparing wasmUTxOs`)
      const wasmUtxos = getCslUtxos(hexInputUtxos)

      console.debug(`[TokenTab][mint] adding inputs`)
      txBuilder.add_inputs_from(wasmUtxos, getLargestFirstMultiAsset())
      txBuilder.add_required_signer(pubkeyHash)
      txBuilder.add_change_if_needed(wasmChangeAddress)
      
      const wasmUnsignedTransaction = txBuilder.build_tx()
      const fixedTx = getFixedTxFromBytes(wasmUnsignedTransaction.to_bytes())
      console.log('[TokenTab] Unsigned Tx:', fixedTx.to_hex())
      console.debug(`[TokenTab][mint] signing the tx`)
      const witnessHex = await api?.signTx(fixedTx.to_hex())
      const wasmWitnessSet = getTransactionWitnessSetFromBytes(witnessHex)
      const vkeys = wasmWitnessSet.vkeys()
      for (let i = 0; i < vkeys.len(); i++) {
        fixedTx.add_vkey_witness(vkeys.get(i))
      }
      const signedTxHex = fixedTx.to_hex()
      console.log('[TokenTab][mint] Signed Tx:', signedTxHex)
      const txId = await api?.submitTx(signedTxHex)
      console.log(`[TokenTab][mint] Transaction successfully submitted: ${txId}`)
    } catch (error) {
      handleError(error)
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
