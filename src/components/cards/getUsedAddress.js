import React, {useState} from "react";
import ApiCard from "./apiCard";
import InputModal from "./inputModal";
import {getAddressFromBytes} from "../../utils/wasmTools";

const GetUsedAddresses = ({ api, wasm }) => {
  const [usedAddressesText, setUsedAddressesText] = useState("")
  const [usedAddressInput, setUsedAddressInput] = useState({ page: 0, limit: 5 })

  const getUsedAddressesClick = () => {
    api?.getUsedAddresses(usedAddressInput)
      .then((hexAddresses) => {
        const addresses = []
        for (let i = 0; i < hexAddresses.length; i++) {
          const wasmAddress = getAddressFromBytes(wasm, hexAddresses[i]);
          addresses.push(wasmAddress.to_bech32());
        }
        setUsedAddressesText(addresses)
      })
      .catch((e) => {
        setUsedAddressesText(e.info)
        console.log(e)
      })
  }


  const apiProps = {
    apiName: "getUsedAddresses",
    apiDescription: "Returns already used addresses of your Yoroi wallet",
    text: usedAddressesText,
    inputs: "{page: number, limit: number}",
    clickFunction: getUsedAddressesClick
  }

  return (
    <ApiCard {...apiProps}>
      <InputModal buttonLabel="Set Inputs">
        <div className="grid gap-6 mb-6 md:grid-cols-2 px-4">
          <div>
            <label htmlFor="page" className="block mb-2 text-sm font-medium text-gray-300">Page</label>
            <input type="number" min="0" id="page" className="appearance-none border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="0"
                   value={usedAddressInput.page} onChange={(event) => setUsedAddressInput({ ...usedAddressInput, page: Number(event.target.value) })} />
          </div>
          <div>
            <label htmlFor="limit" className="block mb-2 text-sm font-medium text-gray-300">Limit</label>
            <input type="number" min="0" id="limit" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="5"
                   value={usedAddressInput.limit} onChange={(event) => setUsedAddressInput({ ...usedAddressInput, limit: Number(event.target.value) })} />
          </div>
        </div>
      </InputModal>
    </ApiCard>
  )
};

export default GetUsedAddresses;