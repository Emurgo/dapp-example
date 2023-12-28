import React from 'react'

const ApiCard = (props) => {
  const {apiName, clickFunction, color, height} = props

  let localColor = 'bg-orange-700 hover:bg-orange-800 active:bg-orange-500'
  if (color != null) {
    localColor = color
  }
  const localHeight = height == null ? 'h-16' : `h-${height}`

  const localClassName = `w-full ${localHeight} ${localColor} disabled:bg-gray-800 rounded-lg text-white text-lg`

  return (
    <div className="grid grid-cols-1 rounded-lg border bg-gray-800 border-gray-600">
      <button className={localClassName} onClick={clickFunction}>
        {apiName}
      </button>
    </div>
  )
}

export default ApiCard
