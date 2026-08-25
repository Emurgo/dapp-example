import {
  getBech32AddressFromHex,
  getCslCredentialFromHex,
  getCslRewardAddress,
  getTxBuilder,
  getWithdrawalsBuilder,
  strToBigNum,
} from '../../../../utils/cslTools'

const BLOCKFROST_BASE_URL = {
  mainnet: 'https://cardano-mainnet.blockfrost.io/api/v0',
  preprod: 'https://cardano-preprod.blockfrost.io/api/v0',
}

const unregisteredAccount = () => ({
  ok: true,
  stakeRegistered: false,
  delegation: '',
  remainingAmount: '0',
})

export const fetchAccountInfo = async (networkType, rewardAddressHex, projectId) => {
  if (!projectId?.trim()) {
    return {ok: false}
  }

  const baseUrl = BLOCKFROST_BASE_URL[networkType] || BLOCKFROST_BASE_URL.preprod
  const stakeAddress = getBech32AddressFromHex(rewardAddressHex)
  const endpointUrl = `${baseUrl}/accounts/${stakeAddress}`

  const response = await fetch(endpointUrl, {
    headers: {
      accept: 'application/json',
      project_id: projectId.trim(),
    },
  })

  if (response.status === 404) {
    return unregisteredAccount()
  }

  if (!response.ok) {
    return {ok: false}
  }

  const data = await response.json()
  return {
    ok: true,
    stakeRegistered: Boolean(data.registered ?? data.active),
    delegation: data.pool_id || '',
    remainingAmount: data.withdrawable_amount || '0',
  }
}

export const getTxBuilderWithWithdrawal = async (stakeKeyHash, networkType, rewardAmount) => {
  const txBuilder = getTxBuilder()
  const stakeKeyHashCredential = getCslCredentialFromHex(stakeKeyHash)
  const keyRewardAddress = getCslRewardAddress(networkType, stakeKeyHashCredential)
  const withdrawalsBuilder = getWithdrawalsBuilder()
  withdrawalsBuilder.add(keyRewardAddress, strToBigNum(rewardAmount))
  txBuilder.set_withdrawals_builder(withdrawalsBuilder)

  return txBuilder
}
