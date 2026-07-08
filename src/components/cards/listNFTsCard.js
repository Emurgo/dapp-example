import React from 'react'
import ApiCard from './apiCard'
import runApiCall from '../../utils/runApiCall'

const ListNFTsCard = ({api, onRawResponse, onResponse, onWaiting}) => {
  const listNFTsClick = () =>
    runApiCall(() => api.experimental.listNFTs(), {onRawResponse, onResponse, onWaiting}, {rawText: () => ''})

  const apiProps = {
    apiName: 'listNFTs',
    clickFunction: listNFTsClick,
  }

  return <ApiCard {...apiProps} />
}

export default ListNFTsCard
