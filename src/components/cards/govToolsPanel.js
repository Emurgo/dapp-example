import React from 'react'
import {ModalWindowContent} from '../ui-constants'

const GovToolsPanel = (props) => {
  const {buttonName, certLabel, clickFunction, children} = props
  const handleAction = () => {
    console.log(`[dApp][GovToolsPanel][${certLabel}] Building is called`)
    // action here
    clickFunction()
  }

  return (
    <div className={ModalWindowContent.contentPadding}>
      {children}
      <div className="flex">
        <div className="flex-auto mt-5">
          <button
            className="w-full py-1 rounded-md text-xl text-white font-semibold bg-orange-700 hover:bg-orange-800 active:bg-orange-500"
            onClick={handleAction}
          >
            {buttonName}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GovToolsPanel
