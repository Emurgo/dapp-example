import React from 'react'
import ApiCard from './apiCard'

const Cip95GetUnregisteredPubStakeKeysCard = ({api, wasm, onRawResponse, onResponse, onWaiting}) => {
  const getUnregisteredPubStakeKeysClick = () => {
    onWaiting(true)
    api?.cip95.getUnregisteredPubStakeKeys()
      .then((unregPubStakeKeys) => {
        console.log('unregPubStakeKeys: ', unregPubStakeKeys)
        onWaiting(false)
        onRawResponse(unregPubStakeKeys)
        if (unregPubStakeKeys.length < 1) {
            onResponse("No Unregistered Pub Stake Keys", false)
        } else {
            const unregPubStakeKey = unregPubStakeKeys[0]
            const stakeKeyHash = ((wasm.PublicKey.from_hex(unregPubStakeKey)).hash()).to_hex()
            onResponse(stakeKeyHash, false)
        }
      })
      .catch((e) => {
        onWaiting(false)
        onRawResponse('')
        onResponse(e)
        console.log(e)
      })
  }

  const apiProps = {
    apiName: 'getUnregisteredPubStakeKeys',
    clickFunction: getUnregisteredPubStakeKeysClick,
  }
  return <ApiCard {...apiProps} />
}

export default Cip95GetUnregisteredPubStakeKeysCard
