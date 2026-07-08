import {useState, useCallback} from 'react'

// Shared response state used by every subtab: the "Part" components write results
// through setResponse / setRawCurrentText / setWaiterState, and ResponsesPart
// renders currentText / rawCurrentText / waiterState.
const useResponseState = () => {
  const [currentText, setCurrentText] = useState('')
  const [rawCurrentText, setRawCurrentText] = useState('')
  const [waiterState, setWaiterState] = useState(false)

  const setResponse = useCallback((response, stringifyIt = true) => {
    setCurrentText(stringifyIt ? JSON.stringify(response, undefined, 2) : response)
  }, [])

  return {currentText, rawCurrentText, waiterState, setRawCurrentText, setWaiterState, setResponse}
}

export default useResponseState
