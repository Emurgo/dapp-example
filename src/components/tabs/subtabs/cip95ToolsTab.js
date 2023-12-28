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
  // Balance
  const [currentBalance, setBalance] = useState('')
  // UTxOs
  const [currentUtxos, setUtxos] = useState([])
  // ChangeAddress
  const [currentChangeAddress, setChangeAddress] = useState('')
  // Reward/stake address
  const [currentRewardAddress, setRewardAddress] = useState('')
  // Public DRep Key
  const [currentDRepIdBech32, setDRepIdBech32] = useState('')
  const [currentDRepIdHex, setDRepIdHex] = useState('')
  // Registered public stake key
  const [currentRegPubStakeKey, setRegPubStakeKey] = useState('')
  // Unregistered public stake key
  const [currentUnregPubStakeKey, setUnregPubStakeKey] = useState('')

  const setAndMapUtxos = (utxos) => {
    const mappedUtxos = utxos.map((utxo) => `${utxo.tx_hash} #${utxo.tx_index}: ${utxo.amount}`)
    setUtxos(mappedUtxos)
  }

  const setters = {
    setBalance,
    setAndMapUtxos,
    setChangeAddress,
    setRewardAddress,
    setDRepIdBech32,
    setDRepIdHex,
    setRegPubStakeKey,
    setUnregPubStakeKey,
  }
  const getters = {
    currentBalance,
    currentUtxos,
    currentChangeAddress,
    currentRewardAddress,
    currentDRepIdBech32,
    currentDRepIdHex,
    currentRegPubStakeKey,
    currentUnregPubStakeKey,
  }

  return (
    <div className="container mx-auto text-gray-300 py-5">
      {connectionState === CONNECTED ? (
        <div>
          <div className="mb-2">
            {/* Get info button should be here */}
            <GetAllInfoCard api={api} wasm={wasm} setters={setters} />
          </div>
          <div className="mb-2">
            {/* info panel here */}
            <InfoPanel getters={getters} />
          </div>
          <div>
            <Cip95AdditionalPart api={api} wasm={wasm} />
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  )
}

export default Cip95TabTools
