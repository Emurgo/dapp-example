import React from 'react'
import GetAccountsCard from '../../cards/ethereum/getAccountsCard'
import GetChainIdCard from '../../cards/ethereum/getChainIdCard'
import GetEthBalanceCard from '../../cards/ethereum/getEthBalanceCard'
import SignEthMessageCard from '../../cards/ethereum/signEthMessageCard'

const Eip1193Part = ({accounts, setRawCurrentText, setResponse, setWaiterState}) => {
  return (
    <div className="grid justify-items-stretch grid-cols-1 md:grid-cols-2 gap-2">
      <div>
        <GetAccountsCard onRawResponse={setRawCurrentText} onResponse={setResponse} onWaiting={setWaiterState} />
      </div>
      <div>
        <GetChainIdCard onRawResponse={setRawCurrentText} onResponse={setResponse} onWaiting={setWaiterState} />
      </div>
      <div>
        <GetEthBalanceCard accounts={accounts} onRawResponse={setRawCurrentText} onResponse={setResponse} onWaiting={setWaiterState} />
      </div>
      <div>
        <SignEthMessageCard accounts={accounts} onRawResponse={setRawCurrentText} onResponse={setResponse} onWaiting={setWaiterState} />
      </div>
    </div>
  )
}

export default Eip1193Part
