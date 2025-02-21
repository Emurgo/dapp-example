import React from 'react'
import Cip95GetPubDRepKeyCard from '../../cards/cip95getPubDRepKeyCard'
import Cip95GetRegisteredPubStakeKeysCard from '../../cards/cip95getRegisteredPubStakeKeysCard'
import Cip95GetUnregisteredPubStakeKeysCard from '../../cards/cip95getUnregisteredPubStakeKeysCard'
import Cip95SignDataCard from '../../cards/cip95SignDataCard'

const Cip95OfficialPart = ({api, setRawCurrentText, setResponse, setWaiterState}) => {
  return (
    <div className="grid justify-items-stretch grid-cols-4 gap-2">
      <div>
        <Cip95GetPubDRepKeyCard
          api={api}
          onRawResponse={setRawCurrentText}
          onResponse={setResponse}
          onWaiting={setWaiterState}
        />
      </div>
      <div>
        <Cip95GetRegisteredPubStakeKeysCard
          api={api}
          onRawResponse={setRawCurrentText}
          onResponse={setResponse}
          onWaiting={setWaiterState}
        />
      </div>
      <div>
        <Cip95GetUnregisteredPubStakeKeysCard
          api={api}
          onRawResponse={setRawCurrentText}
          onResponse={setResponse}
          onWaiting={setWaiterState}
        />
      </div>
      <div>
        <Cip95SignDataCard
          api={api}
          onRawResponse={setRawCurrentText}
          onResponse={setResponse}
          onWaiting={setWaiterState}
        />
      </div>
    </div>
  )
}

export default Cip95OfficialPart
