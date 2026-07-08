import {NO_PROVIDER} from '../../utils/connectionStates'
import ChainStatusMessage from './chainStatusMessage'

const BitcoinMainTab = () => (
  <ChainStatusMessage connectionState={NO_PROVIDER} notFoundText="Bitcoin support coming soon" />
)

export default BitcoinMainTab
