import React, {useState} from 'react'
import useYoroi from '../../../hooks/yoroiProvider'
import useWasm from '../../../hooks/useWasm'
import ResponsesPart from './responsesPart'
import {CONNECTED} from '../../../utils/connectionStates'
import Cip95OfficialPart from './cip95OfficialPart'

const Cip95Tab = () => {
  const {api, connectionState} = useYoroi()
  const wasm = useWasm()
  const [currentText, setCurrentText] = useState('')
  const [rawCurrentText, setRawCurrentText] = useState('')
  const [waiterState, setWaiterState] = useState(false)

  const setResponse = (response, stringifyIt = true) => {
    setCurrentText(stringifyIt ? JSON.stringify(response, undefined, 2) : response)
  }

  return (
    <div className="container mx-auto text-gray-300 py-5">
      {connectionState === CONNECTED ? (
        <div className="grid grid-rows-3 gap-2">
          <div className="row-span-1">
            <Cip95OfficialPart
              api={api}
              wasm={wasm}
              setRawCurrentText={setRawCurrentText}
              setResponse={setResponse}
              setWaiterState={setWaiterState}
            />
          </div>
          <div className="row-span-2"></div>
          <div className="row-span-3">
            <ResponsesPart rawCurrentText={rawCurrentText} currentText={currentText} currentWaiterState={waiterState} />
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  )
}

export default Cip95Tab
