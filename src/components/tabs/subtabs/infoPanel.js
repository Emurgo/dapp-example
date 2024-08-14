import React from 'react'

// We need getters here
const InfoPanel = ({getters}) => {
  const {
    balance,
    utxos,
    changeAddress,
    rewardAddress,
    usedAddress,
    unusedAddress,
    dRepIdBech32,
    dRepIdHex,
    regPubStakeKey,
    unregPubStakeKey,
  } = getters

  const textColor = 'text-orange-700'
  const spanProperties = 'w-full break-words ' + textColor

  return (
    <div className="block p-5 min-w-full text-sm rounded-lg border shadow-md bg-gray-900 border-gray-700">
      <div className="grid justify-items-stretch grid-cols-1 lg:grid-cols-2 gap-2">
        <div>
          <span>Balance: </span>
          <span className={spanProperties}>{balance.length > 0 ? balance : '-'}</span>
        </div>
        <div>
          <span>UTxOs: </span>
          {utxos.length > 0 ? (
            utxos.map((utxo, index) => (
              <p className={spanProperties} key={index}>
                {utxo}
              </p>
            ))
          ) : (
            <span className={spanProperties}>-</span>
          )}
        </div>
        <div>
          <span>Change address: </span>
          <span className={spanProperties}>
            {changeAddress.length > 0 ? changeAddress : '-'}
          </span>
        </div>
        <div>
          <span>Reward address: </span>
          <span className={spanProperties}>{rewardAddress.length > 0 ? rewardAddress : '-'}</span>
        </div>
        <div>
          <span>Used address: </span>
          <span className={spanProperties}>{usedAddress.length > 0 ? usedAddress : '-'}</span>
        </div>
        <div>
          <span>Unused address: </span>
          <span className={spanProperties}>{unusedAddress.length > 0 ? unusedAddress : '-'}</span>
        </div>
        <div>
          <span>DRep ID Hex: </span>
          <span className={spanProperties}>{dRepIdHex.length > 0 ? dRepIdHex : '-'}</span>
        </div>
        <div>
          <span>DRep ID Bech32: </span>
          <span className={spanProperties}>{dRepIdBech32.length > 0 ? dRepIdBech32 : '-'}</span>
        </div>
        <div>
          <span>Registered public key (first): </span>
          <span className={spanProperties}>{regPubStakeKey.length > 0 ? regPubStakeKey : '-'}</span>
        </div>
        <div>
          <span>Unregistered public key (first): </span>
          <span className={spanProperties}>{unregPubStakeKey.length > 0 ? unregPubStakeKey : '-'}</span>
        </div>
      </div>
    </div>
  )
}

export default InfoPanel
