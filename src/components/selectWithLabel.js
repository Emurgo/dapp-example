import React from 'react'

const SelectWithLabel = (props) => {
  const {selectName, selectArray, onChangeFunction} = props
  const selectID = selectName.split(' ').join('')

  return (
    <div className="mb-6 pr-4">
      <label
        htmlFor={selectID}
        className="block mb-2 text-sm font-medium text-gray-300 focus:ring-blue-500 focus:border-blue-500"
      >
        {selectName}
      </label>
      <select
        className="border text-sm rounded-md p-2.5 bg-gray-700 border-gray-600 text-white"
        onChange={onChangeFunction}
        name={selectID}
        id={selectID}
      >
        {selectArray.map((arrayItem) => (
          <option className="border rounded-md text-white" key={arrayItem.label + 'Key'} value={arrayItem.value}>
            {arrayItem.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SelectWithLabel
