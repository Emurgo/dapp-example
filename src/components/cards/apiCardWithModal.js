import React from 'react'
import Popup from 'reactjs-popup'

export const ApiCardWithModal = (props) => {
  const {buttonLabel, clickFunction, halfOpacity, children} = props

  const handleActionAndClose = (closeFunc) => {
    console.log(`[dApp][ApiCardWithModalV2] is called`)
    // action here
    clickFunction()
    closeFunc()
    console.log(`[dApp][ApiCardWithModalV2] is closed`)
  }

  const overlayStyle = {background: 'rgba(0,0,0,0.75)'}
  const modal = true
  const nested = false

  const buttonProps = {
    className:
      'w-full h-16 rounded-lg border-1 border-gray-600 text-white active:bg-orange-500 ' +
      (halfOpacity !== true ? 'bg-orange-700 hover:bg-orange-800' : 'bg-orange-700/50 hover:bg-orange-800/50'),
  }

  return (
    <Popup trigger={<button {...buttonProps}>{buttonLabel}</button>} {...{modal, nested, overlayStyle}}>
      {(close) => (
        <div className="bg-gray-900 border rounded-md border-gray-700 shadow-lg w-96 outline-none focus:outline-none">
          {/* close button and modal window title */}
          <div className="flex bg-blue-900">
            <div className="flex flex-auto justify-left">
              <div className="pl-1 bg-transparent text-white float-left text-2xl m-2 font-semibold outline-none focus:outline-none">
                {buttonLabel}
              </div>
            </div>
            <div className="flex-none">
              <button
                className="rounded-md border-black-300 bg-red-500 hover:bg-red-700 my-2 mr-1 active:bg-red-300 py-1 px-2"
                onClick={close}
              >
                &times;
              </button>
            </div>
          </div>
          {/* content section */}
          <div className="py-5">{children}</div>
          {/* end of content section*/}
          {/* confirmation button */}
          <div className="flex">
            <div className="flex-auto mb-2 mt-3 mx-2">
              <button
                className="w-full py-1 rounded-md text-xl text-white font-semibold bg-orange-700 hover:bg-orange-800 active:bg-orange-500"
                onClick={() => {
                  handleActionAndClose(close)
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </Popup>
  )
}

export default ApiCardWithModal
