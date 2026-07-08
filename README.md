# dapp-example

A simple, multi-chain example dApp that shows how to interact with wallet
connectors — built for clarity, learning, testing, and extension.

Live demo: https://dapp-example.yoroiwallet.com/

> It may not look fancy, but it works and is meant as a reference for other
> projects on how to talk to wallet dApp-connectors.

## Supported chains

- **Cardano** (CIP-30) — live, via browser wallet extensions (e.g. Yoroi)
- **Ethereum** (EIP-1193) — live, via `window.ethereum`
- **Bitcoin** — planned (provider is currently a stub)

## Tech stack

- React 18 (functional components + hooks), JavaScript only (no TypeScript)
- Tailwind CSS + Material Tailwind
- Create React App + craco
- Cardano serialization via `@emurgo/cardano-serialization-lib-browser`

## Getting started

Prerequisites: Node.js (see [`.nvmrc`](./.nvmrc)) and npm.

```bash
npm install      # install dependencies
npm start        # run the dev server at http://localhost:3000
npm run build    # production build into ./build
```

A Cardano and/or Ethereum browser wallet extension is required to exercise the
connect flows.

## Available scripts

| Script | Description |
| --- | --- |
| `npm start` | Start the development server |
| `npm run build` | Production build |
| `npm test` | Run tests in watch mode |
| `npm run test:ci` | Run tests once (CI mode) |
| `npm run lint` | Lint `src` with ESLint |
| `npm run lint:fix` | Lint and auto-fix |
| `npm run format` | Format `src` with Prettier |
| `npm run format:check` | Check formatting without writing |

## Project structure

```
src/
  hooks/        # Providers (one per chain) + network toggle + shared hooks
  components/   # UI: access buttons, tabs, cards, shared inputs
  utils/        # Helpers and blockchain utilities (cslTools, ethereumUtils, ...)
```

Each chain follows the same flow: **Provider → Access Button → Main Tab →
Subtabs → Cards**. See [`CLAUDE.md`](./CLAUDE.md) for the full architecture and
conventions.

## Logging

The app uses a small debug-gated logger (`src/utils/logger.js`):

- `debug` / `log` / `info` print only in development, or in a production build
  started with `REACT_APP_DEBUG=true` (see [`.env.example`](./.env.example)).
- `warn` / `error` always print.

You can toggle logs live from the browser console — no rebuild needed:

```js
dappLogs.on()      // enable and remember across reloads
dappLogs.off()     // disable and remember across reloads
dappLogs.toggle()  // flip current state
dappLogs.status()  // -> true | false
dappLogs.reset()   // forget the override, fall back to the build default
```

## Testing

Tests use Jest + React Testing Library (via CRA). Run `npm run test:ci` for a
single pass, or `npm test` to watch. Tests and linting run in CI on pushes to
`main` and on pull requests.

## Configuration

Copy [`.env.example`](./.env.example) to `.env` to override defaults. Only
variables prefixed with `REACT_APP_` are exposed to the app.
