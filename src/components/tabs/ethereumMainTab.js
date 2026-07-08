import useEthereum from '../../hooks/ethereumProvider'
import ChainStatusMessage from './chainStatusMessage'

const EthereumMainTab = () => {
  const {connectionState} = useEthereum()

  return (
    <ChainStatusMessage
      connectionState={connectionState}
      notFoundText="No Ethereum wallet found. Please install a compatible Ethereum wallet."
      notConnectedText="Ethereum wallet is not connected"
    />
  )
}

export default EthereumMainTab
