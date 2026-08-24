export const resolveDelegationStakeKey = ({registeredPubKeys, unregisteredPubKeys}) => {
  if (registeredPubKeys?.length) {
    return {pubKeyHex: registeredPubKeys[0], needsRegistration: false}
  }
  if (unregisteredPubKeys?.length) {
    return {pubKeyHex: unregisteredPubKeys[0], needsRegistration: true}
  }
  throw new Error('No stake key available from wallet')
}
