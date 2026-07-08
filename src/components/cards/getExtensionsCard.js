import React from 'react'
import ApiCard from './apiCard'
import runApiCall from '../../utils/runApiCall'

const GetExtensionsCard = ({api, onRawResponse, onResponse, onWaiting}) => {
  const getExtensionsClick = () =>
    runApiCall(() => api.getExtensions(), {onRawResponse, onResponse, onWaiting}, {rawText: () => ''})

  const apiProps = {
    apiName: 'getExtensions',
    clickFunction: getExtensionsClick,
  }

  return <ApiCard {...apiProps} />
}

export default GetExtensionsCard
