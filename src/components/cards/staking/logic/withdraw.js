import {
  getCslCredentialFromHex,
  getCslRewardAddress,
  getPublicKeyFromHex,
  getTxBuilder,
  getWithdrawalsBuilder,
  strToBigNum,
} from '../../../../utils/cslTools'

export const fetchAccountInfo = async (networkType, rewardAddressHex) => {
  let backendUrl = ''
  if (networkType === 'mainnet') {
    backendUrl = 'api.yoroiwallet.com'
  } else if (networkType === 'preview') {
    backendUrl = 'preview-backend.emurgornd.com'
  } else {
    backendUrl = 'preprod-backend.yoroiwallet.com'
  }

  const endpointUrl = `https://${backendUrl}/api/account/state`
  return await fetch(endpointUrl, {
    headers: {
      accept: 'application/json, text/plain, */*',
      'content-type': 'application/json',
    },
    body: `{"addresses":["${rewardAddressHex}"]}`,
    method: 'POST',
  })
}

export const getTxBuilderWithWithdrawal = async (cardanoApi, networkType, rewardAmount) => {
  const txBuilder = getTxBuilder()
  const pubStakeKey = await cardanoApi?.cip95.getRegisteredPubStakeKeys()
  const stakeKeyHash = getPublicKeyFromHex(pubStakeKey[0]).hash().to_hex()
  const stakeKeyHashCredential = getCslCredentialFromHex(stakeKeyHash)
  const keyRewardAddress = getCslRewardAddress(networkType, stakeKeyHashCredential)
  const withdrawalsBuilder = getWithdrawalsBuilder()
  withdrawalsBuilder.add(keyRewardAddress, strToBigNum(rewardAmount))
  txBuilder.set_withdrawals_builder(withdrawalsBuilder)

  return txBuilder
}
