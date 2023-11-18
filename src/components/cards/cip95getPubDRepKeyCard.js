import React from 'react'
import ApiCard from './apiCard'

const Cip95GetPubDRepKeyCard = ({api, wasm, onRawResponse, onResponse, onWaiting}) => {
  const getPubDRepKeyClick = () => {
    onWaiting(true)
    api?.cip95.getPubDRepKey()
      .then((pubDRepKey) => {
        onWaiting(false)
        onRawResponse(pubDRepKey)
        const dRepID = (wasm.PublicKey.from_hex(pubDRepKey)).hash()
        const dRepIDHex = dRepID.to_hex()
        const dRepIDBech32 = dRepID.to_bech32('drep')
        onResponse({
            dRepIDHash: dRepIDHex,
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

export default Cip95GetPubDRepKeyCard
