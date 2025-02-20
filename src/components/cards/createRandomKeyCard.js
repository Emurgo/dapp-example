import React from 'react'
import ApiCard from './apiCard'
import { getAddressFromCred, getCredential, getSecretKey } from '../../utils/cslTools'

const CreateRandomKeyPart = ({onRawResponse, onResponse, onWaiting}) => {

  const clickFunction = () => {
    onWaiting(true)
    try {
      const wasmSK = getSecretKey()
      const wasmPK = wasmSK.to_public();
      const hash = wasmPK.to_raw_key().hash();
      const cred = getCredential(hash);
      const mainnetAddress = getAddressFromCred(1, cred)
      const testnetAddress = getAddressFromCred(0, cred)
      onRawResponse('');
      onResponse({
        privateKeyHex: wasmSK.to_raw_key().to_hex(),
        publicKeyHex: wasmPK.to_raw_key().to_hex(),
        pubKeyHash: hash.to_hex(),
        mainnetAddress,
        testnetAddress,
      });
    } catch(e) {
      onRawResponse('');
      onResponse(e);
      console.error(e);
    } finally {
      onWaiting(false);
    }
  }

  return <ApiCard
    apiName="Random Key"
    clickFunction={clickFunction}
  />
}

export default CreateRandomKeyPart
