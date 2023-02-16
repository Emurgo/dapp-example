import React, {useState} from "react";
import {hexToBytes} from "../../utils/utils";
import ApiCard from "./apiCard";

const GetUnusedAddressesCard = ({ api, wasm }) => {
  const [unusedAddressesText, setUnusedAddressesText] = useState("")

  const getUnusedAddressesClick = () => {
    api?.getUnusedAddresses()
      .then((hexAddresses) => {
        const addresses = []
        for (let i = 0; i < hexAddresses.length; i++) {
          const wasmAddress = wasm.Address.from_bytes(hexToBytes(hexAddresses[i]))
          addresses.push(wasmAddress.to_bech32())
        }
        setUnusedAddressesText(addresses)
      })
      .catch((e) => {
        setUnusedAddressesText(e.info)
        console.log(e)
      })
  }

  const apiProps = {
    apiName: "getUnusedAddresses",
    apiDescription: "Returns the unused addresses of your Yoroi wallet",
    text: unusedAddressesText,
    clickFunction: getUnusedAddressesClick
  }

  return (
    <ApiCard {...apiProps} />
  );
};

export default GetUnusedAddressesCard;