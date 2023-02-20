import React, {useState} from "react";
import ApiCard from "./apiCard";

const IsEnabledCard = ({ onRawResponse, onResponse, onWaiting }) => {
  const [isEnabledText, setIsEnabledText] = useState("")

  const isDisabledClick = () => {
    onWaiting(true);
    window.cardano.yoroi?.isEnabled()
      .then((enabled) => {
        onWaiting(false);
        onRawResponse(enabled);
        onResponse(enabled);
      })
      .catch((e) => {
        onWaiting(false);
        onRawResponse('');
        onResponse(e);
        console.error(e);
      })
  }

  const apiProps = {
    apiName: "isEnabled",
    apiDescription: "Returns true or false depending on whether Yoroi is enabled",
    text: isEnabledText,
    clickFunction: isDisabledClick
  }

  return (
    <ApiCard {...apiProps} />
  );
}

export default IsEnabledCard;