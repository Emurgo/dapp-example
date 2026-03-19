import {useState} from 'react'
import {Buffer} from 'buffer'
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
  strToBigNum,
  toInt,
} from '../../../utils/cslTools'
import {CONNECTED} from '../../../utils/connectionStates'
import SelectWithLabel from '../../selectWithLabel'
import InputWithLabel from '../../inputWithLabel'

const NFTTab = () => {
  const imageTypes = [
    {label: 'Image_JPEG', value: 'image/jpeg'},
    {label: 'Image_PNG', value: 'image/png'},
    {label: 'Image_SVG', value: 'image/svg+xml'},
    {label: 'Image_WebP', value: 'image/webp'},
    {label: 'Image_GIF', value: 'image/gif'},
    {label: 'Image_ICO', value: 'image/x-icon'},
    {label: 'Image_TIFF', value: 'image/tiff'},
    {label: 'Audio_MP3', value: 'audio/mpeg3'},
    {label: 'Audio_OGG', value: 'audio/ogg'},
    {label: 'Audio_WAV', value: 'audio/wav'},
    {label: 'Video_AVI', value: 'video/msvideo'},
    {label: 'Video_MOV', value: 'video/quicktime'},
    {label: 'Video_MP4', value: 'video/mp4'},
    {label: 'Video_OGG', value: 'video/ogg'},
    {label: 'Video_WebM', value: 'video/webm'},
    {label: 'Video_WMV', value: 'video/x-ms-wmv'},
  ]
  const {api, connectionState} = useYoroi()
  const [currentNFTName, setCurrentNFTName] = useState('')
  const [currentImageUrl, setCurrentImageUrl] = useState('')
  const [currentDescription, setCurrentDescription] = useState('')
  const [imageType, setImageType] = useState('image/jpeg')
  const emptyTokenInfo = {
    NFTName: '',
    metadata: {
      name: '<string>',
      image: '<uri | array>',
      mediaType: imageType,
      tokenType: 'nft',
      description: '<string | array>',
      totalSupply: 1,
      files: [
        {
          name: '<string>',
          mediaType: imageType,
          src: '<uri | array>',
        },
      ],
    },
  }
  const [currentMintingInfo, setCurrentMintingInfo] = useState(emptyTokenInfo)
  const [mintingTxInfo, setMintingTxInfo] = useState([])
  const [isV2nft, setIsV2nft] = useState(false)
  const [isMoreThenOneNFT, setIsMoreThenOneNFT] = useState(false)
  const [currentErrorState, setCurrentErrorState] = useState(false)
  const [currentNFTsAmount, setCurrentNFTsAmount] = useState(1)
  const [isMetadataOpen, setIsMetadataOpen] = useState(false)

  const handleError = () => {
    setCurrentErrorState(true)
    setTimeout(() => setCurrentErrorState(false), 5000)
  }

  const handleNFTsAmount = () => {
    setIsMoreThenOneNFT(!isMoreThenOneNFT)
    console.debug(`[NFTTab] mint MoreThenOneNFT is set: ${!isMoreThenOneNFT}`)
    if (isMoreThenOneNFT === false) {
      setCurrentNFTsAmount(1)
    }
  }

  const handleNftVersionOnChange = () => {
    setIsV2nft(!isV2nft)
    console.debug(`[NFTTab] V2 is set: ${!isV2nft}`)
    setCurrentMintingInfo(emptyTokenInfo)
    setMintingTxInfo([])
    console.debug('[NFTTab] cleared the metadata and the prepared minting batch info')
  }

  const handleImageTypeChange = (event) => {
    setImageType(event.target.value)
  }

  const sliceBy64Char = (inputString) => {
    console.debug(`[NFTTab] inputString: ${JSON.stringify(inputString)}`)
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

  const _genMeta = (nftName, nftImageUrl, nftDescription) => {
    console.debug(
      `[NFTTab][_genMeta]\nnftName: ${nftName}\nnftImageUrl: ${nftImageUrl}\nnftDescription: ${nftDescription}`,
    )
    const name = nftName.replace(/ /g, '_')
    const imageUrl = sliceBy64Char(nftImageUrl)
    const description = sliceBy64Char(nftDescription)
    const newInfo = emptyTokenInfo
    newInfo.NFTName = isV2nft ? Buffer.from(name, 'utf8').toString('hex') : name
    newInfo.metadata.name = name
    newInfo.metadata.files[0].name = name
    newInfo.metadata.image = imageUrl
    newInfo.metadata.files[0].src = imageUrl
    newInfo.metadata.description = description
    console.debug(`[NFTTab][_genMeta] newInfo: ${JSON.stringify(newInfo, null, 2)}`)

    return newInfo
  }

  const generateMetadata = () => {
    const newInfo = _genMeta(currentNFTName, currentImageUrl, currentDescription)
    setCurrentMintingInfo({...currentMintingInfo, ...newInfo})
  }

  const pushMintInfo = () => {
    const newInfo = JSON.parse(JSON.stringify(currentMintingInfo))
    setMintingTxInfo((mintingTxInfo) => [...mintingTxInfo, newInfo])
  }

  const generateSeveralMetadata = () => {
    console.debug(`[NFTTab][generateSeveralMetadata] ${currentNFTsAmount} NFTs metadata will be generated`)
    const allMetadataInfo = []
    for (let index = 1; index <= currentNFTsAmount; index++) {
      const newName = currentNFTName + `_${index}`
      const newDescription = currentDescription + `_${newName}`
      // deep copy of an object
      const newInfo = JSON.parse(JSON.stringify(_genMeta(newName, currentImageUrl, newDescription)))
      allMetadataInfo.push(newInfo)
    }
    setMintingTxInfo(allMetadataInfo)
  }

  const mint = async () => {
    try {
      const txBuilder = getTxBuilder()

      const changeAddress = await api?.getChangeAddress()
      console.debug(`[NFTTab][mint] changeAddress -> ${changeAddress}`)
      const wasmChangeAddress = getAddressFromBytes(changeAddress)
      const usedAddresses = await api?.getUsedAddresses()
      const usedAddress = getAddressFromBytes(usedAddresses[0])
      const pubkeyHash = getPubKeyHash(usedAddress)
      const wasmNativeScript = getNativeScript(pubkeyHash)
      const scriptHashHex = wasmNativeScript.hash().to_hex()
      let metadata = {}
      metadata[scriptHashHex] = {}

      for (const assetInfo of mintingTxInfo) {
        metadata[scriptHashHex][assetInfo.NFTName] = assetInfo.metadata
        metadata['version'] = isV2nft ? '2.0' : '1.0'
        console.debug(`[NFTTab][mint] metadata -> ${JSON.stringify(metadata)}`)
        txBuilder.add_json_metadatum(strToBigNum('721'), JSON.stringify(metadata))
        txBuilder.add_mint_asset_and_output_min_required_coin(
          wasmNativeScript,
          getAssetName(assetInfo.metadata.name),
          toInt('1'),
          getTransactionOutputBuilder(wasmChangeAddress),
        )
      }

      console.debug(`[NFTTab][mint] getting UTxOs`)
      const hexInputUtxos = await api?.getUtxos()

      console.debug(`[NFTTab][mint] preparing wasmUTxOs`)
      const wasmUtxos = getCslUtxos(hexInputUtxos)

      console.debug(`[NFTTab][mint] adding inputs`)
      txBuilder.add_inputs_from(wasmUtxos, getLargestFirstMultiAsset())
      txBuilder.add_required_signer(pubkeyHash)
      txBuilder.add_change_if_needed(wasmChangeAddress)

      const wasmUnsignedTransaction = txBuilder.build_tx()
      const fixedTx = getFixedTxFromBytes(wasmUnsignedTransaction.to_bytes())
      console.log('[NFTTab][mint] Unsigned Tx:', fixedTx.to_hex())
      console.debug(`[NFTTab][mint] signing the tx`)
      const witnessHex = await api?.signTx(fixedTx.to_hex())
      const wasmWitnessSet = getTransactionWitnessSetFromBytes(witnessHex)
      const vkeys = wasmWitnessSet.vkeys()
      for (let i = 0; i < vkeys.len(); i++) {
        fixedTx.add_vkey_witness(vkeys.get(i))
      }
      const signedTxHex = fixedTx.to_hex()
      console.log('[NFTTab][mint] Signed Tx:', signedTxHex)
      const txId = await api?.submitTx(signedTxHex)
      console.log(`[NFTTab][mint] Transaction successfully submitted: ${txId}`)
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
              <details>
                <summary className="cursor-pointer text-white font-bold select-none">Note</summary>
                <div className="text-white text-center mt-2">
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
              </details>
              {currentErrorState && (
                <div className="text-red-500 text-2xl font-bold text-center mt-2">
                  !!! The error appeared. Please check logs !!!
                </div>
              )}
            </div>
          </div>
          <div className="grid justify-items-center py-5 px-5">
            <div className="block p-6 min-w-full rounded-lg border shadow-md bg-gray-800 border-gray-700">
              <div className="flex flex-col lg:flex-row pb-5">
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
                        id="isMoreThenOneNFT"
                        name="mintSeveralNFTCheckbox"
                        checked={isMoreThenOneNFT}
                        onChange={handleNFTsAmount}
                      />
                      <label htmlFor="isMoreThenOneNFT" className="font-bold">
                        <span /> Mint several NFTs with automatic incrementing
                      </label>
                      {isMoreThenOneNFT ? (
                        <input
                          type="number"
                          min={1}
                          max={15}
                          id="amount"
                          className="text-sm border rounded-lg block p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                          placeholder={1}
                          value={currentNFTsAmount}
                          onChange={(event) => setCurrentNFTsAmount(Number(event.target.value))}
                        />
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                  <div></div>
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
                <div className="flex-1 lg:ml-4">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="metadataJson" className="block text-sm font-medium text-gray-300">
                        Metadata JSON
                      </label>
                      <button
                        className="lg:hidden text-sm text-orange-400 hover:text-orange-300"
                        onClick={() => setIsMetadataOpen(!isMetadataOpen)}
                      >
                        {isMetadataOpen ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <div className={`${isMetadataOpen ? '' : 'hidden'} lg:block`}>
                      <textarea
                        className="w-full min-h-48 rounded bg-gray-900 text-white px-2 readonly"
                        id="metadataJson"
                        readOnly
                        value={JSON.stringify(currentMintingInfo, null, 4)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Buttons */}
              <div className="flex flex-col lg:flex-row pt-7">
                <div className="flex-1">
                  <div>
                    {isMoreThenOneNFT ? (
                      <button
                        type="button"
                        className="text-white font-medium rounded-lg text-sm sm:w-auto px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
                        onClick={generateSeveralMetadata}
                      >
                        Generate
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="text-white font-medium rounded-lg text-sm sm:w-auto px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
                        onClick={generateMetadata}
                      >
                        Generate
                      </button>
                    )}
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
                <label htmlFor="mintingBatch" className="block mb-2 text-sm font-medium text-gray-300">
                  Current Minting Batch
                </label>
                <textarea
                  className="flex-row w-full rounded bg-gray-900 text-white px-2 readonly"
                  rows="10"
                  id="mintingBatch"
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
