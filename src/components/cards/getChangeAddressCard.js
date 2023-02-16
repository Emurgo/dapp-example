import React, {useState} from "react";
import {hexToBytes} from "../../utils/utils";
import ApiCard from "./apiCard";

const GetChangeAddressCard = ({ api, wasm }) => {
  const [getChangeAddressText, setGetChangeAddressText] = useState("")

  const getChangeAddressClick = () => {
    api?.getChangeAddress()
      .then((hexAddress) => {
        const wasmAddress = wasm.Address.from_bytes(hexToBytes(hexAddress))
        setGetChangeAddressText(wasmAddress.to_bech32())
      })
      .catch((e) => {
        setGetChangeAddressText(e.info)
        console.log(e)
      })
  }

  const apiProps = {
    apiName: "getChangeAddress",
    apiDescription: "Returns your change address, Yoroi generates a new one every transaction",
    text: getChangeAddressText,
    clickFunction: getChangeAddressClick
  }
  return (
    <ApiCard {...apiProps} />
  );
};

export default GetChangeAddressCard;