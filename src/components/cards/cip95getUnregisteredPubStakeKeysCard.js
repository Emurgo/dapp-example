import React from 'react'
import ApiCard from './apiCard'
import { getPublicKeyFromHex } from '../../utils/cslTools'
import runApiCall from '../../utils/runApiCall'

const Cip95GetUnregisteredPubStakeKeysCard = ({api, onRawResponse, onResponse, onWaiting}) => {
  const getUnregisteredPubStakeKeysClick = () =>
    runApiCall(() => api.cip95.getUnregisteredPubStakeKeys(), {onRawResponse, onResponse, onWaiting}, {
      parse: (unregPubStakeKeys) =>
        unregPubStakeKeys.length < 1
          ? 'No Unregistered Pub Stake Keys'
          : getPublicKeyFromHex(unregPubStakeKeys[0]).hash().to_hex(),
      stringify: false,
    })

  const apiProps = {
    apiName: 'getUnregisteredPubStakeKeys',
    clickFunction: getUnregisteredPubStakeKeysClick,
  }
  return <ApiCard {...apiProps} />
}

export default Cip95GetUnregisteredPubStakeKeysCard
