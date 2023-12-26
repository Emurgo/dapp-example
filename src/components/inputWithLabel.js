import React from 'react'
import {CommonStyles} from './ui-constants'

const InputWithLabel = (props) => {
  const {inputName, inputValue, onChangeFunction} = props

  const nftInputID = inputValue.split(' ').join('')

  return (
    <div className="mb-6 pr-4">
      <label htmlFor={'input-' + nftInputID} className="block mb-2 text-sm font-medium text-gray-300">
        {inputName}
      </label>
      <input
        type="text"
        id={'input-' + nftInputID}
        className={CommonStyles.inputStyles}
        value={inputValue}
        onChange={onChangeFunction}
      />
    </div>
  )
}

export default InputWithLabel
