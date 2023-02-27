import React, {useState} from "react";
import ApiCardWithModal from "./apiCardWithModal";

const SubmitTransactionCard = ({ api, onRawResponse, onResponse, onWaiting }) => {
  const [submitTransactionInput, setSubmitTransactionInput] = useState("");

  const submitTransactionClick = () => {
    onWaiting(true);
    api?.submitTx(submitTransactionInput)
      .then((txId) => {
        onWaiting(false);
        onRawResponse(txId);
        onResponse(txId, false);
      })
      .catch((e) => {
        onWaiting(false);
        onRawResponse('');
        onResponse(e);
        console.log(e);
      })
  }

  const apiProps = {
    buttonLabel: "submitTx",
    clickFunction: submitTransactionClick,
  }

  return (
    <ApiCardWithModal {...apiProps}>
      <div className="px-4 pb-3">
        <label
          htmlFor="txHex"
          className="block mb-2 text-sm font-medium text-gray-300">
            Signed Tx Hex
        </label>
        <input
          type="text"
          id="txHex"
          className="appearance-none border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
          placeholder=""
          value={submitTransactionInput}
          onChange={(event) => setSubmitTransactionInput(event.target.value)}
        />
      </div>
    </ApiCardWithModal>
  );
};

export default SubmitTransactionCard;