import { useState } from "react";
import useYoroi from "../../../hooks/yoroiProvider";
import useWasm from "../../../hooks/useWasm";
import { hexToBytes, bytesToHex } from "../../../utils/utils";
import {
  getAddressFromBytes,
  getAssetName,
  getNativeScript,
  getPubKeyHash,
  getSignedTransaction,
  getTransactionFromBytes,
  getTransactionOutputBuilder,
  getTransactionWitnessSetFromBytes,
  getTxBuilder,
  toInt
} from "../../../utils/wasmTools";

const NFTTab = () => {
    const imageTypes = [
      {label: "JPEG", value: "image/jpeg"},
      {label: "PNG", value: "image/png"},
      {label: "SVG", value: "image/svg+xml"},
      {label: "WebP", value: "image/webp"},
      {label: "GIF", value: "image/gif"},
    ];
    const { api } = useYoroi();
    const wasm = useWasm();
    const [currentNFTName, setCurrentNFTName] = useState('');
    const [currentImageUrl, setCurrentImageUrl] = useState('');
    const [currentDescription, setCurrentDescription] = useState('');
    const [currentImageType, setImageType] = useState("image/jpeg");
    const emptyTokenInfo = {
      NFTName: "",
      metadata: {
        name: "<string>",
        image: "<uri | array>",
        mediaType: currentImageType,
        tokenType: "nft",
        description: "<string | array>",
        totalSupply: 1,
        files: [{
          name: "<string>",
          mediaType: currentImageType,
          src: "<uri | array>",
        }],
      },
    };

    const handleImagTypeChange = (event) => {
      setImageType(event.target.value);
    };

    const sliceBy64Char = (inputString) => {
        console.log(`inputString: ${JSON.stringify(inputString)}`);
        if (inputString.length <= 64) {
            return inputString;
        }
        const step = 64;
        const resultArray = [];
        for (let startIndex = 0; startIndex < inputString.length; startIndex = startIndex + step) {
            const stringSlice = inputString.slice(startIndex, startIndex + step)
            resultArray.push(stringSlice);
        }
        return resultArray;
    };

    const clearInfo = () => {
      setCurrentNFTName('');
      setCurrentImageUrl('');
      setCurrentDescription('');
    };

    const [currentMintingInfo, setCurrentMintingInfo] = useState(emptyTokenInfo);

    const [mintingTxInfo, setMintingTxInfo] = useState([]);

    const generateMetadata = () => {
        const name = currentNFTName.replace(/ /g, '_');
        const imageUrl = sliceBy64Char(currentImageUrl);
        const description = sliceBy64Char(currentDescription);
        const newInfo = emptyTokenInfo;
        newInfo.NFTName = name;
        newInfo.metadata.name = name;
        newInfo.metadata.files[0].name = name;
        newInfo.metadata.image = imageUrl;
        newInfo.metadata.files[0].src = imageUrl;
        newInfo.metadata.description = description;
        setCurrentMintingInfo({...currentMintingInfo, ...newInfo});
    };

    const pushMintInfo = () => {
        let tempMintInfo = { NFTName: "", metadata: "" };
        tempMintInfo.NFTName = currentMintingInfo.NFTName;
        tempMintInfo.metadata = currentMintingInfo.metadata;
        setMintingTxInfo(mintingTxInfo => [...mintingTxInfo, tempMintInfo]);
    };

    const mint = async () => {
        const txBuilder = getTxBuilder(wasm);

        const changeAddress = await api?.getChangeAddress();
        console.log(`changeAddress -> ${changeAddress}`);
        const wasmChangeAddress = getAddressFromBytes(wasm, changeAddress);
        const usedAddresses = await api?.getUsedAddresses();
        const usedAddress = getAddressFromBytes(wasm, usedAddresses[0]);
        const pubkeyHash = getPubKeyHash(wasm, usedAddress);
        const wasmNativeScript = getNativeScript(wasm, pubkeyHash);

        for (let i = 0; i < mintingTxInfo.length; i++) {
            let metadata = {};
            metadata[wasmNativeScript.hash().to_hex()] = {};
            metadata[wasmNativeScript.hash().to_hex()][mintingTxInfo[i].NFTName] = mintingTxInfo[i].metadata;
            metadata["version"] = "1.0";
            console.log(metadata);
            txBuilder.add_json_metadatum(wasm.BigNum.from_str("721"), JSON.stringify(metadata));
            txBuilder.add_mint_asset_and_output_min_required_coin(wasmNativeScript,
                getAssetName(wasm, mintingTxInfo[i]),
                toInt(wasm, 1),
                getTransactionOutputBuilder(wasm, wasmChangeAddress)
            )
        }

        const hexInputUtxos = await api?.getUtxos();

        const wasmUtxos = wasm.TransactionUnspentOutputs.new();
        for (let i = 0; i < hexInputUtxos.length; i++) {
            const wasmUtxo = wasm.TransactionUnspentOutput.from_bytes(hexToBytes(hexInputUtxos[i]));
            wasmUtxos.add(wasmUtxo);
        }

        txBuilder.add_inputs_from(wasmUtxos, wasm.CoinSelectionStrategyCIP2.LargestFirstMultiAsset);
        txBuilder.add_required_signer(pubkeyHash);
        txBuilder.add_change_if_needed(wasmChangeAddress);

        const unsignedTransactionHex = bytesToHex(txBuilder.build_tx().to_bytes());
        api?.signTx(unsignedTransactionHex)
            .then((witnessSetHex) => {
                const wasmWitnessSet = getTransactionWitnessSetFromBytes(wasm, witnessSetHex);
                const wasmTx = getTransactionFromBytes(wasm, unsignedTransactionHex);
                const wasmSignedTransaction = getSignedTransaction(wasm, wasmTx, wasmWitnessSet);
                const transactionHex = bytesToHex(wasmSignedTransaction.to_bytes())
                console.log(transactionHex)
                api.submitTx(transactionHex)
                    .then(txId => {
                        console.log(`Transaction successfully submitted: ${txId}`);
                    })
                    .catch(err => {
                        console.log(err);
                    })
            });
    };

    return (
        <>
            <div className="grid justify-items-center py-5 px-5">
                <div className="block p-6 min-w-full rounded-lg border shadow-md bg-gray-800 border-gray-700">
                    <div className="text-white">
                        Note: Currently the functionality of this is extremely limited, it is really only here to mint really basic NFTs for testing.
                        The minting policy is hardcoded to basically just use the pubkeyhash of your first used address, so all the NFTs you mint here
                        will have the same policy id. They're not even really NFTs, cus you can mint multiple of them. This is a work in progress and
                        will have more functionalities in the future.
                    </div>
                </div>
            </div>
            <div className="grid justify-items-center py-5 px-5">
                <div className="block p-6 min-w-full rounded-lg border shadow-md bg-gray-800 border-gray-700">
                    <div className="flex">
                        <div className="flex-1">
                           {/* Inputs */}
                           <div className="mb-6 pr-4">
                              <label htmlFor="NFTName" className="block mb-2 text-sm font-medium text-gray-300">
                                NFT Name
                              </label>
                              <input
                                type="text"
                                id="NFTName"
                                className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                                value={currentNFTName} onChange={(event) => { setCurrentNFTName(event.target.value) }}
                              />
                           </div>
                           <div className="mb-6 pr-4">
                              <label htmlFor="ImageURL" className="block mb-2 text-sm font-medium text-gray-300">
                                Image URL
                              </label>
                              <input
                                type="text"
                                id="ImageURL"
                                className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                                value={currentImageUrl} onChange={(event) => { setCurrentImageUrl(event.target.value) }}
                              />
                           </div>
                           <div className="mb-6 pr-4">
                              <label htmlFor="image-type" className="block mb-2 text-sm font-medium text-gray-300 text-white focus:ring-blue-500 focus:border-blue-500">
                                Image Type
                              </label>
                              <select
                                className="border text-sm rounded-md p-2.5 bg-gray-700 border-gray-600 text-white"
                                onChange={handleImagTypeChange} name="image-types" id="image-type">
                                {imageTypes.map((imageType, index) => (
                                  <option
                                    className="border rounded-md text-white"
                                    key={index}
                                    value={imageType.value}
                                  >
                                    {imageType.label}
                                  </option>
                                ))}
                              </select>
                           </div>
                           <div className="mb-6 pr-4">
                              <label htmlFor="Description" className="block mb-2 text-sm font-medium text-gray-300">
                                Description
                              </label>
                              <input
                                type="text"
                                id="Description"
                                className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                                value={currentDescription} onChange={(event) => { setCurrentDescription(event.target.value) }}
                              />
                          </div>
                        </div>
                        <div className="flex-1">
                           <div className="mb-6">
                              <label className="block mb-2 text-sm font-medium text-gray-300">Metadata JSON</label>
                              <textarea
                                className="flex-row w-full rounded bg-gray-900 text-white px-2 readonly"
                                rows="10"
                                readOnly
                                value={JSON.stringify(currentMintingInfo, null, 4)}>
                              </textarea>
                            </div>
                        </div>
                    </div>
                    {/* Buttons */}
                    <div className="flex">
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
                        <textarea className="flex-row w-full rounded bg-gray-900 text-white px-2 readonly" rows="10" readOnly
                            value={JSON.stringify(mintingTxInfo, null, 4)}></textarea>
                    </div>
                    <div>
                        <button type="button" className="text-white font-medium rounded-lg text-sm sm:w-auto px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
                            onClick={mint}>Mint</button>
                        <button type="button" className="text-white font-medium rounded-lg text-sm sm:w-auto mx-5 px-5 py-2.5 text-center bg-red-600 hover:bg-red-700 focus:ring-red-800"
                            onClick={() => setMintingTxInfo([])}>Clear Minting Batch</button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default NFTTab;