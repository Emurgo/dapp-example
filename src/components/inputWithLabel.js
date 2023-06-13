import React from 'react'

const InputWithLabel = (props) => {
  const {inputName, inputValue, onChangeFunction} = props
  console.log(`input value: ${JSON.stringify(inputValue)}`)

  const nftInputID = inputValue.split(' ').join('')

  return (
    <div className="mb-6 pr-4">
      <label htmlFor={'input-' + nftInputID} className="block mb-2 text-sm font-medium text-gray-300">
        {inputName}
      </label>
      <input
        type="text"
        id={'input-' + nftInputID}
        className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
        value={inputValue}
        onChange={onChangeFunction}
      />
    </div>
  )
}

export default InputWithLabel
