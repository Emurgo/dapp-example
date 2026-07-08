import React from 'react'
import ApiCard from '../apiCard'
import {weiHexToEth} from '../../../utils/ethereumUtils'
import runApiCall from '../../../utils/runApiCall'

const GetEthBalanceCard = ({accounts, onRawResponse, onResponse, onWaiting}) => {
  const getBalanceClick = () => {
    if (!accounts || accounts.length === 0) {
      onResponse('No account connected')
      return
    }
    return runApiCall(
      () => window.ethereum.request({method: 'eth_getBalance', params: [accounts[0], 'latest']}),
      {onRawResponse, onResponse, onWaiting},
      {parse: (hexBalance) => ({account: accounts[0], balanceWei: hexBalance, balanceEth: weiHexToEth(hexBalance)})},
    )
  }

  return <ApiCard apiName="eth_getBalance" clickFunction={getBalanceClick} />
}

export default GetEthBalanceCard
