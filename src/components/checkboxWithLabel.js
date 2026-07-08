import React from 'react'

const CheckboxWithLabel = (props) => {
  const {currentState, onChangeFunc, name, labelText, disabled} = props

  return (
    <div className={`text-l tracking-tight text-gray-300 mt-5 ${disabled ? 'opacity-50' : ''}`}>
      <div>
        <input
          type="checkbox"
          id={name + 'Id'}
          name={name}
          checked={currentState}
          onChange={onChangeFunc}
          disabled={disabled}
        />
        <label htmlFor={name + 'Id'} className={`font-bold ${disabled ? 'cursor-not-allowed' : ''}`}>
          <span /> {labelText}
        </label>
      </div>
    </div>
  )
}

export default CheckboxWithLabel
