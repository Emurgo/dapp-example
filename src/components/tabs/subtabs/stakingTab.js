import {useState} from 'react'
import useYoroi from '../../../hooks/yoroiProvider'
import {CONNECTED} from '../../../utils/connectionStates'
import ResponsesPart from './responsesPart'
import WithdrawCard from '../../cards/staking/withdrawCard'

const Staking = () => {
  const {api, connectionState} = useYoroi()
  const [currentText, setCurrentText] = useState('')
  const [rawCurrentText, setRawCurrentText] = useState('')
  const [waiterState, setWaiterState] = useState(false)

  const setResponse = (response, stringifyIt = true) => {
    setCurrentText(stringifyIt ? JSON.stringify(response, undefined, 2) : response)
  }
  return (
    <div className="py-5 px-5 text-gray-300">
      {connectionState === CONNECTED ? (
        <div>
          <div className="grid justify-items-stretch grid-cols-4 gap-2 mb-4">
            <div>
              <WithdrawCard
                api={api}
                onRawResponse={setRawCurrentText}
                onResponse={setResponse}
                onWaiting={setWaiterState}
              />
            </div>
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

export default Staking
