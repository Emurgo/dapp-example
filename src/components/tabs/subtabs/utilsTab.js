import React, {useState} from 'react'
import ResponsesPart from './responsesPart'
import CreateRandomKeyCard from '../../cards/createRandomKeyCard';

const UtilsTab = () => {
  const [currentText, setCurrentText] = useState('')
  const [rawCurrentText, setRawCurrentText] = useState('')
  const [waiterState, setWaiterState] = useState(false)

  const setResponse = (response, stringifyIt = true) => {
    setCurrentText(stringifyIt ? JSON.stringify(response, undefined, 2) : response);
  }

  return (
    <div className="py-5 px-5 text-gray-300">
      <div className="grid grid-cols-3 gap-2">
        <div className="grid justify-items-stretch grid-cols-1 lg:grid-cols-2 gap-2">
          <div>
            <CreateRandomKeyCard
              onRawResponse={setRawCurrentText}
              onResponse={setResponse}
              onWaiting={setWaiterState} />
          </div>
        </div>
        <ResponsesPart rawCurrentText={rawCurrentText} currentText={currentText} currentWaiterState={waiterState} />
      </div>
    </div>
  )
}

export default UtilsTab
