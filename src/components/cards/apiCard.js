import React from 'react'

// Static map so Tailwind's JIT keeps these classes — `h-${height}` would be
// built at runtime and purged from the production build.
const HEIGHT_CLASSES = {
  10: 'h-10',
  16: 'h-16',
  24: 'h-24',
}

const ApiCard = (props) => {
  const {apiName, clickFunction, color, height} = props

  let localColor = 'bg-orange-700 hover:bg-orange-800 active:bg-orange-500'
  if (color != null) {
    localColor = color
  }
  const localHeight = HEIGHT_CLASSES[height] || 'h-16'

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
