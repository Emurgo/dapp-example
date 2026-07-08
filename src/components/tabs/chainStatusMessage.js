import React from 'react'
import {CONNECTED, NO_PROVIDER} from '../../utils/connectionStates'

// Shared connection-status banner for each chain's main tab. Each chain passes
// its own wording; connectedContent (default none) shows when connected.
const ChainStatusMessage = ({connectionState, notFoundText, notConnectedText, connectedContent = null}) => {
  const message = () => {
    if (connectionState === CONNECTED) return connectedContent
    if (connectionState === NO_PROVIDER) return notFoundText
    return notConnectedText
  }

  return (
    <div className="bg-gray-900 grid justify-items-center pt-5">
      <div className="text-m font-bold tracking-tight text-white">{message()}</div>
    </div>
  )
}

export default ChainStatusMessage
