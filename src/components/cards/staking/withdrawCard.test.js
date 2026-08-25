import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import WithdrawCard from './withdrawCard'
import {fetchAccountInfo, getTxBuilderWithWithdrawal} from './logic/withdraw'
import {
  getFixedTxFromBytes,
  getStakeKeyHashFromRewardAddressHex,
  getTransactionWitnessSetFromBytes,
} from '../../../utils/cslTools'

jest.mock('../../../utils/cslTools', () => ({
  getAddressFromBytes: jest.fn(),
  getCertificateBuilder: jest.fn(),
  getCertOfNewStakeDereg: jest.fn(),
  getCslCredentialFromHex: jest.fn(),
  getCslUtxos: jest.fn(),
  getLargestFirstMultiAsset: jest.fn(),
  getFixedTxFromBytes: jest.fn(),
  getStakeKeyDeregCert: jest.fn(),
  getStakeKeyHashFromRewardAddressHex: jest.fn(),
  getTransactionWitnessSetFromBytes: jest.fn(),
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
  getTxBuilderWithWithdrawal: jest.fn(),
}))

describe('WithdrawCard', () => {
  const api = {
    getNetworkId: jest.fn().mockResolvedValue(1),
    getRewardAddresses: jest.fn().mockResolvedValue(['aabbcc']),
    getUtxos: jest.fn().mockResolvedValue(['utxo']),
    getChangeAddress: jest.fn().mockResolvedValue('change'),
    signTx: jest.fn().mockResolvedValue('sig-hex'),
    submitTx: jest.fn().mockResolvedValue('tx-id'),
    cip95: {
      getRegisteredPubStakeKeys: jest.fn(),
    },
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
      remainingAmount: '1000',
    })
    getStakeKeyHashFromRewardAddressHex.mockReturnValue('stake-key-hash')
    getFixedTxFromBytes.mockReturnValue({
      to_hex: () => 'signed-tx',
      add_vkey_witness: jest.fn(),
    })
    getTransactionWitnessSetFromBytes.mockReturnValue({
      vkeys: () => ({len: () => 0, get: () => null}),
    })
    getTxBuilderWithWithdrawal.mockResolvedValue({
      set_certs_builder: jest.fn(),
      add_inputs_from: jest.fn(),
      add_change_if_needed: jest.fn(),
      build_tx: jest.fn(() => ({to_bytes: () => new Uint8Array([1])})),
    })
  })

  it('withdraws using the CIP-30 reward address, without CIP-95', async () => {
    render(<WithdrawCard api={api} onRawResponse={() => {}} onResponse={() => {}} onWaiting={() => {}} />)
    await waitFor(() => expect(api.getNetworkId).toHaveBeenCalled())

    fireEvent.change(screen.getByLabelText('Blockfrost Project ID'), {target: {value: 'mainnetProjectId'}})
    fireEvent.click(screen.getByRole('button', {name: 'Get Account info'}))
    expect(await screen.findByText(/Available reward/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', {name: 'Send'}))
    await waitFor(() => expect(api.submitTx).toHaveBeenCalled())

    expect(api.cip95.getRegisteredPubStakeKeys).not.toHaveBeenCalled()
    expect(getStakeKeyHashFromRewardAddressHex).toHaveBeenCalledWith('aabbcc')
    expect(getTxBuilderWithWithdrawal).toHaveBeenCalledWith('stake-key-hash', 'mainnet', '1000')
  })
})
