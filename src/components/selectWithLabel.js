import React from 'react'
import {ModalWindowContent} from './ui-constants'

const SelectWithLabel = (props) => {
  const {selectName, selectArray, onChangeFunction, defaultValue} = props
  const selectID = selectName.split(' ').join('')

  return (
    <div className="mt-3">
      <label htmlFor={selectID} className={ModalWindowContent.contentLabelStyle}>
        {selectName}
      </label>
      <select
        className="border text-sm font-semibold rounded-sm p-2.5 bg-gray-700 border-gray-600 text-white"
        onChange={onChangeFunction}
        name={selectID}
        id={selectID}
        defaultValue={defaultValue}
      >
        {selectArray.map((arrayItem) => (
          <option className="border text-white" key={arrayItem.label + 'Key'} value={arrayItem.value}>
            {arrayItem.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SelectWithLabel
