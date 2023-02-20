import React, {useState} from "react";
import {hexToBytes} from "../../utils/utils";
import ApiCard from "./apiCard";

const GetChangeAddressCard = ({ api, wasm, onRawResponse, onResponse, onWaiting }) => {
  const [getChangeAddressText, setGetChangeAddressText] = useState("")

  const getChangeAddressClick = () => {
    onWaiting(true);
    api?.getChangeAddress()
      .then((hexAddress) => {
        onWaiting(false);
        onRawResponse(hexAddress);
        const wasmAddress = wasm.Address.from_bytes(hexToBytes(hexAddress));
        onResponse(wasmAddress.to_bech32());
      })
      .catch((e) => {
        onWaiting(false);
        onResponse(e.info);
        console.log(e);
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