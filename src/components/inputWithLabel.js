import React from 'react'
import {CommonStyles, ModalWindowContent} from './ui-constants'

const InputWithLabel = (props) => {
  const {inputName, inputValue, onChangeFunction, helpText, type, placeholder, min, step, wrapperClassName, disabled} =
    props

  const inputType = type || 'text'

  const inputID = inputName.split(' ').join('')

  return (
    <div className={wrapperClassName ?? 'mt-3'}>
      <label htmlFor={'input-' + inputID} className={ModalWindowContent.contentLabelStyle}>
        {inputName}
      </label>
      <input
        type={inputType}
        id={'input-' + inputID}
        className={disabled ? CommonStyles.inputStylesDisabled : CommonStyles.inputStyles}
        placeholder={placeholder}
        min={min}
        step={step}
        value={inputValue}
        onChange={onChangeFunction}
        disabled={disabled}
      />
      {helpText ? (
        <label htmlFor={'input-' + inputID} className="block mb-1 ml-1 text-sm font-light text-gray-300">
          {helpText}
        </label>
      ) : (
        <></>
      )}
    </div>
  )
}

export default InputWithLabel
