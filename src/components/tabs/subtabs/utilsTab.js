import React, {useState} from 'react'
import useYoroi from '../../../hooks/yoroiProvider'
import useWasm from '../../../hooks/useWasm'
import ExperimentalPart from './experimentalPart'
import ResponsesPart from './responsesPart'
import OfficialPart from './officialPart'
import {CONNECTED} from '../../../utils/connectionStates'
import IsEnabledCard from '../../cards/isEnabledCard';
import GetNetworkIdCard from '../../cards/getNetworkIdCard';
import GetExtensionsCard from '../../cards/getExtensionsCard';
import GetBalanceCard from '../../cards/getBalanceCard';
import GetUnusedAddressesCard from '../../cards/getUnusedAddressCard';
import GetUsedAddresses from '../../cards/getUsedAddressCard';
import GetChangeAddressCard from '../../cards/getChangeAddressCard';
import GetRewardAddressesCard from '../../cards/getRewardAddressesCard';
import GetUtxosCard from '../../cards/getUtxosCard';
import GetCollateralUtxosCard from '../../cards/getCollateralUtxosCard';
import SignDataCard from '../../cards/signDataCard';
import BuildTransactionCard from '../../cards/buildTransactionCard';
import SignTransactionCard from '../../cards/signTransactionCard';
import SubmitTransactionCard from '../../cards/submitTransactionCard';
import CreateRandomKeyCard from '../../cards/createRandomKeyCard';

const UtilsTab = () => {
  const {api} = useYoroi()
  const wasm = useWasm()
  const [currentText, setCurrentText] = useState('')
  const [rawCurrentText, setRawCurrentText] = useState('')
  const [waiterState, setWaiterState] = useState(false)

  const setResponse = (response, stringifyIt = true) => {
    setCurrentText(stringifyIt ? JSON.stringify(response, undefined, 2) : response)
  }

  return (
    <div className="py-5 px-5 text-gray-300">
      <div className="grid grid-cols-3 gap-2">
        <div className="grid justify-items-stretch grid-cols-1 lg:grid-cols-2 gap-2">
          <div>
            <CreateRandomKeyCard
              wasm={wasm}
              onResponse={setResponse}
              onWaiting={setWaiterState} />
          </div>
        </div>
        <ResponsesPart rawCurrentText={rawCurrentText} currentText={currentText} currentWaiterState={waiterState} />
      </div>
    </div>
  )
}

export default UtilsTab
