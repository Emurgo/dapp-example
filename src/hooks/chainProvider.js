// The shared contract every chain provider implements. Each provider (Cardano,
// Ethereum, Bitcoin) exposes at least this shape through its React context;
// chain-specific extras (Cardano's selectedWallet/availableWallets, Ethereum's
// chainId, ...) are layered on top. See CLAUDE.md "Multi-Chain Abstraction".
//
// Connection state is driven by the shared useConnectionState() machine and
// uses the values from utils/connectionStates.js.
//
// @typedef {Object} ChainProvider
// @property {string} connectionState                    NOT_CONNECTED | IN_PROGRESS | CONNECTED | NO_PROVIDER
// @property {(...args: any[]) => Promise<any>} connect
// @property {() => void} disconnect
// @property {() => (string[] | Promise<string[]>)} getAccounts
// @property {(address?: string) => Promise<string>} getBalance
// @property {(tx: any) => Promise<string>} sendTransaction
// @property {(...args: any[]) => Promise<any>} signMessage

export {}
