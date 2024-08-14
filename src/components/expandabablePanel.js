import React from 'react'
import {useCollapse} from 'react-collapsed'

const ExpandablePanel = (props) => {
  const {getCollapseProps, getToggleProps, isExpanded} = useCollapse()
  const {title, innerInfo} = props
  return (
    <div className="border rounded-md bg-gray-700 border-gray-700 py-2 w-full" key={`expandablePanel`}>
      <div {...getToggleProps()}>
        <div>
          <span className="text-m">
            {title}&nbsp;
            {isExpanded ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="inline align-text-bottom feather feather-arrow-down"
              >
                <line x1="8" y1="3" x2="8" y2="12"></line>
                <polyline points="13 8 8 12 3 8"></polyline>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="inline align-text-bottom feather feather-arrow-up"
              >
                <line x1="8" y1="3" x2="8" y2="13"></line>
                <polyline points="3 8 8 3 13 8"></polyline>
              </svg>
            )}
          </span>
        </div>
      </div>
      <div {...getCollapseProps()}>
        <div className="pt-1">
          <textarea
            className="w-full h-64 rounded bg-gray-900 text-white px-2 readonly"
            readOnly
            value={innerInfo}
          ></textarea>
        </div>
      </div>
    </div>
  )
}

export default ExpandablePanel
