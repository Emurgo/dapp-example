import React, {useState} from "react";
import {getAddressFromBytes} from "../../utils/wasmTools";
import ApiCardWithModal from "./apiCardWithModal";

const GetUsedAddresses = ({ api, wasm, onRawResponse, onResponse, onWaiting }) => {
  const [usedAddressInput, setUsedAddressInput] = useState({ page: 0, limit: 5 })

  const getUsedAddressesClick = () => {
    onWaiting(true);
    api?.getUsedAddresses(usedAddressInput)
      .then((hexAddresses) => {
        onWaiting(false);
        onRawResponse(hexAddresses);
        const addresses = []
        for (let i = 0; i < hexAddresses.length; i++) {
          const wasmAddress = getAddressFromBytes(wasm, hexAddresses[i]);
          addresses.push(wasmAddress.to_bech32());
        }
        onResponse(addresses);
      })
      .catch((e) => {
        onWaiting(false);
        onRawResponse('');
        onResponse(e);
        console.log(e);
      })
  }


  const apiProps = {
    buttonLabel: "getUsedAddresses",
    clickFunction: getUsedAddressesClick
  }

  return (
    <ApiCardWithModal {...apiProps}>
      <div className="grid gap-6 mb-6 md:grid-cols-2 px-4">
        <div>
          <label
            htmlFor="page"
            className="block mb-2 text-sm font-medium text-gray-300"
          >
            Page
          </label>
          <input
            type="number"
            min="0"
            id="page"
            className="appearance-none border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
            value={usedAddressInput.page}
            onChange={(event) => setUsedAddressInput({ ...usedAddressInput, page: Number(event.target.value) })}
          />
        </div>
        <div>
          <label
            htmlFor="limit"
            className="block mb-2 text-sm font-medium text-gray-300"
          >
            Limit
          </label>
          <input
            type="number"
            min="0"
            id="limit"
            className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="5"
            value={usedAddressInput.limit}
            onChange={(event) => setUsedAddressInput({ ...usedAddressInput, limit: Number(event.target.value) })} />
        </div>
      </div>
    </ApiCardWithModal>
  )
};

export default GetUsedAddresses;