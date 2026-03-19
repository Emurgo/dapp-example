import React from 'react'
import ApiCard from '../apiCard'

const GetAccountsCard = ({onRawResponse, onResponse, onWaiting}) => {
  const getAccountsClick = () => {
    onWaiting(true)
    window.ethereum
      .request({method: 'eth_accounts'})
      .then((accounts) => {
        onWaiting(false)
        onRawResponse(JSON.stringify(accounts))
        onResponse(accounts)
      })
      .catch((e) => {
        onWaiting(false)
        onRawResponse('')
        onResponse(e)
        console.error(e)
      })
  }

  return <ApiCard apiName="eth_accounts" clickFunction={getAccountsClick} />
}

export default GetAccountsCard
