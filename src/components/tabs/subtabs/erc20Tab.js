import React from 'react'
import useResponseState from '../../../hooks/useResponseState'
import useEthereum from '../../../hooks/ethereumProvider'
import ResponsesPart from './responsesPart'
import GetErc20BalanceCard from '../../cards/ethereum/getErc20BalanceCard'
import TransferErc20Card from '../../cards/ethereum/transferErc20Card'
import {CONNECTED} from '../../../utils/connectionStates'

const Erc20Tab = () => {
  const {accounts, connectionState} = useEthereum()
  const {currentText, rawCurrentText, waiterState, setRawCurrentText, setWaiterState, setResponse} = useResponseState()

  return (
    <div className="py-5 px-5 text-gray-300">
      {connectionState === CONNECTED ? (
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-2">
          <div className="grid justify-items-stretch grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <GetErc20BalanceCard
                accounts={accounts}
                onRawResponse={setRawCurrentText}
                onResponse={setResponse}
                onWaiting={setWaiterState}
              />
            </div>
            <div>
              <TransferErc20Card
                accounts={accounts}
                onRawResponse={setRawCurrentText}
                onResponse={setResponse}
                onWaiting={setWaiterState}
              />
            </div>
          </div>
          <ResponsesPart rawCurrentText={rawCurrentText} currentText={currentText} currentWaiterState={waiterState} />
        </div>
      ) : (
        <div></div>
      )}
    </div>
  )
}

export default Erc20Tab
