import React from 'react'
import ApiCard from './apiCard'

const Cip95GetRegisteredPubStakeKeysCard = ({api, wasm, onRawResponse, onResponse, onWaiting}) => {
  const getRegisteredPubStakeKeysClick = () => {
    onWaiting(true)
    api?.cip95
      .getRegisteredPubStakeKeys()
      .then((regPubStakeKeys) => {
        console.log('regPubStakeKeys: ', regPubStakeKeys)
        onWaiting(false)
        onRawResponse(regPubStakeKeys)
        if (regPubStakeKeys.length < 1) {
          onResponse('No Registered Pub Stake Keys', false)
        } else {
          const regPubStakeKey = regPubStakeKeys[0]
          const stakeKeyHash = wasm.PublicKey.from_hex(regPubStakeKey).hash().to_hex()
          onResponse(stakeKeyHash)
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
    apiName: 'getRegisteredPubStakeKeys',
    clickFunction: getRegisteredPubStakeKeysClick,
  }
  return <ApiCard {...apiProps} />
}

export default Cip95GetRegisteredPubStakeKeysCard
