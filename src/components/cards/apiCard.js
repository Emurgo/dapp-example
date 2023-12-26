import React from 'react'

const ApiCard = (props) => {
  const {apiName, clickFunction} = props

  return (
    <div className="grid grid-cols-1 rounded-lg border-1 bg-gray-800 border-gray-600">
      <button
        className="w-full h-16 bg-orange-700 hover:bg-orange-800 active:bg-orange-500 rounded-lg text-white text-lg"
        onClick={clickFunction}
      >
        {apiName}
      </button>
    </div>
  )
}

export default ApiCard
