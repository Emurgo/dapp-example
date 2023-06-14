import {useState} from 'react'
import {Buffer} from 'buffer'
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
} from '../../../utils/wasmTools'
import {CONNECTED} from '../../../utils/connectionStates'
import SelectWithLabel from '../../selectWithLabel'
import InputWithLabel from '../../inputWithLabel'

const NFTTab = () => {
  const imageTypes = [
    {label: 'JPEG', value: 'image/jpeg'},
    {label: 'PNG', value: 'image/png'},
    {label: 'SVG', value: 'image/svg+xml'},
    {label: 'WebP', value: 'image/webp'},
    {label: 'GIF', value: 'image/gif'},
  ]
  const {api, connectionState} = useYoroi()
  const wasm = useWasm()
  const [currentNFTName, setCurrentNFTName] = useState('')
  const [currentImageUrl, setCurrentImageUrl] = useState('')
  const [currentDescription, setCurrentDescription] = useState('')
  const [currentImageType, setImageType] = useState('image/jpeg')
  const [isV2nft, setV2nft] = useState(false)
  const [currentErrorState, setCurrentErrorState] = useState(false)

  const handleError = () => {
    setCurrentErrorState(true)
    setTimeout(() => setCurrentErrorState(false), 5000)
  }

  const emptyTokenInfo = {
    NFTName: '',
    metadata: {
      name: '<string>',
      image: '<uri | array>',
      mediaType: currentImageType,
      tokenType: 'nft',
      description: '<string | array>',
      totalSupply: 1,
      files: [
        {
          name: '<string>',
          mediaType: currentImageType,
          src: '<uri | array>',
        },
      ],
    },
  }

  const handleNftVersionOnChange = () => {
    setV2nft(!isV2nft)
    console.log(`[dApp][NFT_Tab] V2 is set: ${!isV2nft}`)
    setCurrentMintingInfo(emptyTokenInfo)
    setMintingTxInfo([])
    console.log('[dApp][NFT_Tab] cleared the metadata and the prepared minting batch info')
  }

  const handleImageTypeChange = (event) => {
    setImageType(event.target.value)
  }

  const sliceBy64Char = (inputString) => {
    console.log(`[dApp][NFT_Tab] inputString: ${JSON.stringify(inputString)}`)
    if (inputString.length <= 64) {
      return inputString
    }
    const step = 64
    const resultArray = []
    for (let startIndex = 0; startIndex < inputString.length; startIndex = startIndex + step) {
      const stringSlice = inputString.slice(startIndex, startIndex + step)
      resultArray.push(stringSlice)
    }
    return resultArray
  }

  const clearInfo = () => {
    setCurrentNFTName('')
    setCurrentImageUrl('')
    setCurrentDescription('')
  }

  const [currentMintingInfo, setCurrentMintingInfo] = useState(emptyTokenInfo)

  const [mintingTxInfo, setMintingTxInfo] = useState([])

  const generateMetadata = () => {
    const name = currentNFTName.replace(/ /g, '_')
    const imageUrl = sliceBy64Char(currentImageUrl)
    const description = sliceBy64Char(currentDescription)
    const newInfo = emptyTokenInfo
    newInfo.NFTName = isV2nft ? Buffer.from(name, 'utf8').toString('hex') : name
    newInfo.metadata.name = name
    newInfo.metadata.files[0].name = name
    newInfo.metadata.image = imageUrl
    newInfo.metadata.files[0].src = imageUrl
    newInfo.metadata.description = description
    setCurrentMintingInfo({...currentMintingInfo, ...newInfo})
  }

  const pushMintInfo = () => {
    let tempMintInfo = {NFTName: '', metadata: ''}
    tempMintInfo.NFTName = currentMintingInfo.NFTName
    tempMintInfo.metadata = currentMintingInfo.metadata
    setMintingTxInfo((mintingTxInfo) => [...mintingTxInfo, tempMintInfo])
  }

  const mint = async () => {
    const txBuilder = getTxBuilder(wasm)

    const changeAddress = await api?.getChangeAddress()
    console.log(`[dApp][NFT_Tab][mint] changeAddress -> ${changeAddress}`)
    const wasmChangeAddress = getAddressFromBytes(wasm, changeAddress)
    const usedAddresses = await api?.getUsedAddresses()
    const usedAddress = getAddressFromBytes(wasm, usedAddresses[0])
    const pubkeyHash = getPubKeyHash(wasm, usedAddress)
    const wasmNativeScript = getNativeScript(wasm, pubkeyHash)
    const scriptHashHex = wasmNativeScript.hash().to_hex()
    let metadata = {}
    metadata[scriptHashHex] = {}

    for (const assetInfo of mintingTxInfo) {
      metadata[scriptHashHex][assetInfo.NFTName] = assetInfo.metadata
      metadata['version'] = isV2nft ? '2.0' : '1.0'
      console.log(`[dApp][NFT_Tab][mint] metadata -> ${JSON.stringify(metadata)}`)
      txBuilder.add_json_metadatum(wasm.BigNum.from_str('721'), JSON.stringify(metadata))
      txBuilder.add_mint_asset_and_output_min_required_coin(
        wasmNativeScript,
        getAssetName(wasm, assetInfo.metadata.name),
        toInt(wasm, 1),
        getTransactionOutputBuilder(wasm, wasmChangeAddress),
      )
    }

    const hexInputUtxos = await api?.getUtxos()

    const wasmUtxos = wasm.TransactionUnspentOutputs.new()
    for (const hexInputUtxo of hexInputUtxos) {
      const wasmUtxo = wasm.TransactionUnspentOutput.from_bytes(hexToBytes(hexInputUtxo))
      wasmUtxos.add(wasmUtxo)
    }

    txBuilder.add_inputs_from(wasmUtxos, wasm.CoinSelectionStrategyCIP2.LargestFirstMultiAsset)
    txBuilder.add_required_signer(pubkeyHash)
    txBuilder.add_change_if_needed(wasmChangeAddress)

    const unsignedTransactionHex = bytesToHex(txBuilder.build_tx().to_bytes())
    api?.signTx({tx: unsignedTransactionHex, returnTx: true}).then((transactionHex) => {
      console.log(`[dApp][NFT_Tab][mint] TransactionHex: ${transactionHex}`)
      api
        .submitTx(transactionHex)
        .then((txId) => {
          console.log(`[dApp][NFT_Tab][mint] Transaction successfully submitted: ${txId}`)
        })
        .catch((err) => {
          handleError()
          console.error(err)
        })
    })
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
                basic NFTs for testing.
                <p />
                The minting policy is hardcoded to basically just use the pubkeyhash of your first used address, so all
                the NFTs you mint here will have the same policy id.
                <p />
                They're not even really NFTs, cuz you can mint multiple of them. This is a work in progress and will
                have more functionalities in the future.
              </div>
              {currentErrorState ? (
                <div className="text-red-500 text-2xl font-bold text-center">
                  <p /> !!! The error appeared. Please check logs !!!
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="grid justify-items-center py-5 px-5">
            <div className="block p-6 min-w-full rounded-lg border shadow-md bg-gray-800 border-gray-700">
              <div className="flex pb-5">
                <div className="flex-1">
                  {/* Inputs */}
                  <InputWithLabel
                    inputName="NFT Name"
                    inputValue={currentNFTName}
                    onChangeFunction={(event) => {
                      setCurrentNFTName(event.target.value)
                    }}
                  />
                  <InputWithLabel
                    inputName="Image URL"
                    inputValue={currentImageUrl}
                    onChangeFunction={(event) => {
                      setCurrentImageUrl(event.target.value)
                    }}
                  />
                  <SelectWithLabel
                    selectName="Image Type"
                    selectArray={imageTypes}
                    onChangeFunction={handleImageTypeChange}
                  />
                  <InputWithLabel
                    inputName="Description"
                    inputValue={currentDescription}
                    onChangeFunction={(event) => {
                      setCurrentDescription(event.target.value)
                    }}
                  />
                  <div className="text-l tracking-tight text-gray-300">
                    <div>
                      <input
                        type="checkbox"
                        id="isV2nft"
                        name="v2Checkbox"
                        checked={isV2nft}
                        onChange={handleNftVersionOnChange}
                      />
                      <label htmlFor="isV2nft" className="font-bold">
                        <span /> V2
                      </label>
                      <p /> If this checkbox isn't selected the NFT V1 will be minted
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="mb-6 h-full">
                    <label className="block mb-2 text-sm font-medium text-gray-300">Metadata JSON</label>
                    <textarea
                      className="flex-1 w-full h-full rounded bg-gray-900 text-white px-2 readonly"
                      readOnly
                      value={JSON.stringify(currentMintingInfo, null, 4)}
                    ></textarea>
                  </div>
                </div>
              </div>
              {/* Buttons */}
              <div className="flex pt-7">
                <div className="flex-1">
                  <div>
                    <button
                      type="button"
                      className="text-white font-medium rounded-lg text-sm sm:w-auto px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
                      onClick={generateMetadata}
                    >
                      Generate
                    </button>
                    <button
                      type="button"
                      className="text-white font-medium rounded-lg text-sm sm:w-auto mx-5 px-5 py-2.5 text-center bg-red-600 hover:bg-red-700 focus:ring-red-800"
                      onClick={clearInfo}
                    >
                      Clear Info
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <div>
                    <button
                      type="button"
                      className="text-white font-medium rounded-lg text-sm sm:w-auto px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
                      onClick={pushMintInfo}
                    >
                      Add Mint Instructions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid justify-items-center py-5 px-5">
            <div className="block p-6 min-w-full rounded-lg border shadow-md bg-gray-800 border-gray-700">
              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-300">Current Minting Batch</label>
                <textarea
                  className="flex-row w-full rounded bg-gray-900 text-white px-2 readonly"
                  rows="10"
                  readOnly
                  value={JSON.stringify(mintingTxInfo, null, 4)}
                ></textarea>
              </div>
              <div>
                <button
                  type="button"
                  className="text-white font-medium rounded-lg text-sm sm:w-auto px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
                  onClick={mint}
                >
                  Mint
                </button>
                <button
                  type="button"
                  className="text-white font-medium rounded-lg text-sm sm:w-auto mx-5 px-5 py-2.5 text-center bg-red-600 hover:bg-red-700 focus:ring-red-800"
                  onClick={() => setMintingTxInfo([])}
                >
                  Clear Minting Batch
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

export default NFTTab
