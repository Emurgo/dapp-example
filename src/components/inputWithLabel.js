import React from 'react'
import {CommonStyles, ModalWindowContent} from './ui-constants'

const InputWithLabel = (props) => {
  const {inputName, inputValue, onChangeFunction} = props

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
    </div>
  )
}

export default InputWithLabel
