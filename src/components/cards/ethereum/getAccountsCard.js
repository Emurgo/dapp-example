import React from 'react'
import ApiCard from '../apiCard'
import runApiCall from '../../../utils/runApiCall'

const GetAccountsCard = ({onRawResponse, onResponse, onWaiting}) => {
  const getAccountsClick = () =>
    runApiCall(() => window.ethereum.request({method: 'eth_accounts'}), {onRawResponse, onResponse, onWaiting}, {
      rawText: (accounts) => JSON.stringify(accounts),
    })

  return <ApiCard apiName="eth_accounts" clickFunction={getAccountsClick} />
}

export default GetAccountsCard
