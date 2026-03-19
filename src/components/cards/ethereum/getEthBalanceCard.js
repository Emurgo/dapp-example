import React from 'react'
import ApiCard from '../apiCard'
import {weiHexToEth} from '../../../utils/ethereumUtils'

const GetEthBalanceCard = ({accounts, onRawResponse, onResponse, onWaiting}) => {
  const getBalanceClick = () => {
    if (!accounts || accounts.length === 0) {
      onResponse('No account connected')
      return
    }
    onWaiting(true)
    window.ethereum
      .request({method: 'eth_getBalance', params: [accounts[0], 'latest']})
      .then((hexBalance) => {
        onWaiting(false)
        onRawResponse(hexBalance)
        onResponse({account: accounts[0], balanceWei: hexBalance, balanceEth: weiHexToEth(hexBalance)})
      })
      .catch((e) => {
        onWaiting(false)
        onRawResponse('')
        onResponse(e)
        console.error(e)
      })
  }

  return <ApiCard apiName="eth_getBalance" clickFunction={getBalanceClick} />
}

export default GetEthBalanceCard
