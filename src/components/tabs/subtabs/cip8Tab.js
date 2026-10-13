import React from 'react'
import useResponseState from '../../../hooks/useResponseState'
import useCardano from '../../../hooks/cardanoProvider'
import ResponsesPart from './responsesPart'
import Cip8BlindSigningCard from '../../cards/cip8BlindSigningCard'
import {CONNECTED} from '../../../utils/connectionStates'

const Cip8Tab = () => {
  const {api, connectionState} = useCardano()
  const {currentText, rawCurrentText, waiterState, setRawCurrentText, setWaiterState, setResponse} = useResponseState()

  return (
    <div className="py-5 px-5 text-gray-300">
      {connectionState === CONNECTED ? (
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-2">
          <div className="grid justify-items-stretch grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <Cip8BlindSigningCard
                api={api}
                onRawResponse={setRawCurrentText}
                onResponse={setResponse}
                onWaiting={setWaiterState}
              />
            </div>
          </div>
          <ResponsesPart rawCurrentText={rawCurrentText} currentText={currentText} currentWaiterState={waiterState} />
        </div>
      ) : (
        <div></div>
      )}
    </div>
  )
}

export default Cip8Tab
