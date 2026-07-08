import {useState, useCallback} from 'react'
import {NOT_CONNECTED, IN_PROGRESS, CONNECTED, NO_PROVIDER} from '../utils/connectionStates'

// Shared connection-state machine used by every chain provider so the
// NOT_CONNECTED / IN_PROGRESS / CONNECTED / NO_PROVIDER transitions stay
// consistent across chains. Returns the raw setter too, for the rare caller
// that needs it (e.g. App's reconnect polling via the Cardano context).
const useConnectionState = (initial = NO_PROVIDER) => {
  const [connectionState, setConnectionState] = useState(initial)

  const setConnected = useCallback(() => setConnectionState(CONNECTED), [])
  const setNotConnected = useCallback(() => setConnectionState(NOT_CONNECTED), [])
  const setInProgress = useCallback(() => setConnectionState(IN_PROGRESS), [])
  const setNoProvider = useCallback(() => setConnectionState(NO_PROVIDER), [])

  return {connectionState, setConnectionState, setConnected, setNotConnected, setInProgress, setNoProvider}
}

export default useConnectionState
