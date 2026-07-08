import AccessButtonShell from './accessButtonShell'

const BitcoinAccessButton = () => (
  <AccessButtonShell>
    <button
      className="rounded-md bg-orange-600 py-5 px-5 disabled:opacity-50 text-white font-semibold cursor-not-allowed"
      disabled
    >
      Bitcoin (Coming Soon)
    </button>
  </AccessButtonShell>
)

export default BitcoinAccessButton
