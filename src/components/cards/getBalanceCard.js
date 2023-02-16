import React, {useState} from "react";
import {hexToBytes, wasmMultiassetToJSONs} from "../../utils/utils";
import ApiCard from "./apiCard";

const GetBalanceCard = ({ api, wasm }) => {
  const [getBalanceText, setGetBalanceText] = useState("")

  const getBalanceClick = () => {
    api?.getBalance()
      .then((hexBalance) => {
        const wasmValue = wasm.Value.from_bytes(hexToBytes(hexBalance))
        const adaValue = wasmValue.coin().to_str()
        const assetValue = wasmMultiassetToJSONs(wasmValue.multiasset())
        setGetBalanceText(`lovelaces: ${adaValue} Assets: ${JSON.stringify(assetValue)}`)
      })
      .catch((e) => {
        setGetBalanceText(e.info)
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