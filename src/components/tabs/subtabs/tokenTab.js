import {useState} from 'react'
import {Buffer} from 'buffer'
import useYoroi from '../../../hooks/yoroiProvider'
import useWasm from '../../../hooks/useWasm'
import {hexToBytes, bytesToHex} from '../../../utils/utils'
import {
  getAddressFromBytes,
  getAssetName,
  getNativeScript,
  getPubKeyHash,
  getTransactionOutputBuilder,
  getTxBuilder,
  strToBigNum,
  toInt,
} from '../../../utils/cslTools'
import {CONNECTED} from '../../../utils/connectionStates'
import InputWithLabel from '../../inputWithLabel'

const TokenTab = () => {
  const {api, connectionState} = useYoroi()
  const wasm = useWasm()
  const [currentTokenName, setCurrentTokenName] = useState('')
  const [currentTokenTicker, setCurrentTokenTicker] = useState('')
  const [currentTokenDescription, setCurrentTokenDescription] = useState('')
  const [currentQuantity, setCurrentQuantity] = useState(2)

  return (
    <div>
      {connectionState === CONNECTED ? (
        <div className="grid justify-items-center py-5 px-5">
          <div className="block p-6 min-w-full rounded-lg border shadow-md bg-gray-800 border-gray-700">
            <div className="flex pb-5">
              <div className="flex-1">
                {/* Inputs */}
                <InputWithLabel
                  inputName="Token Name"
                  inputValue={currentTokenName}
                  onChangeFunction={(event) => {
                    setCurrentTokenName(event.target.value)
                  }}
                />
                <InputWithLabel
                  inputName="Token Ticker"
                  inputValue={currentTokenTicker}
                  onChangeFunction={(event) => {
                    setCurrentTokenDescription(event.target.value)
                  }}
                />
                <InputWithLabel
                  inputName="Token Description"
                  inputValue={currentTokenDescription}
                  onChangeFunction={(event) => {
                    setCurrentTokenTicker(event.target.value)
                  }}
                />
                <InputWithLabel
                  inputName="Token Quantity"
                  type="number"
                  inputValue={currentQuantity}
                  onChangeFunction={(event) => {
                    setCurrentQuantity(event.target.value)
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  )
}

export default TokenTab
