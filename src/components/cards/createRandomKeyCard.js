import React from 'react'
import ApiCard from './apiCard'

const CreateRandomKeyPart = ({wasm, onResponse, onWaiting}) => {

  const clickFunction = () => {
    onWaiting(true)
    try {
      const wasmSK = wasm.Bip32PrivateKey.generate_ed25519_bip32();
      const wasmPK = wasmSK.to_public();
      const hash = wasmPK.to_raw_key().hash();
      const cred = wasm.Credential.from_keyhash(hash);
      const mainnetAddress = wasm.EnterpriseAddress.new(1, cred).to_address().to_bech32();
      const testnetAddress = wasm.EnterpriseAddress.new(0, cred).to_address().to_bech32();
      onResponse({
        privateKeyHex: wasmSK.to_raw_key().to_hex(),
        publicKeyHex: wasmPK.to_raw_key().to_hex(),
        pubKeyHash: hash.to_hex(),
        mainnetAddress,
        testnetAddress,
      });
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
