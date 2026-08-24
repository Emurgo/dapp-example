import {fetchAccountInfo} from './withdraw'
import {getBech32AddressFromHex} from '../../../../utils/cslTools'

jest.mock('../../../../utils/cslTools', () => ({
  getBech32AddressFromHex: jest.fn(),
  getCslCredentialFromHex: jest.fn(),
  getCslRewardAddress: jest.fn(),
  getTxBuilder: jest.fn(),
  getWithdrawalsBuilder: jest.fn(),
  strToBigNum: jest.fn(),
}))

describe('fetchAccountInfo', () => {
  const stakeBech32 = 'stake1u9example'
  const projectId = 'proj_abc'

  beforeEach(() => {
    jest.clearAllMocks()
    getBech32AddressFromHex.mockReturnValue(stakeBech32)
    global.fetch = jest.fn()
  })

  it('does not call Blockfrost when project ID is empty', async () => {
    await expect(fetchAccountInfo('mainnet', 'aabbcc', '  ')).resolves.toEqual({ok: false})
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('GETs the mainnet accounts endpoint with project_id', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        active: true,
        pool_id: 'pool1abc',
        withdrawable_amount: '42',
      }),
    })

    await expect(fetchAccountInfo('mainnet', 'aabbcc', ` ${projectId} `)).resolves.toEqual({
      ok: true,
      stakeRegistered: true,
      delegation: 'pool1abc',
      remainingAmount: '42',
    })

    expect(global.fetch).toHaveBeenCalledWith(
      `https://cardano-mainnet.blockfrost.io/api/v0/accounts/${stakeBech32}`,
      {
        headers: {
          accept: 'application/json',
          project_id: projectId,
        },
      },
    )
  })

  it('uses the preprod host for non-mainnet networks', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({active: false, pool_id: null, withdrawable_amount: '0'}),
    })

    await fetchAccountInfo('preprod', 'aabbcc', projectId)
    expect(global.fetch.mock.calls[0][0]).toBe(
      `https://cardano-preprod.blockfrost.io/api/v0/accounts/${stakeBech32}`,
    )
  })

  it('treats 404 as an unregistered stake key', async () => {
    global.fetch.mockResolvedValue({ok: false, status: 404})

    await expect(fetchAccountInfo('mainnet', 'aabbcc', projectId)).resolves.toEqual({
      ok: true,
      stakeRegistered: false,
      delegation: '',
      remainingAmount: '0',
    })
  })

  it('returns ok: false when Blockfrost rejects the request', async () => {
    global.fetch.mockResolvedValue({ok: false, status: 403})

    await expect(fetchAccountInfo('mainnet', 'aabbcc', projectId)).resolves.toEqual({ok: false})
  })
})
