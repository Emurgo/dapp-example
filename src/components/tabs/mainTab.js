import {CONNECTED, NO_PROVIDER, NOT_CONNECTED} from '../../utils/connectionStates'
import ChainStatusMessage from './chainStatusMessage'

const MainTab = ({isWalletConnected, isNoProvider}) => {
  const connectionState = isWalletConnected ? CONNECTED : isNoProvider ? NO_PROVIDER : NOT_CONNECTED

  return (
    <ChainStatusMessage
      connectionState={connectionState}
      notFoundText="Cardano wallet is not found"
      notConnectedText="Wallet is not connected"
    />
  )
}

export default MainTab
