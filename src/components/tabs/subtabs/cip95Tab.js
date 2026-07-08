import React from 'react'
import useResponseState from '../../../hooks/useResponseState'
import useCardano from '../../../hooks/cardanoProvider'
import ResponsesPart from './responsesPart'
import {CONNECTED} from '../../../utils/connectionStates'
import Cip95OfficialPart from './cip95OfficialPart'

const Cip95Tab = () => {
  const {api, connectionState} = useCardano()
  const {currentText, rawCurrentText, waiterState, setRawCurrentText, setWaiterState, setResponse} = useResponseState()

  return (
    <div className="py-5 px-5 text-gray-300">
      {connectionState === CONNECTED ? (
        <div>
          <div className="mb-3">
            <Cip95OfficialPart
              api={api}
              setRawCurrentText={setRawCurrentText}
              setResponse={setResponse}
              setWaiterState={setWaiterState}
            />
          </div>
          <div>
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
