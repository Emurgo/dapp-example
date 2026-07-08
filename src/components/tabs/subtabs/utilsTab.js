import React from 'react'
import useResponseState from '../../../hooks/useResponseState'
import ResponsesPart from './responsesPart'
import CreateRandomKeyCard from '../../cards/createRandomKeyCard';

const UtilsTab = () => {
  const {currentText, rawCurrentText, waiterState, setRawCurrentText, setWaiterState, setResponse} = useResponseState()

  return (
    <div className="py-5 px-5 text-gray-300">
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-2">
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
