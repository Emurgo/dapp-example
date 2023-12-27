import React from 'react'
import VoteDelationCard from '../../cards/voteDelegation'

const Cip95AdditionalPart = ({api, wasm, onRawResponse, onResponse, onWaiting}) => {

  return (
    <div className="grid justify-items-stretch grid-cols-1 lg:grid-cols-5 gap-2">
      <div>
        <VoteDelationCard
          api={api}
          wasm={wasm}
          onRawResponse={onRawResponse}
          onResponse={onResponse}
          onWaiting={onWaiting}
        />
      </div>
    </div>
  )
}

export default Cip95AdditionalPart
