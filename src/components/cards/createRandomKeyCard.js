import React from 'react'
import ApiCard from './apiCard'
import {getAddressFromCred, getCredential, getSecretKey} from '../../utils/cslTools'
import runApiCall from '../../utils/runApiCall'

const CreateRandomKeyPart = ({onRawResponse, onResponse, onWaiting}) => {
  const clickFunction = () =>
    runApiCall(
      async () => {
        const wasmSK = getSecretKey()
        const wasmPK = wasmSK.to_public()
        const hash = wasmPK.to_raw_key().hash()
        const cred = getCredential(hash)
        return {
          privateKeyHex: wasmSK.to_raw_key().to_hex(),
          publicKeyHex: wasmPK.to_raw_key().to_hex(),
          pubKeyHash: hash.to_hex(),
          mainnetAddress: getAddressFromCred(1, cred),
          testnetAddress: getAddressFromCred(0, cred),
        }
      },
      {onRawResponse, onResponse, onWaiting},
      {rawText: () => ''},
    )

  return <ApiCard apiName="Random Key" clickFunction={clickFunction} />
}

export default CreateRandomKeyPart
