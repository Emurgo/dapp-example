import { useEffect, useState } from 'react';
import useYoroi from "../../../hooks/yoroiProvider";
import useWasm from "../../../hooks/useWasm";
import { bytesToHex, hexToBytes } from '../../../utils/utils';

const ContractTab = () => {
    const [contractInfo, setContractInfo] = useState({ contractAddress: "", contractHex: "" })

    useEffect(() => {
        setContractInfo({
            contractAddress: localStorage.getItem("contractAddress"),
            contractHex: localStorage.getItem("contractHex")
        })
    }, [])

    return (
        <>
            <ContractSave contractInfo={contractInfo} setContractInfo={setContractInfo} />
            <div className="grid grid-cols-2 py-5 px-5">
                <SendToContract contractInfo={contractInfo} />
                <RedeemFromContract contractInfo={contractInfo} />
            </div>
        </>
    );
}

const ContractSave = ({ contractInfo, setContractInfo }) => {
    const [contractSaveText, setContractSaveText] = useState("")

    const saveContract = () => {
        localStorage.setItem("contractAddress", contractInfo.contractAddress)
        localStorage.setItem("contractHex", contractInfo.contractHex)
        setContractSaveText("Contract Saved")
    }

    return (
        <>
            <div className="grid justify-items-center py-5 px-5">
                <div className="block p-6 min-w-full rounded-lg border shadow-md bg-gray-800 border-gray-700">
                    <div className="mb-6">
                        <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-300">Contract Address</label>
                        <input type="text" id="address" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                            value={contractInfo.contractAddress} onChange={(event) => { setContractInfo({ ...contractInfo, contractAddress: event.target.value }) }} />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="hex" className="block mb-2 text-sm font-medium text-gray-300">Contract Hex</label>
                        <input type="text" id="hex" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                            value={contractInfo.contractHex} onChange={(event) => { setContractInfo({ ...contractInfo, contractHex: event.target.value }) }} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <button type="button" className="text-white font-medium rounded-lg text-sm sm:w-auto px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
                                onClick={saveContract}>Save</button>
                        </div>
                        <div>
                            <div className="flex-grow">
                                <textarea className="w-full h-full flex-row rounded bg-gray-900 text-white px-2 resize-none" disabled readOnly value={contractSaveText}></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

const SendToContract = ({ contractInfo }) => {
    const { api } = useYoroi()
    const wasm = useWasm()

    const [sendTxInfo, setSendTxInfo] = useState({
        value: {
            ada: "",
            assets: []
        },
        datum: ""
    })
    const [inlineDatum, setInlineDatum] = useState(true)
    const [inlineScript, setInlineScript] = useState(false)
    const [showAssetModal, setShowAssetModal] = useState(false)
    const [currentAssetInfo, setCurrentAssetInfo] = useState({ policyId: "", name: "", amount: "0" })

    const pushAsset = () => {
        const sendTxInfoCopy = { ...sendTxInfo }
        sendTxInfoCopy.value.assets.push(currentAssetInfo)
        setSendTxInfo(sendTxInfoCopy)
    }

    const sendToContract = async () => {
        const txBuilder = wasm?.TransactionBuilder.new(
            wasm.TransactionBuilderConfigBuilder.new()
                .fee_algo(
                    wasm.LinearFee.new(
                        wasm.BigNum.from_str("44"),
                        wasm.BigNum.from_str("155381")
                    )
                )
                .coins_per_utxo_word(wasm.BigNum.from_str('34482'))
                .pool_deposit(wasm.BigNum.from_str('500000000'))
                .key_deposit(wasm.BigNum.from_str('2000000'))
                .ex_unit_prices(wasm.ExUnitPrices.new(
                    wasm.UnitInterval.new(wasm.BigNum.from_str("577"), wasm.BigNum.from_str("10000")),
                    wasm.UnitInterval.new(wasm.BigNum.from_str("721"), wasm.BigNum.from_str("10000000"))
                ))
                .max_value_size(5000)
                .max_tx_size(16384)
                .build()
        )

        // build output value, so we can do utxo selection for it.
        const wasmValue = wasm.Value.new(wasm.BigNum.from_str(sendTxInfo.value.ada))
        const wasmMultiasset = wasm.MultiAsset.new()
        const wasmAssets = wasm.Assets.new()
        for (let i = 0; i < sendTxInfo.value.assets.length; i++) {
            const assetInfo = sendTxInfo.value.assets[i]
            wasmAssets.insert(wasm.AssetName.new(hexToBytes(assetInfo.name)), wasm.BigNum.from_str(assetInfo.amount))
            wasmMultiasset.insert(wasm.ScriptHash.from_bytes(hexToBytes(assetInfo.policyId)), wasmAssets)
        }
        wasmValue.set_multiasset(wasmMultiasset)

        // put the calculated value in the output first
        const contractAddress = contractInfo.contractAddress
        const wasmContractAddress = wasm.Address.from_bech32(contractAddress)
        const wasmOutput = wasm.TransactionOutput.new(
            wasmContractAddress,
            wasmValue
        )

        // build the actual output, we need the output's Datum and the value. Then we output it all to the script's address
        const wasmDatum = wasm.encode_json_str_to_plutus_datum(JSON.stringify(sendTxInfo.datum))

        if (inlineDatum) {
            wasmOutput.set_plutus_data(wasmDatum)
        } else {
            wasmOutput.set_data_hash(wasm.hash_plutus_data(wasmDatum))
        }

        if (inlineScript) {
            wasmOutput.set_script_ref(wasm.ScriptRef.new_plutus_script(wasm.PlutusScript.from_hex(contractInfo.contractHex)))
        }

        txBuilder.add_output(wasmOutput)

        // We want to build the inputs for this output, we can use the `add_inputs_from` function which can be used for UTXO selection
        // the function also takes fees into account fees
        // First, Yoroi API can grab all UTXOs in your wallet
        const hexInputUtxos = await api.getUtxos()

        // create a new TransactionUnspentOutputs object and insert all UTXOs into it
        const wasmUtxos = wasm.TransactionUnspentOutputs.new()
        for (let i = 0; i < hexInputUtxos.length; i++) {
            const wasmUtxo = wasm.TransactionUnspentOutput.from_bytes(hexToBytes(hexInputUtxos[i]))
            wasmUtxos.add(wasmUtxo)
        }

        // Then `add_inputs_from` can perform UTXO selection, we'll use the LargestFirst strategy for now
        txBuilder.add_inputs_from(wasmUtxos, wasm.CoinSelectionStrategyCIP2.LargestFirstMultiAsset)

        // Handle change and fees
        const hexChangeAddress = await api.getChangeAddress()
        const wasmChangeAddress = wasm.Address.from_bytes(hexToBytes(hexChangeAddress))
        txBuilder.add_change_if_needed(wasmChangeAddress)

        // Build the unsigned transaction
        const unsignedTransactionHex = bytesToHex(txBuilder.build_tx().to_bytes())

        // Then we can use the Yoroi API to sign the transaction to get the final witness set
        api?.signTx(unsignedTransactionHex)
            .then((witnessSetHex) => {
                const wasmWitnessSet = wasm.TransactionWitnessSet.from_bytes(
                    hexToBytes(witnessSetHex)
                )
                const wasmTx = wasm.Transaction.from_bytes(
                    hexToBytes(unsignedTransactionHex)
                )
                const wasmSignedTransaction = wasm.Transaction.new(
                    wasmTx.body(),
                    wasmWitnessSet,
                    wasmTx.auxiliary_data()
                )
                const transactionHex = bytesToHex(wasmSignedTransaction.to_bytes())
                console.log(transactionHex)
                api.submitTx(transactionHex)
                    .then(txId => {
                        console.log(`Transaction successfully submitted: ${txId}`)
                    })
                    .catch(err => {
                        console.log(err)
                    })
            })
    }

    return (
        <>
            <div className="block p-6 min-w-full rounded-lg border shadow-md bg-gray-800 border-gray-700">
                <div className="mb-6">
                    <label htmlFor="ada" className="block mb-2 text-sm font-medium text-gray-300">Lovelaces Value</label>
                    <input type="text" id="ada" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                        value={sendTxInfo.value.ada} onChange={(event) => { setSendTxInfo({ ...sendTxInfo, value: { ...sendTxInfo.value, ada: event.target.value } }) }} />
                </div>
                <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-300">Datum JSON</label>
                    <textarea className="flex-row w-full rounded bg-gray-900 text-white px-2" value={sendTxInfo.datum}
                        onChange={(event) => { setSendTxInfo({ ...sendTxInfo, datum: event.target.value }) }}></textarea>
                </div>
                <div className="flex items-start mb-6">
                    <div className="flex items-center h-5">
                        <input id="inline-datum-check" type="checkbox" defaultChecked={inlineDatum} value={inlineDatum} onChange={() => setInlineDatum(!inlineDatum)} className="w-4 h-4 bg-gray-50 rounded border border-gray-300 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" />
                    </div>
                    <label htmlFor="inline-datum-check" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Inline Datum</label>
                    <div className="flex items-center h-5 pl-5">
                        <input id="inline-script-check" type="checkbox" defaultChecked={inlineScript} value={inlineScript} onChange={() => setInlineScript(!inlineScript)} className="w-4 h-4 bg-gray-50 rounded border border-gray-300 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" />
                    </div>
                    <label htmlFor="inline-script-check" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Inline Script</label>
                </div>

                {sendTxInfo.value.assets.map((v, idx) => {
                    return (
                        <div className="bg-gray-900 grid gap-6 md:grid-cols-2 px-5 py-5">
                            <textarea className="flex-row w-full rounded bg-gray-900 text-white px-2 resize-none" disabled readOnly value={JSON.stringify(v)} key={idx}></textarea>
                            <button
                                className="bg-red-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                type="button"
                                onClick={() => {
                                    const sendTxInfoCopy = { ...sendTxInfo }
                                    sendTxInfoCopy.value.assets.splice(idx, 1)
                                    setSendTxInfo(sendTxInfoCopy)
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    )
                })}
                <div className="grid justify-items-center pb-2 py-3">
                    <button className="block text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-gray-600 hover:bg-gray-700 focus:ring-gray-800" type="button"
                        onClick={() => setShowAssetModal(!showAssetModal)} >
                        Add Assets
                    </button >
                    {showAssetModal &&
                        <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full">
                            <div
                                className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
                            >
                                <div className="relative w-auto my-6 mx-auto max-w-3xl">
                                    {/*content*/}
                                    <div className="bg-gray-900 border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                                        {/*header*/}
                                        <div className="bg-gray-900 flex items-start justify-between p-5 rounded-t">
                                            <h3 className="text-3xl font-semibold text-white">
                                                Asset
                                            </h3>
                                            <button
                                                className="p-1 ml-auto bg-transparent border-0 text-white float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                                                onClick={() => setShowAssetModal(false)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                        {/*body*/}
                                        <div className="bg-gray-900 grid gap-6 md:grid-cols-2 px-5 py-5 ">
                                            <div>
                                                <label htmlFor="policyId" className="block mb-2 text-sm font-medium text-gray-300">Policy Id (in hex)</label>
                                                <input type="text" id="policyId" className="appearance-none border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                                                    value={currentAssetInfo.policyId} onChange={(event) => setCurrentAssetInfo({ ...currentAssetInfo, policyId: event.target.value })} />
                                            </div>
                                            <div>
                                                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-300">Name (in hex)</label>
                                                <input type="text" id="name" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                                                    value={currentAssetInfo.name} onChange={(event) => setCurrentAssetInfo({ ...currentAssetInfo, name: event.target.value })} />
                                            </div>
                                        </div>
                                        <div className="bg-gray-900 px-5">
                                            <div>
                                                <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-300">Amount</label>
                                                <input type="number" min="0" id="amount" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                                                    value={currentAssetInfo.amount} onChange={(event) => setCurrentAssetInfo({ ...currentAssetInfo, amount: event.target.value })} />
                                            </div>
                                        </div>
                                        {/*footer*/}
                                        <div className="bg-gray-900 flex items-center justify-end p-6 rounded-b">
                                            <button
                                                className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                                type="button"
                                                onClick={() => pushAsset()}
                                            >
                                                Add Asset
                                            </button>
                                            <button
                                                className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                                type="button"
                                                onClick={() => setShowAssetModal(false)}
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>}
                </div>
                <div>
                    <button type="button" className="text-white font-medium rounded-lg text-sm sm:w-auto px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
                        onClick={sendToContract}>Send To Contract</button>
                </div>
            </div>
        </>
    );
}

const RedeemFromContract = ({ contractInfo }) => {
    const { api } = useYoroi()
    const wasm = useWasm()

    const [scriptInputInfo, setScriptInputInfo] = useState({
        transactionHash: "",
        outputId: ""
    })

    const [scriptInputList, setScriptInputList] = useState([])
    const [inlinedDatum, setInlinedDatum] = useState(true)
    const [inlinedScript, setInlinedScript] = useState(false)

    const addInput = () => {
        
    }

    const redeemFromContract = async () => {
        const txBuilder = wasm?.TransactionBuilder.new(
            wasm.TransactionBuilderConfigBuilder.new()
                .fee_algo(
                    wasm.LinearFee.new(
                        wasm.BigNum.from_str("44"),
                        wasm.BigNum.from_str("155381")
                    )
                )
                .coins_per_utxo_word(wasm.BigNum.from_str('34482'))
                .pool_deposit(wasm.BigNum.from_str('500000000'))
                .key_deposit(wasm.BigNum.from_str('2000000'))
                .ex_unit_prices(wasm.ExUnitPrices.new(
                    wasm.UnitInterval.new(wasm.BigNum.from_str("577"), wasm.BigNum.from_str("10000")),
                    wasm.UnitInterval.new(wasm.BigNum.from_str("721"), wasm.BigNum.from_str("10000000"))
                ))
                .max_value_size(5000)
                .max_tx_size(16384)
                .build()
        )

        const transactionHash = scriptInputInfo.transactionHash
        const outputId = scriptInputInfo.outputId
        const plutusScriptHex = contractInfo.contractHex
        const wasmRedeemData = wasm.encode_json_str_to_plutus_datum(JSON.stringify({
            "fields": [],
            "constructor": 0
        }))

        const wasmRedeemer = wasm.Redeemer.new(
            wasm.RedeemerTag.new_spend(),
            wasm.BigNum.from_str("0"),
            wasmRedeemData,
            wasm.ExUnits.new(
                wasm.BigNum.from_str("942996"),
                wasm.BigNum.from_str("346100241")
            )
        )

        // Set up the tx inputs builder
        const wasmTxInputsBuilder = wasm.TxInputsBuilder.new()

        // The data is actually inlined, so datum shouldn't be required, but the current Serialization Lib doesn't allow this
        // So we will just build the entire script witness with datum first, we will manually remove the datum later
        const plutusScriptWitness = wasm.PlutusWitness.new(
            wasm.PlutusScript.from_bytes_v2(hexToBytes(plutusScriptHex)),
            wasm.encode_json_str_to_plutus_datum(JSON.stringify({ "int": 1 })),
            wasmRedeemer
        )

        // Next build the Tx Input and Value
        const wasmTxInput = wasm.TransactionInput.new(
            wasm.TransactionHash.from_bytes(
                hexToBytes(
                    transactionHash
                )
            ),
            outputId
        )

        // This is just a test, so we'll just manually add the values, normally these values would be stored in some backend of some sort
        // and grabbed from it.
        const wasmValue = wasm.Value.new(wasm.BigNum.from_str("2000000"))
        // const wasmMultiAsset = wasm.MultiAsset.new()
        // const wasmAssets = wasm.Assets.new()
        // wasmAssets.insert(wasm.AssetName.new(hexToBytes("544e4654")), wasm.BigNum.from_str("1"))
        // wasmMultiAsset.insert(wasm.ScriptHash.from_bytes(hexToBytes("a9aab5dd109952ee0ba9f9cab2b0f028c7f249c4b506a022ab2932d8")), wasmAssets)
        // wasmValue.set_multiasset(wasmMultiAsset)

        // Finally we add the plutus script input to the inputs builder
        wasmTxInputsBuilder.add_plutus_script_input(plutusScriptWitness, wasmTxInput, wasmValue)
        // Maybe add some more value to pay fees and extra outputs
        const hexInputUtxos = await api.getUtxos("5000000")
        for (let i = 0; i < hexInputUtxos.length; i++) {
            const wasmUtxo = wasm.TransactionUnspentOutput.from_bytes(hexToBytes(hexInputUtxos[i]))
            wasmTxInputsBuilder.add_input(wasmUtxo.output().address(), wasmUtxo.input(), wasmUtxo.output().amount())
        }
        // Then we can set the tx inputs to the tx inputs builder
        txBuilder.set_inputs(wasmTxInputsBuilder)

        // For plutus transactions, we need some collateral also
        const hexCollateralUtxos = await api?.getCollateral(3000000)
        const collateralTxInputsBuilder = wasm.TxInputsBuilder.new()
        for (let i = 0; i < hexCollateralUtxos.length; i++) {
            const wasmUtxo = wasm.TransactionUnspentOutput.from_bytes(hexToBytes(hexCollateralUtxos[i]))
            collateralTxInputsBuilder.add_input(wasmUtxo.output().address(), wasmUtxo.input(), wasmUtxo.output().amount())
        }
        txBuilder.set_collateral(collateralTxInputsBuilder)

        // The script ensures that there is an output back to the script with some datum, so we'll add this output
        const wasmContractAddress = wasm.Address.from_bech32("addr_test1wrh5pj6nlmdrmtv6uv69edjh5x3gx7px7zchxag47s23gtgu02rzy")
        const wasmOutput = wasm.TransactionOutput.new(
            wasmContractAddress,
            wasm.Value.new(wasm.BigNum.from_str("2000000"))
        )
        wasmOutput.set_plutus_data(wasm.encode_json_str_to_plutus_datum(JSON.stringify({ "int": 1 })))
        txBuilder.add_output(wasmOutput)

        // We need to handle hashing of plutus witness. Because the datum is actually included inline within the script UTXO
        // therefore, we need to intentionally leave out the datum in the witness set for the hash.
        const wasmRedeemers = wasm.Redeemers.new()
        wasmRedeemers.add(txBuilder.get_plutus_input_scripts().get(0).redeemer())
        // The cost models of v2 scripts must be manually built currently
        const cost_model_vals = [205665, 812, 1, 1, 1000, 571, 0, 1, 1000, 24177, 4, 1, 1000, 32, 117366, 10475, 4, 23000, 100, 23000, 100, 23000, 100, 23000, 100, 23000, 100, 23000, 100, 100, 100, 23000, 100, 19537, 32, 175354, 32, 46417, 4, 221973, 511, 0, 1, 89141, 32, 497525, 14068, 4, 2, 196500, 453240, 220, 0, 1, 1, 1000, 28662, 4, 2, 245000, 216773, 62, 1, 1060367, 12586, 1, 208512, 421, 1, 187000, 1000, 52998, 1, 80436, 32, 43249, 32, 1000, 32, 80556, 1, 57667, 4, 1000, 10, 197145, 156, 1, 197145, 156, 1, 204924, 473, 1, 208896, 511, 1, 52467, 32, 64832, 32, 65493, 32, 22558, 32, 16563, 32, 76511, 32, 196500, 453240, 220, 0, 1, 1, 69522, 11687, 0, 1, 60091, 32, 196500, 453240, 220, 0, 1, 1, 196500, 453240, 220, 0, 1, 1, 1159724, 392670, 0, 2, 806990, 30482, 4, 1927926, 82523, 4, 265318, 0, 4, 0, 85931, 32, 205665, 812, 1, 1, 41182, 32, 212342, 32, 31220, 32, 32696, 32, 43357, 32, 32247, 32, 38314, 32, 20000000000, 20000000000, 9462713, 1021, 10, 20000000000, 0, 20000000000]
        const costModel = wasm.CostModel.new();
        cost_model_vals.forEach((x, i) => costModel.set(i, wasm.Int.new(wasm.BigNum.from_str(String(x)))));
        const costmdls = wasm.Costmdls.new()
        costmdls.insert(wasm.Language.new_plutus_v2(), costModel)
        // I intentionally put an undefined where the datum should go to make it clearer, but the argument can simply be left empty
        const plutusWitnessHash = wasm.hash_script_data(wasmRedeemers, costmdls, undefined)
        txBuilder.set_script_data_hash(plutusWitnessHash)

        // Handle change
        const hexChangeAddress = await api?.getChangeAddress()
        const wasmChangeAddress = wasm.Address.from_bytes(hexToBytes(hexChangeAddress))
        txBuilder.add_change_if_needed(wasmChangeAddress)

        const unsignedTransactionHex = bytesToHex(txBuilder.build_tx().to_bytes())
        api?.signTx(unsignedTransactionHex)
            .then((witnessSetHex) => {
                // Go through a fairly annoying process of manually removing the datum from the witness set
                // Unfortunately, the Serialization lib doesn't allow us to simply set the datum as undefined, so we need to remake
                // the witness set, and simply not set the datum
                const wasmWitnessSetCopy = wasm.TransactionWitnessSet.from_bytes(
                    hexToBytes(witnessSetHex)
                )
                const wasmWitnessSet = wasm.TransactionWitnessSet.new()
                wasmWitnessSet.set_plutus_scripts(wasmWitnessSetCopy.plutus_scripts())
                wasmWitnessSet.set_redeemers(wasmWitnessSetCopy.redeemers())
                wasmWitnessSet.set_vkeys(wasmWitnessSetCopy.vkeys())
                const wasmTx = wasm.Transaction.from_bytes(
                    hexToBytes(unsignedTransactionHex)
                )
                const wasmSignedTransaction = wasm.Transaction.new(
                    wasmTx.body(),
                    wasmWitnessSet,
                    wasmTx.auxiliary_data()
                )
                const transactionHex = bytesToHex(wasmSignedTransaction.to_bytes())
                console.log(transactionHex)
                api.submitTx(transactionHex)
                    .then(txId => {
                        console.log(`Transaction successfully submitted: ${txId}`)
                    })
                    .catch(err => {
                        console.log(err.info)
                    })
            }).catch(err => {
                console.log(err.info)
            })
    }

    return (
        <div className="block p-6 min-w-full rounded-lg border shadow-md bg-gray-800 border-gray-700">
            <div className="bg-gray-800 grid gap-6 md:grid-cols-2 px-5 py-5 ">
                <div>
                    <label htmlFor="transactionId" className="block mb-2 text-sm font-medium text-gray-300">Transaction Id</label>
                    <input type="text" id="transactionId" className="appearance-none border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                        value={scriptInputInfo.transactionHash} onChange={(event) => setScriptInputInfo({ ...scriptInputInfo, transactionHash: event.target.value })} />
                </div>
                <div>
                    <label htmlFor="outputId" className="block mb-2 text-sm font-medium text-gray-300">output Id</label>
                    <input type="text" id="outputId" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                        value={scriptInputInfo.outputId} onChange={(event) => setScriptInputInfo({ ...scriptInputInfo, outputId: event.target.value })} />
                </div>
            </div>
            <div className="flex justify-between px-5 pb-5">
                <div className="flex items-start mb-6">
                    <div className="flex items-center h-5">
                        <input id="inlined-datum-check" type="checkbox" defaultChecked={inlinedDatum} value={inlinedDatum} onChange={() => setInlinedDatum(!inlinedDatum)} className="w-4 h-4 bg-gray-50 rounded border border-gray-300 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" />
                    </div>
                    <label htmlFor="inlined-datum-check" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Inlined Datum</label>
                    <div className="flex items-center h-5 pl-5">
                        <input id="inlined-script-check" type="checkbox" defaultChecked={inlinedScript} value={inlinedScript} onChange={() => setInlinedScript(!inlinedScript)} className="w-4 h-4 bg-gray-50 rounded border border-gray-300 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" />
                    </div>
                    <label htmlFor="inlined-script-check" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Inlined Script</label>
                </div>
                <button type="button" className="text-white font-medium rounded-lg text-sm sm:w-auto px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
                    onClick={redeemFromContract}>Add as input</button>
            </div>
            <div className="mb-6 px-5">
                <label className="block mb-2 text-sm font-medium text-gray-300">Input List</label>
                <textarea className="flex-row w-full rounded bg-gray-900 text-white px-2" value={scriptInputList}
                    onChange={(event) => { setScriptInputList({ ...scriptInputList, datum: event.target.value }) }}></textarea>
            </div>
            <div className="px-5">
                <button type="button" className="text-white font-medium rounded-lg text-sm sm:w-auto px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
                    onClick={redeemFromContract}>Redeem From Contract</button>
            </div>
        </div >
    );
}

export default ContractTab