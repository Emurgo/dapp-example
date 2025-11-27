import React from 'react'
import ApiCard from './apiCard'
import { getPublicKeyFromHex } from '../../utils/cslTools'

const Cip95EnableCard = ({walletName, onRawResponse, onResponse, onWaiting}) => {
  const getPubDRepKeyClick = () => {
    onWaiting(true)
    window.cardano[api.walletName].enable({ "cip": 95 })
    api?.enable
      .getPubDRepKey()
      .then((pubDRepKey) => {
        onWaiting(false)
        onRawResponse(pubDRepKey)
        const dRepID = getPublicKeyFromHex(pubDRepKey).hash()
        const dRepIDHex = dRepID.to_hex()
        const dRepIDBech32 = dRepID.to_bech32('drep')
        onResponse({
          dRepIDHex: dRepIDHex,
          dRepIDBech32: dRepIDBech32,
        })
      })
      .catch((e) => {
        onWaiting(false)
        onRawResponse('')
        onResponse(e)
        console.log(e)
      })
  }

  const apiProps = {
    apiName: 'getPubDRepKey',
    clickFunction: getPubDRepKeyClick,
  }
  return <ApiCard {...apiProps} />
}

export default Cip95EnableCard
