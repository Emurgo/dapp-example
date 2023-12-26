import React from 'react'
import {useCollapse} from 'react-collapsed'

const Cip95AdditionaPart = ({api, wasm, onRawResponse, onResponse, onWaiting}) => {
    const {getCollapseProps, getToggleProps, isExpanded} = useCollapse()

    return (
        <div className="border rounded bg-gray-700 border-gray-700 p-5 mt-5">
          <div {...getToggleProps()}>
            <div>
              <span className="text-2xl">
                Additional methods&nbsp;
                {isExpanded ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="inline align-text-bottom feather feather-arrow-down"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="inline align-text-bottom feather feather-arrow-up"
                  >
                    <line x1="12" y1="19" x2="12" y2="5"></line>
                    <polyline points="5 12 12 5 19 12"></polyline>
                  </svg>
                )}
              </span>
            </div>
          </div>
          <div {...getCollapseProps()}>
            <div className="grid justify-items-stretch grid-cols-1 lg:grid-cols-4 gap-2 pt-3">
              <div>
                {/* <AuthCard api={api} onRawResponse={onRawResponse} onResponse={onResponse} onWaiting={onWaiting} /> */}
              </div>
              <div>
                {/* <ListNFTsCard api={api} onRawResponse={onRawResponse} onResponse={onResponse} onWaiting={onWaiting} /> */}
              </div>
            </div>
          </div>
        </div>
      )
}

export default Cip95AdditionaPart