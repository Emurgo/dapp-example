import {resolveDelegationStakeKey} from './stakeKey'

describe('resolveDelegationStakeKey', () => {
  it('prefers a registered stake key and skips registration', () => {
    expect(resolveDelegationStakeKey({registeredPubKeys: ['reg'], unregisteredPubKeys: ['unreg']})).toEqual({
      pubKeyHex: 'reg',
      needsRegistration: false,
    })
  })

  it('falls back to an unregistered stake key and requires registration', () => {
    expect(resolveDelegationStakeKey({registeredPubKeys: [], unregisteredPubKeys: ['unreg']})).toEqual({
      pubKeyHex: 'unreg',
      needsRegistration: true,
    })
  })

  it('throws when the wallet has no stake keys', () => {
    expect(() => resolveDelegationStakeKey({registeredPubKeys: [], unregisteredPubKeys: []})).toThrow(
      /No stake key available/,
    )
  })
})
