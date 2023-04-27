import React from 'react'
import ApiCard from './apiCard'

const IsEnabledCard = ({onRawResponse, onResponse, onWaiting}) => {
  const isDisabledClick = () => {
    onWaiting(true)
    // use selectedWallet window.cardano[selectedWallet]
    window.cardano.yoroi
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
        console.error(e)
      })
  }

  const apiProps = {
    apiName: 'isEnabled',
    clickFunction: isDisabledClick,
  }

  return <ApiCard {...apiProps} />
}

export default IsEnabledCard
