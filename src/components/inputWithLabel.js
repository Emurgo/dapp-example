import React from 'react'
import {CommonStyles, ModalWindowContent} from './ui-constants'

const InputWithLabel = (props) => {
  const {inputName, inputValue, onChangeFunction, helpText} = props

  const nftInputID = inputValue.split(' ').join('')

  return (
    <div className="mt-3">
      <label htmlFor={'input-' + nftInputID} className={ModalWindowContent.contentLabelStyle}>
        {inputName}
      </label>
      <input
        type="text"
        id={'input-' + nftInputID}
        className={CommonStyles.inputStyles}
        value={inputValue}
        onChange={onChangeFunction}
      />
      {helpText ? (
        <label htmlFor={'input-' + nftInputID} className="block mb-1 ml-1 text-sm font-light text-gray-300">
          {helpText}
        </label>
      ) : (
        <></>
      )}
    </div>
  )
}

export default InputWithLabel
