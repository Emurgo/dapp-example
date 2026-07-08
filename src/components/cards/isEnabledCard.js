import logger from '../../utils/logger'
import ApiCard from './apiCard'

const IsEnabledCard = ({onRawResponse, onResponse, onWaiting, selectedWallet}) => {
  const isDisabledClick = () => {
    onWaiting(true)
    window.cardano[selectedWallet]
      ?.isEnabled()
      .then((enabled) => {
        onWaiting(false)
        onRawResponse(enabled)
        onResponse(enabled)
      })
      .catch((e) => {
        onWaiting(false)
        onRawResponse('')
        onResponse(e)
        logger.error(e)
      })
  }

  const apiProps = {
    apiName: 'isEnabled',
    clickFunction: isDisabledClick,
  }

  return <ApiCard {...apiProps} />
}

export default IsEnabledCard
