import {
  getAddressFromBytes,
  getCertificateBuilder,
  getCertOfNewStakeDelegation,
  getCertOfNewStakeReg,
  getCslCredentialFromHex,
  getCslUtxos,
  getLargestFirstMultiAsset,
  getPoolKeyHash,
  getPublicKeyFromHex,
  getStakeDelegCert,
  getStakeKeyRegCert,
  getTxBuilder,
} from '../../../../utils/cslTools'
import {resolveDelegationStakeKey} from './stakeKey'

export {resolveDelegationStakeKey}

export const getStakeKeyHashFromPubKey = (pubKeyHex) => getPublicKeyFromHex(pubKeyHex).hash().to_hex()

export const buildDelegationTx = ({hexUtxos, changeAddressHex, stakeKeyHash, poolId, registerStakeKey}) => {
  const txBuilder = getTxBuilder()
  const certBuilder = getCertificateBuilder()
  const stakeCred = getCslCredentialFromHex(stakeKeyHash)

  if (registerStakeKey) {
    certBuilder.add(getCertOfNewStakeReg(getStakeKeyRegCert(stakeCred)))
  }

  certBuilder.add(getCertOfNewStakeDelegation(getStakeDelegCert(stakeCred, getPoolKeyHash(poolId))))
  txBuilder.set_certs_builder(certBuilder)

  const wasmUtxos = getCslUtxos(hexUtxos)
  txBuilder.add_inputs_from(wasmUtxos, getLargestFirstMultiAsset())
  txBuilder.add_change_if_needed(getAddressFromBytes(changeAddressHex))

  return txBuilder.build_tx()
}
