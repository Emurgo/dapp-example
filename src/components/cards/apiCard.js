import React from "react";

const ApiCard = (props) => {
  const { apiName, apiDescription, text, clickFunction, inputs, children } = props

  return (
    <div className="grid grid-cols-1 rounded-lg border bg-gray-800 border-gray-700">
      <button className="w-full h-20 bg-orange-700 hover:bg-orange-800 rounded-lg text-white" onClick={clickFunction}>{apiName}</button>
    </div>
  );
}

export default ApiCard;