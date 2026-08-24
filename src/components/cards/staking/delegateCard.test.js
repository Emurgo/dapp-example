import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import DelegateCard from './delegateCard'
import {fetchAccountInfo} from './logic/withdraw'

jest.mock('../../../utils/cslTools', () => ({
  getFixedTxFromBytes: jest.fn(),
  getTransactionWitnessSetFromBytes: jest.fn(),
}))

jest.mock('./logic/delegate', () => ({
  buildDelegationTx: jest.fn(),
  getStakeKeyHashFromPubKey: jest.fn(),
  resolveDelegationStakeKey: jest.fn(),
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
  }

  beforeEach(() => {
    jest.clearAllMocks()
    api.getNetworkId.mockResolvedValue(1)
    api.getRewardAddresses.mockResolvedValue(['aabbcc'])
  })

  it('renders the pool ID field and keeps Send disabled until a pool ID is entered', async () => {
    render(<DelegateCard api={api} onRawResponse={() => {}} onResponse={() => {}} onWaiting={() => {}} />)
    await waitFor(() => expect(api.getNetworkId).toHaveBeenCalled())

    expect(screen.getByText('Delegate to Pool')).toBeInTheDocument()
    expect(screen.getByLabelText('Pool ID')).toBeInTheDocument()
    expect(screen.getByLabelText('Blockfrost Project ID')).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Send'})).toBeDisabled()
    expect(screen.getByRole('button', {name: 'Get Account info'})).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Pool ID'), {
      target: {value: 'deadbeef01234567890abcdef01234567890abcdef01234567890abc'},
    })
    expect(screen.getByRole('button', {name: 'Send'})).not.toBeDisabled()
  })

  it('shows current pool info after Get Account info succeeds', async () => {
    fetchAccountInfo.mockResolvedValue({
      ok: true,
      stakeRegistered: true,
      delegation: 'pool1abc',
    })

    render(<DelegateCard api={api} onRawResponse={() => {}} onResponse={() => {}} onWaiting={() => {}} />)
    await waitFor(() => expect(api.getNetworkId).toHaveBeenCalled())

    fireEvent.change(screen.getByLabelText('Blockfrost Project ID'), {target: {value: 'mainnetProjectId'}})
    fireEvent.click(screen.getByRole('button', {name: 'Get Account info'}))

    await waitFor(() => {
      expect(screen.getByText(/Stake key registered: yes/)).toBeInTheDocument()
    })
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
})
