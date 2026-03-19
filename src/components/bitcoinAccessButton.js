import React from 'react'

const BitcoinAccessButton = () => {
  return (
    <div className="mx-auto bg-gray-900">
      <div className="grid justify-items-center py-3">
        <button
          className="rounded-md bg-orange-600 py-5 px-5 disabled:opacity-50 text-white font-semibold cursor-not-allowed"
          disabled
        >
          Bitcoin (Coming Soon)
        </button>
      </div>
    </div>
  )
}

export default BitcoinAccessButton
