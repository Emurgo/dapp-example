import React, {useState} from "react";
import {bytesToHex} from "../../utils/utils";
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
import ApiCardWithModal from "./apiCardWithModal";

const SignTransactionCard = ({ api, wasm, onRawResponse, onResponse, onWaiting }) => {
  const [buildTransactionInput, setBuildTransactionInput] = useState({ amount: "2000000", address: "" });
  const [signTransactionInput, setSignTransactionInput] = useState("");

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
        onRawResponse('');
        onResponse(e);
        console.log(e);
      })
  }
  const apiProps = {
    buttonLabel: "signTx",
    clickFunction: signTransactionClick,
  }

  return (
    <ApiCardWithModal {...apiProps}>
        <div className="px-4 pb-3">
          <label
            htmlFor="txHex"
            className="block mb-2 text-sm font-medium text-gray-300"
          >
            Tx Hex
          </label>
          <input
            type="text"
            id="txHex"
            className="appearance-none border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
            placeholder=""
            value={signTransactionInput}
            onChange={(event) => setSignTransactionInput(event.target.value)}
          />
        </div>
    </ApiCardWithModal>
  );
};

export default SignTransactionCard;