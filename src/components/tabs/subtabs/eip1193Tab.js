import React, {useState} from 'react'
import useEthereum from '../../../hooks/ethereumProvider'
import ResponsesPart from './responsesPart'
import Eip1193Part from './eip1193Part'
import {CONNECTED} from '../../../utils/connectionStates'

const Eip1193Tab = () => {
  const {accounts, connectionState} = useEthereum()
  const [currentText, setCurrentText] = useState('')
  const [rawCurrentText, setRawCurrentText] = useState('')
  const [waiterState, setWaiterState] = useState(false)

  const setResponse = (response, stringifyIt = true) => {
    setCurrentText(stringifyIt ? JSON.stringify(response, undefined, 2) : response)
  }

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
