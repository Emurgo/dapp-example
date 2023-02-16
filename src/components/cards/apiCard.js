import React from "react";

const ApiCard = (props) => {
  const { apiName, apiDescription, text, clickFunction, inputs, children } = props

  return (
    <div className="flex flex-col max-w-sm h-full rounded-lg border shadow-md bg-gray-800 border-gray-700">
      <button className="w-full h-20 bg-orange-700 hover:bg-orange-800 rounded-t-lg text-white" onClick={clickFunction}>{apiName}</button>
      <div className="p-5">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">{apiName + "(" + (inputs ? inputs : "") + ")"}</h5>
        <p className="mb-3 font-normal text-gray-400">{apiDescription}</p>
      </div>
      {children}
      <div className="flex-grow">
        <textarea className="w-full h-full flex-row rounded bg-gray-900 text-white px-2" disabled readOnly value={text}></textarea>
      </div>
    </div>
  );
}

export default ApiCard;