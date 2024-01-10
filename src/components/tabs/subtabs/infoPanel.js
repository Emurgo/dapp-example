import React from 'react'

// We need getters here
const InfoPanel = ({getters}) => {
  const {
    currentBalance,
    currentUtxos,
    currentChangeAddress,
    currentRewardAddress,
    currentDRepIdBech32,
    currentDRepIdHex,
    currentRegPubStakeKey,
    currentUnregPubStakeKey,
  } = getters

  const textColor = 'text-orange-700'

  return (
    <div className="block p-5 min-w-full rounded-lg border shadow-md bg-gray-900 border-gray-700">
      <div className="grid justify-items-stretch grid-cols-1 lg:grid-cols-2 gap-2">
        <div>
          <span>Balance: </span>
          <span className={textColor}>{currentBalance.length > 0 ? currentBalance : '-'}</span>
        </div>
        <div>
          <span>UTxOs: </span>
          {currentUtxos.length > 0 ? (
            currentUtxos.map((utxo, index) => (
              <p className={textColor} key={index}>
                {utxo}
              </p>
            ))
          ) : (
            <span className={textColor}>-</span>
          )}
        </div>
        <div>
          <span>Change address: </span>
          <span className={'w-full break-words ' + textColor}>
            {currentChangeAddress.length > 0 ? currentChangeAddress : '-'}
          </span>
        </div>
        <div>
          <span>Reward address: </span>
          <span className={textColor}>{currentRewardAddress.length > 0 ? currentRewardAddress : '-'}</span>
        </div>
        <div>
          <span>DRep ID Hex: </span>
          <span className={textColor}>{currentDRepIdHex.length > 0 ? currentDRepIdHex : '-'}</span>
        </div>
        <div>
          <span>DRep ID Bech32: </span>
          <span className={textColor}>{currentDRepIdBech32.length > 0 ? currentDRepIdBech32 : '-'}</span>
        </div>
        <div>
          <span>Registered public key (first): </span>
          <span className={textColor}>{currentRegPubStakeKey.length > 0 ? currentRegPubStakeKey : '-'}</span>
        </div>
        <div>
          <span>Unregistered public key (first): </span>
          <span className={textColor}>{currentUnregPubStakeKey.length > 0 ? currentUnregPubStakeKey : '-'}</span>
        </div>
      </div>
    </div>
  )
}

export default InfoPanel
