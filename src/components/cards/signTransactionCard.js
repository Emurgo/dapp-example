import React, {useState} from "react";
import {bytesToHex} from "../../utils/utils";
import ApiCard from "./apiCard";
import InputModal from "./inputModal";
import {
  getAddressFromBytes,
  getLargestFirstMultiAsset,
  getSignedTransaction,
  getTransactionFromBytes,
  getTransactionWitnessSetFromBytes,
  getTxBuilder,
  getTransactionOutput,
  getWasmUtxos
} from "../../utils/wasmTools";

const SignTransactionCard = ({ api, wasm, onRawResponse, onResponse, onWaiting }) => {
  const [signTransactionText, setSignTransactionText] = useState("")
  const [buildTransactionInput, setBuildTransactionInput] = useState({ amount: "2000000", address: "" })
  const [signTransactionInput, setSignTransactionInput] = useState("")

  const buildTransaction = async () => {
    const txBuilder = getTxBuilder(wasm);

    const changeAddress = await api?.getChangeAddress();
    const wasmChangeAddress = getAddressFromBytes(wasm, changeAddress);
    const wasmOutputAddress = buildTransactionInput.address
      ? wasm.Address.from_bech32(buildTransactionInput.address)
      : wasmChangeAddress;
    const wasmOutput = getTransactionOutput(wasm, wasmOutputAddress, buildTransactionInput);
    txBuilder.add_output(wasmOutput);

    const hexUtxos = await api?.getUtxos();

    const wasmUtxos = getWasmUtxos(wasm, hexUtxos);
    txBuilder.add_inputs_from(wasmUtxos, getLargestFirstMultiAsset(wasm));
    txBuilder.add_change_if_needed(wasmChangeAddress);

    const wasmUnsignedTransaction = txBuilder.build_tx();
    setSignTransactionInput(bytesToHex(wasmUnsignedTransaction.to_bytes()));
    return bytesToHex(wasmUnsignedTransaction.to_bytes());
  }

  const signTransactionClick = async () => {
    onWaiting(true);
    let txHex = signTransactionInput;
    if (!txHex) {
      txHex = await buildTransaction();
    }
    api?.signTx(txHex)
      .then((witnessHex) => {
        onWaiting(false);
        onRawResponse(witnessHex);
        const wasmUnsignedTransaction = getTransactionFromBytes(wasm, txHex);
        const wasmWitnessSet = getTransactionWitnessSetFromBytes(wasm, witnessHex);
        const wasmSignedTransaction = getSignedTransaction(wasm, wasmUnsignedTransaction, wasmWitnessSet);
        onResponse(bytesToHex(wasmSignedTransaction.to_bytes()));
      })
      .catch((e) => {
        onWaiting(false);
        onResponse(e.info);
        console.log(e);
      })
  }
  const apiProps = {
    apiName: "signTx",
    apiDescription: "Returns a signed Transaction CBOR. Signing uses your Yoroi wallet and will initiate a popup",
    text: signTransactionText,
    clickFunction: signTransactionClick,
    inputs: "unsignedTx: string, partialSign: bool"
  }

  return (
    <ApiCard {...apiProps}>
      <InputModal buttonLabel="Build Transaction">
        <div className="px-4 pb-3">
          <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-300">Amount</label>
          <input type="number" min="0" id="amount" className="appearance-none border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder=""
                 value={buildTransactionInput.amount} onChange={(event) => setBuildTransactionInput({ ...buildTransactionInput, amount: event.target.value })} />
        </div>
        <div className="px-4 pb-3">
          <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-300">Address</label>
          <input type="text" id="address" className="appearance-none border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder=""
                 value={buildTransactionInput.address} onChange={(event) => setBuildTransactionInput({ ...buildTransactionInput, address: event.target.value })} />
          <p>(will send to your change address if unspecified)</p>
        </div>
        <div className="grid justify-items-center pb-2">
          <button className="block text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-gray-600 hover:bg-gray-700 focus:ring-gray-800" type="button"
                  onClick={buildTransaction}>
            Build Tx
          </button>
        </div>
        <div className="px-4 pb-3">
          <label htmlFor="txHex" className="block mb-2 text-sm font-medium text-gray-300">Tx Hex</label>
          <input type="text" id="txHex" className="appearance-none border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder=""
                 value={signTransactionInput} onChange={(event) => setSignTransactionInput(event.target.value)} />
        </div>
      </InputModal>
    </ApiCard>
  );
};

export default SignTransactionCard;