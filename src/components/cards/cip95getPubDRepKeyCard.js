import React from 'react'
import ApiCard from './apiCard'
import {getPublicKeyFromHex} from '../../utils/cslTools'
import runApiCall from '../../utils/runApiCall'

const Cip95GetPubDRepKeyCard = ({api, onRawResponse, onResponse, onWaiting}) => {
  const getPubDRepKeyClick = () =>
    runApiCall(
      () => api.cip95.getPubDRepKey(),
      {onRawResponse, onResponse, onWaiting},
      {
        parse: (pubDRepKey) => {
          const dRepID = getPublicKeyFromHex(pubDRepKey).hash()
          return {
            dRepIDHex: dRepID.to_hex(),
            dRepIDBech32: dRepID.to_bech32('drep'),
          }
        },
      },
    )

  const apiProps = {
    apiName: 'getPubDRepKey',
    clickFunction: getPubDRepKeyClick,
  }
  return <ApiCard {...apiProps} />
}

export default Cip95GetPubDRepKeyCard
