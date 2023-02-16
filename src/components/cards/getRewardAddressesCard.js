import React, {useState} from "react";
import {hexToBytes} from "../../utils/utils";
import ApiCard from "./apiCard";


const GetRewardAddressesCard = ({ api, wasm }) => {
  const [rewardAddressesText, setRewardAddressesText] = useState("")

  const getRewardAddressesClick = () => {
    api?.getRewardAddresses()
      .then((hexAddresses) => {
        const addresses = []
        for (let i = 0; i < hexAddresses.length; i++) {
          const wasmAddress = wasm.Address.from_bytes(hexToBytes(hexAddresses[i]))
          addresses.push(wasmAddress.to_bech32())
        }
        setRewardAddressesText(addresses)
      })
      .catch((e) => {
        setRewardAddressesText(e.info)
        console.log(e)
      })
  }


  const apiProps = {
    apiName: "getRewardAddresses",
    apiDescription: "Returns your reward addresses, these are where your staking rewards go",
    text: rewardAddressesText,
    clickFunction: getRewardAddressesClick
  }

  return (
    <ApiCard {...apiProps} />
  );
};

export default GetRewardAddressesCard;