import React, {useState} from 'react'
import ApiCardWithModal from './apiCardWithModal'
import {ModalWindowContent} from '../ui-constants'
import InputWithLabel from '../inputWithLabel'
import {getAmountInHex, hexArrayToUtxos} from '../../utils/cslTools'
import runApiCall from '../../utils/runApiCall'

const GetCollateralUtxosCard = ({api, onRawResponse, onResponse, onWaiting}) => {
  const [getCollateralUtxosInput, setGetCollateralUtxosInput] = useState('2000000')

  const getCollateralUtxosClick = () => {
    const amountInHex = getCollateralUtxosInput ? getAmountInHex(getCollateralUtxosInput) : undefined
    return runApiCall(() => api.getCollateral(amountInHex), {onRawResponse, onResponse, onWaiting}, {
      parse: hexArrayToUtxos,
    })
  }

  const apiProps = {
    buttonLabel: 'getCollateral',
    clickFunction: getCollateralUtxosClick,
  }

  return (
    <ApiCardWithModal {...apiProps}>
      <div className={ModalWindowContent.contentPadding}>
        <InputWithLabel
          inputName="Amount"
          type="number"
          min="0"
          placeholder="2000000"
          inputValue={getCollateralUtxosInput}
          onChangeFunction={(event) => setGetCollateralUtxosInput(event.target.value)}
          wrapperClassName=""
        />
      </div>
    </ApiCardWithModal>
  )
}

export default GetCollateralUtxosCard
