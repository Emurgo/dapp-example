import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import DelegateCard from './delegateCard'
import {fetchAccountInfo} from './logic/withdraw'
import {buildDelegationTx} from './logic/delegate'
import {
  getFixedTxFromBytes,
  getStakeKeyHashFromRewardAddressHex,
  getTransactionWitnessSetFromBytes,
} from '../../../utils/cslTools'

jest.mock('../../../utils/cslTools', () => ({
  getFixedTxFromBytes: jest.fn(),
  getTransactionWitnessSetFromBytes: jest.fn(),
  getStakeKeyHashFromRewardAddressHex: jest.fn(),
}))

jest.mock('./logic/delegate', () => ({
  buildDelegationTx: jest.fn(),
}))

jest.mock('../apiCardWithModal', () => ({
  __esModule: true,
  default: ({buttonLabel, clickFunction, btnDisabled, children}) => (
    <div>
      <span>{buttonLabel}</span>
      {children}
      <button type="button" disabled={btnDisabled} onClick={clickFunction}>
        Send
      </button>
    </div>
  ),
}))

jest.mock('./logic/withdraw', () => ({
  fetchAccountInfo: jest.fn(),
}))

describe('DelegateCard', () => {
  const api = {
    getNetworkId: jest.fn().mockResolvedValue(1),
    getRewardAddresses: jest.fn().mockResolvedValue(['aabbcc']),
    getUtxos: jest.fn().mockResolvedValue(['utxo']),
    getChangeAddress: jest.fn().mockResolvedValue('change'),
    signTx: jest.fn().mockResolvedValue('sig-hex'),
    submitTx: jest.fn().mockResolvedValue('tx-id'),
    cip95: {
      getRegisteredPubStakeKeys: jest.fn(),
      getUnregisteredPubStakeKeys: jest.fn(),
    },
  }

  const fillPoolId = () => {
    fireEvent.change(screen.getByLabelText('Pool ID'), {
      target: {value: 'deadbeef01234567890abcdef01234567890abcdef01234567890abc'},
    })
  }

  const loadAccountInfo = async () => {
    fireEvent.change(screen.getByLabelText('Blockfrost Project ID'), {target: {value: 'mainnetProjectId'}})
    fireEvent.click(screen.getByRole('button', {name: 'Get Account info'}))
    await waitFor(() => {
      expect(screen.getByText(/Stake key registered: yes/)).toBeInTheDocument()
    })
  }

  beforeEach(() => {
    jest.clearAllMocks()
    api.getNetworkId.mockResolvedValue(1)
    api.getRewardAddresses.mockResolvedValue(['aabbcc'])
    api.getUtxos.mockResolvedValue(['utxo'])
    api.getChangeAddress.mockResolvedValue('change')
    api.signTx.mockResolvedValue('sig-hex')
    api.submitTx.mockResolvedValue('tx-id')
    fetchAccountInfo.mockResolvedValue({
      ok: true,
      stakeRegistered: true,
      delegation: 'pool1abc',
    })
    getStakeKeyHashFromRewardAddressHex.mockReturnValue('stake-key-hash')
    buildDelegationTx.mockReturnValue({to_bytes: () => new Uint8Array([1])})
    getFixedTxFromBytes.mockReturnValue({
      to_hex: () => 'signed-tx',
      add_vkey_witness: jest.fn(),
    })
    getTransactionWitnessSetFromBytes.mockReturnValue({
      vkeys: () => ({len: () => 0, get: () => null}),
    })
  })

  it('renders the pool ID field and keeps Send disabled until account info is loaded', async () => {
    render(<DelegateCard api={api} onRawResponse={() => {}} onResponse={() => {}} onWaiting={() => {}} />)
    await waitFor(() => expect(api.getNetworkId).toHaveBeenCalled())

    expect(screen.getByText('Delegate to Pool')).toBeInTheDocument()
    expect(screen.getByLabelText('Pool ID')).toBeInTheDocument()
    expect(screen.getByLabelText('Blockfrost Project ID')).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Send'})).toBeDisabled()
    expect(screen.getByRole('button', {name: 'Get Account info'})).toBeDisabled()

    fillPoolId()
    expect(screen.getByRole('button', {name: 'Send'})).toBeDisabled()
  })

  it('shows current pool info after Get Account info succeeds', async () => {
    render(<DelegateCard api={api} onRawResponse={() => {}} onResponse={() => {}} onWaiting={() => {}} />)
    await waitFor(() => expect(api.getNetworkId).toHaveBeenCalled())

    await loadAccountInfo()
    expect(screen.getByText(/Current pool: pool1abc/)).toBeInTheDocument()
    expect(fetchAccountInfo).toHaveBeenCalledWith('mainnet', 'aabbcc', 'mainnetProjectId')
  })

  it('shows an error when account info cannot be loaded', async () => {
    fetchAccountInfo.mockResolvedValue({ok: false})

    render(<DelegateCard api={api} onRawResponse={() => {}} onResponse={() => {}} onWaiting={() => {}} />)
    await waitFor(() => expect(api.getNetworkId).toHaveBeenCalled())

    fireEvent.change(screen.getByLabelText('Blockfrost Project ID'), {target: {value: 'mainnetProjectId'}})
    fireEvent.click(screen.getByRole('button', {name: 'Get Account info'}))

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong while getting delegation info/)).toBeInTheDocument()
    })
  })

  it('builds the delegation tx from the CIP-30 reward address, without CIP-95', async () => {
    const onRawResponse = jest.fn()
    const onResponse = jest.fn()
    render(<DelegateCard api={api} onRawResponse={onRawResponse} onResponse={onResponse} onWaiting={() => {}} />)
    await waitFor(() => expect(api.getNetworkId).toHaveBeenCalled())

    fillPoolId()
    await loadAccountInfo()
    fireEvent.click(screen.getByRole('button', {name: 'Send'}))

    await waitFor(() => expect(api.submitTx).toHaveBeenCalled())
    expect(api.cip95.getRegisteredPubStakeKeys).not.toHaveBeenCalled()
    expect(api.cip95.getUnregisteredPubStakeKeys).not.toHaveBeenCalled()
    expect(getStakeKeyHashFromRewardAddressHex).toHaveBeenCalledWith('aabbcc')
    expect(buildDelegationTx).toHaveBeenCalledWith(
      expect.objectContaining({
        stakeKeyHash: 'stake-key-hash',
        registerStakeKey: false,
      }),
    )
    expect(onRawResponse).toHaveBeenCalledWith('tx-id')
  })
})
