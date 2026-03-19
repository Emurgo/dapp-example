# dapp-example — Claude Code Guide

## Overview

This project is a **simple, multi-chain dApp example** designed for clarity, learning, testing, and extensibility.

Supported chains:
- Cardano (CIP-30)
- Ethereum (EIP-1193)
- Bitcoin (planned)

The goal is to provide a **consistent UI and architecture across all blockchains**, while keeping implementation minimal and explicit.

---

## Design Philosophy

This project prioritizes:

- **Simplicity over completeness** — minimal dependencies, direct APIs
- **Consistency across chains** — same structure and UX
- **Explicit logic** — no hidden abstractions
- **Extensibility** — easy to add new chains and features

All integrations follow the same pattern:

Provider → Access Button → Main Tab → Subtabs → Cards

---

## Tech Stack

- React 18 (functional components + hooks)
- JavaScript only (no TypeScript)
- Tailwind CSS + Material Tailwind
- Create React App + craco

Blockchain integrations:

- Cardano → `@emurgo/cardano-serialization-lib-browser`
- Ethereum → raw `window.ethereum` (EIP-1193)
- Bitcoin → wallet APIs (planned)

---

## Core Architecture (Simplified)

Each blockchain follows the same UI and logic flow:

1. **Provider**
   - Manages connection state
   - Wraps wallet API

2. **Access Button**
   - Connect wallet / display account

3. **Main Tab**
   - Shows connection status

4. **Subtabs**
   - Group features (transactions, tokens, staking)

5. **Cards**
   - Each card performs a single action

---

## Multi-Chain Abstraction

All chains should implement the same logical interface:

```js
{
  connect: () => Promise<void>,
  disconnect?: () => Promise<void>,
  getAccounts: () => Promise<string[]>,
  getBalance: (address) => Promise<string>,
  sendTransaction: (tx) => Promise<string>,
  signMessage?: (message) => Promise<string>,
}
```

Implementations:

- Cardano → CIP-30 wallet API
- Ethereum → EIP-1193 (`window.ethereum`)
- Bitcoin → wallet-specific APIs (e.g., Unisat, Xverse)

---

## Project Structure

```
src/
  hooks/        # Providers (one per chain + network toggle)
  components/   # UI (buttons, tabs, cards)
  utils/        # Helpers and blockchain utilities
```

Keep structure consistent across chains.

---

## Network System

The app supports switching between chains.

- `NetworkProvider` manages active network
- `useNetwork()` exposes:
  - `activeNetwork`
  - `toggleNetwork()`

Each network renders its own:
- Access button
- Main tab
- Subtabs

---

## Card Pattern

Cards are the smallest unit of functionality.

Two types:

- `ApiCard` → simple button action
- `ApiCardWithModal` → form + confirm action

Rules:
- One action per card
- Keep logic minimal
- Display results clearly

---

## Cardano Integration

Uses CIP-30 wallet API via browser extensions.

Example:
```js
const api = await window.cardano[walletName].enable()
```

Capabilities:
- Transactions
- Staking
- Governance (CIP-95)
- Token minting
- NFT operations

All serialization logic lives in:

```
src/utils/cslTools.js
```

---

## Ethereum Integration

Uses EIP-1193 via `window.ethereum`.

Example:
```js
await window.ethereum.request({ method: 'eth_requestAccounts' })
```

Capabilities:
- ETH transfers
- Message signing
- ERC-20 interactions

Key differences from Cardano:
- Account-based model
- No serialization library
- Direct RPC calls

---

## Bitcoin Integration (Planned)

Bitcoin support will follow the same architecture.

### Wallet APIs
- Unisat (`window.unisat`)
- Xverse
- Hiro Wallet

### Features
- Address retrieval
- Balance fetching
- Message signing (BIP-322)
- Transaction creation (PSBT)

### Notes
- UTXO-based model
- No smart contracts (base layer)
- Transactions use PSBT format

---

## Connection State

Shared across all networks:

- NOT_CONNECTED
- IN_PROGRESS
- CONNECTED
- NO_PROVIDER

Each provider manages its own state.

---

## Adding a New Feature

Example: add a new card

1. Create a card in `components/cards/`
2. Use `ApiCard` or `ApiCardWithModal`
3. Call the wallet API
4. Add the card to a subtab
5. Register the subtab in `App.js`

Keep UI and logic consistent.

---

## Adding a New Blockchain

1. Create a provider in `src/hooks/`
2. Implement the shared interface
3. Add network constant
4. Create:
   - Access button
   - Main tab
   - Subtabs
   - Cards
5. Update network toggle

Follow existing patterns exactly.

---

## Example Flow (Ethereum)

1. User clicks Connect
2. `eth_requestAccounts` is called
3. Account stored in context
4. User opens transaction tab
5. Card calls `eth_sendTransaction`
6. Result displayed

---

## Conventions

- JavaScript only (no TypeScript)
- Do not introduce heavy libraries
- Keep Cardano and Ethereum implementations separate but consistent
- Reuse shared UI components
- Prefer explicit code over abstraction

---

## Non-Goals

- Not production-ready
- Not a full SDK
- Not optimized for performance

This is a **learning and reference dApp**.

---

## Running Locally

```bash
npm start
npm run build
npm test
```

---

## Agent System

This project uses an agent-based workflow defined in `CLAUDE_AGENTS.md`.

When performing tasks:
- Always follow the agent pipeline
- Default to the MASTER EXECUTION PROMPT
- Do not skip steps unless explicitly instructed

---

## Summary

This project demonstrates how to build a **clean, minimal, multi-chain dApp** with:

- Consistent architecture
- Simple wallet integrations
- Clear separation of concerns

When adding anything new, prioritize:

**Clarity > Abstraction > Complexity**

