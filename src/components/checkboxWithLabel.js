import React from 'react'

const CheckboxWithLabel = (props) => {
    const {currentState, onChangeFunc, name, labelText} = props

    return (
        <div className="text-l tracking-tight text-gray-300 mt-5">
        <div>
          <input
            type="checkbox"
            id={name + "Id"}
            name={name}
            checked={currentState}
            onChange={onChangeFunc}
          />
          <label htmlFor={name + "Id"} className="font-bold">
            <span /> {labelText}
          </label>
        </div>
      </div>
    )
}

export default CheckboxWithLabel