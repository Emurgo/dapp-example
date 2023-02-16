import React, {useState} from "react";
import ApiCard from "./apiCard";

const IsEnabledCard = () => {
  const [isEnabledText, setIsEnabledText] = useState("")

  const isDisabledClick = () => {
    window.cardano.yoroi?.isEnabled()
      .then((enabled) => {
        setIsEnabledText(enabled)
      })
      .catch((e) => {
        setIsEnabledText(e.info)
        console.log(e)
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