import React, {useState} from "react";
import ApiCard from "./apiCard";

const SubmitTransactionCard = ({ api, onRawResponse, onResponse, onWaiting }) => {
  const [submitTransactionText, setSubmitTransactionText] = useState("")
  const [submitTransactionInput, setSubmitTransactionInput] = useState("")

  const submitTransactionClick = () => {
    onWaiting(true);
    api?.submitTx(submitTransactionInput)
      .then((txId) => {
        onWaiting(false);
        onRawResponse(txId);
        onResponse(txId);
      })
      .catch((e) => {
        onWaiting(false);
        onResponse(e.info);
        console.log(e);
      })
  }

  const apiProps = {
    apiName: "submitTx",
    apiDescription: "Submits a transaction to the blockchain. You may copy and paste the result of signTx to input. Returns the Transaction Id",
    text: submitTransactionText,
    clickFunction: submitTransactionClick,
    inputs: "signedTx: string"
  }

  return (
    <ApiCard {...apiProps}>
      <div className="px-4 pb-3">
        <label htmlFor="txHex" className="block mb-2 text-sm font-medium text-gray-300">Tx Hex</label>
        <input type="text" id="txHex" className="appearance-none border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder=""
               value={submitTransactionInput} onChange={(event) => setSubmitTransactionInput(event.target.value)} />
      </div>
    </ApiCard>
  );
};

export default SubmitTransactionCard;