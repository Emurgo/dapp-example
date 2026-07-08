import ApiCard from './apiCard'
import runApiCall from '../../utils/runApiCall'

const IsEnabledCard = ({onRawResponse, onResponse, onWaiting, selectedWallet}) => {
  const isDisabledClick = () =>
    runApiCall(() => window.cardano[selectedWallet].isEnabled(), {onRawResponse, onResponse, onWaiting})

  const apiProps = {
    apiName: 'isEnabled',
    clickFunction: isDisabledClick,
  }

  return <ApiCard {...apiProps} />
}

export default IsEnabledCard
