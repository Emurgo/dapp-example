import React, {useState} from 'react'
import useYoroi from '../../../hooks/yoroiProvider'
import useWasm from '../../../hooks/useWasm'
import {CONNECTED} from '../../../utils/connectionStates'
import Cip95AdditionalPart from './cip95AdditionalPart'
import GetAllInfoCard from '../../cards/getAllInfoCard'
import InfoPanel from './infoPanel'

const Cip95TabTools = () => {
  const {api, connectionState} = useYoroi()
  const wasm = useWasm()
  // Waiter label
  const [waiterState, setWaiterState] = useState(false)
  // Error label
  const [errorState, setErrorState] = useState(false)
  // Balance
  const [balance, setBalance] = useState('')
  // UTxOs
  const [utxos, setUtxos] = useState([])
  const [hexUtxos, setHexUtxos] = useState([])
  // ChangeAddress
  const [changeAddress, setChangeAddress] = useState('')
  // Reward/stake address
  const [rewardAddress, setRewardAddress] = useState('')
  // Used address
  const [usedAddress, setUsedAddress] = useState('')
  // Unused address
  const [unusedAddress, setUnusedAddress] = useState('')
  // Public DRep Key
  const [dRepIdBech32, setDRepIdBech32] = useState('')
  const [dRepIdHex, setDRepIdHex] = useState('')
  const [dRepIdInputValue, setDRepIdInputValue] = useState('')
  // Registered public stake key
  const [regPubStakeKey, setRegPubStakeKey] = useState('')
  // Unregistered public stake key
  const [unregPubStakeKey, setUnregPubStakeKey] = useState('')
  const [totalRefunds, setTotalRefunds] = useState('')

  const showWarning = () => {
    setErrorState(true)
    setTimeout(() => setErrorState(false), 3000)
  }

  const setAndMapUtxos = (utxos) => {
    const mappedUtxos = utxos.map((utxo) => `${utxo.tx_hash} #${utxo.tx_index}: ${utxo.amount}`)
    const mappedHexUtxos = utxos.map((utxo) => utxo.hex)
    setUtxos(mappedUtxos)
    setHexUtxos(mappedHexUtxos)
  }

  const setters = {
    setBalance,
    setAndMapUtxos,
    setChangeAddress,
    setRewardAddress,
    setUsedAddress,
    setUnusedAddress,
    setDRepIdBech32,
    setDRepIdHex,
    setDRepIdInputValue,
    setRegPubStakeKey,
    setUnregPubStakeKey,
    setTotalRefunds,
  }
  const getters = {
    balance,
    utxos,
    hexUtxos,
    changeAddress,
    rewardAddress,
    usedAddress,
    unusedAddress,
    dRepIdBech32,
    dRepIdHex,
    dRepIdInputValue,
    regPubStakeKey,
    unregPubStakeKey,
    totalRefunds,
  }

  return (
    <div className="py-5 px-5 text-gray-300">
      {connectionState === CONNECTED ? (
        <div>
          <div className="mb-2">
            {/* Get info button should be here */}
            <GetAllInfoCard api={api} wasm={wasm} onWaiting={setWaiterState} onError={showWarning} setters={setters} />
          </div>
          <div className="mb-2">
            {/* info panel here */}
            <InfoPanel getters={getters} />
          </div>
          {/* Info and error message is here */}
          <div className="grid justify-items-center content-end h-12 text-2xl">
            <label className="text-white">{waiterState ? 'Waiting ...' : ''}</label>
            <label className="text-red-500">{errorState ? 'An error has happend. Please check logs.' : ''}</label>
          </div>
          {/* Tabs with gov. actions */}
          <div>
            <Cip95AdditionalPart
              api={api}
              wasm={wasm}
              onWaiting={setWaiterState}
              onError={showWarning}
              getters={getters}
              setters={setters}
            />
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  )
}

export default Cip95TabTools
