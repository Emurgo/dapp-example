import React from 'react'
import useResponseState from '../../../hooks/useResponseState'
import useEthereum from '../../../hooks/ethereumProvider'
import ResponsesPart from './responsesPart'
import Eip1193Part from './eip1193Part'
import {CONNECTED} from '../../../utils/connectionStates'

const Eip1193Tab = () => {
  const {accounts, connectionState} = useEthereum()
  const {currentText, rawCurrentText, waiterState, setRawCurrentText, setWaiterState, setResponse} = useResponseState()

  return (
    <div className="py-5 px-5 text-gray-300">
      {connectionState === CONNECTED ? (
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-2">
          <Eip1193Part
            accounts={accounts}
            setRawCurrentText={setRawCurrentText}
            setResponse={setResponse}
            setWaiterState={setWaiterState}
          />
          <ResponsesPart rawCurrentText={rawCurrentText} currentText={currentText} currentWaiterState={waiterState} />
        </div>
      ) : (
        <div></div>
      )}
    </div>
  )
}

export default Eip1193Tab
