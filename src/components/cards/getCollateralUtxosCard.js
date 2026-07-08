import React, {useState} from 'react'
import ApiCardWithModal from './apiCardWithModal'
import {CommonStyles, ModalWindowContent} from '../ui-constants'
import {getAmountInHex, getUtxoFromHex} from '../../utils/cslTools'
import runApiCall from '../../utils/runApiCall'

const GetCollateralUtxosCard = ({api, onRawResponse, onResponse, onWaiting}) => {
  const [getCollateralUtxosInput, setGetCollateralUtxosInput] = useState('2000000')

  const getCollateralUtxosClick = () => {
    const amountInHex = getCollateralUtxosInput ? getAmountInHex(getCollateralUtxosInput) : undefined
    return runApiCall(() => api.getCollateral(amountInHex), {onRawResponse, onResponse, onWaiting}, {
      parse: (hexUtxos) => hexUtxos.map(getUtxoFromHex),
    })
  }

  const apiProps = {
    buttonLabel: 'getCollateral',
    clickFunction: getCollateralUtxosClick,
  }

  return (
    <ApiCardWithModal {...apiProps}>
      <div className={ModalWindowContent.contentPadding}>
        <label htmlFor="amount" className={ModalWindowContent.contentLabelStyle}>
          Amount
        </label>
        <input
          type="number"
          min="0"
          id="amount"
          className={CommonStyles.inputStyles}
          placeholder="2000000"
          value={getCollateralUtxosInput}
          onChange={(event) => setGetCollateralUtxosInput(event.target.value)}
        />
      </div>
    </ApiCardWithModal>
  )
}

export default GetCollateralUtxosCard
