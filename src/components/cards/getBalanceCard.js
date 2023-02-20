import React, {useState} from "react";
import {hexToBytes, wasmMultiassetToJSONs} from "../../utils/utils";
import ApiCard from "./apiCard";

const GetBalanceCard = ({ api, wasm, onRawResponse, onResponse, onWaiting}) => {
  const [getBalanceText, setGetBalanceText] = useState("")

  const getBalanceClick = () => {
    onWaiting(true);
    api?.getBalance()
      .then((hexBalance) => {
        onWaiting(false);
        onRawResponse(hexBalance);
        const wasmValue = wasm.Value.from_bytes(hexToBytes(hexBalance));
        const adaValue = wasmValue.coin().to_str();
        const assetValue = wasmMultiassetToJSONs(wasmValue.multiasset());
        onResponse({lovelaces: adaValue, assets: assetValue});
      })
      .catch((e) => {
        onWaiting(false);
        onResponse(e.info)
        console.log(e)
      })
  }

  const apiProps = {
    apiName: "getBalance",
    apiDescription: "Returns the balance of your account in lovelaces and tokens",
    text: getBalanceText,
    clickFunction: getBalanceClick
  }

  return (
    <ApiCard {...apiProps} />
  );
};

export default GetBalanceCard;