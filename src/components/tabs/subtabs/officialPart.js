import React from 'react'
import GetBalanceCard from '../../cards/getBalanceCard'
import GetChangeAddressCard from '../../cards/getChangeAddressCard'
import GetCollateralUtxosCard from '../../cards/getCollateralUtxosCard'
import GetRewardAddressesCard from '../../cards/getRewardAddressesCard'
import GetUnusedAddressesCard from '../../cards/getUnusedAddressCard'
import GetUsedAddresses from '../../cards/getUsedAddressCard'
import GetUtxosCard from '../../cards/getUtxosCard'
import SignDataCard from '../../cards/signDataCard'
import BuildTransactionCard from '../../cards/buildTransactionCard'
import SignTransactionCard from '../../cards/signTransactionCard'
import SubmitTransactionCard from '../../cards/submitTransactionCard'
import IsEnabledCard from '../../cards/isEnabledCard'
import GetNetworkIdCard from '../../cards/getNetworkIdCard'
import GetExtensionsCard from '../../cards/getExtensionsCard'

const OfficialPart = ({api, wasm, setRawCurrentText, setResponse, setWaiterState}) => {
  return (
    <div className="grid justify-items-stretch grid-cols-1 lg:grid-cols-2 gap-2">
      <div>
        <IsEnabledCard onRawResponse={setRawCurrentText} onResponse={setResponse} onWaiting={setWaiterState} />
      </div>
      <div>
        <GetNetworkIdCard
          api={api}
          wasm={wasm}
          onRawResponse={setRawCurrentText}
          onResponse={setResponse}
          onWaiting={setWaiterState}
        />
      </div>
      <div>
        <GetExtensionsCard
          api={api}
          wasm={wasm}
          onRawResponse={setRawCurrentText}
          onResponse={setResponse}
          onWaiting={setWaiterState}
        />
      </div>
      <div>
        <GetBalanceCard
          api={api}
          wasm={wasm}
          onRawResponse={setRawCurrentText}
          onResponse={setResponse}
          onWaiting={setWaiterState}
        />
      </div>
      <div>
        <GetUnusedAddressesCard
          api={api}
          wasm={wasm}
          onRawResponse={setRawCurrentText}
          onResponse={setResponse}
          onWaiting={setWaiterState}
        />
      </div>
      <div>
        <GetUsedAddresses
          api={api}
          wasm={wasm}
          onRawResponse={setRawCurrentText}
          onResponse={setResponse}
          onWaiting={setWaiterState}
        />
      </div>
      <div>
        <GetChangeAddressCard
          api={api}
          wasm={wasm}
          onRawResponse={setRawCurrentText}
          onResponse={setResponse}
          onWaiting={setWaiterState}
        />
      </div>
      <div>
        <GetRewardAddressesCard
          api={api}
          wasm={wasm}
          onRawResponse={setRawCurrentText}
          onResponse={setResponse}
          onWaiting={setWaiterState}
        />
      </div>
      <div>
        <GetUtxosCard
          api={api}
          wasm={wasm}
          onRawResponse={setRawCurrentText}
          onResponse={setResponse}
          onWaiting={setWaiterState}
        />
      </div>
      <div>
        <GetCollateralUtxosCard
          api={api}
          wasm={wasm}
          onRawResponse={setRawCurrentText}
          onResponse={setResponse}
          onWaiting={setWaiterState}
        />
      </div>
      <div>
        <SignDataCard api={api} onRawResponse={setRawCurrentText} onResponse={setResponse} onWaiting={setWaiterState} />
      </div>
      <div>
        <BuildTransactionCard
          api={api}
          wasm={wasm}
          onRawResponse={setRawCurrentText}
          onResponse={setResponse}
          onWaiting={setWaiterState}
        />
      </div>
      <div>
        <SignTransactionCard
          api={api}
          wasm={wasm}
          onRawResponse={setRawCurrentText}
          onResponse={setResponse}
          onWaiting={setWaiterState}
        />
      </div>
      <div>
        <SubmitTransactionCard
          api={api}
          onRawResponse={setRawCurrentText}
          onResponse={setResponse}
          onWaiting={setWaiterState}
        />
      </div>
    </div>
  )
}

export default OfficialPart
