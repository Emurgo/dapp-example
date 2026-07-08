// Debug-gated logger with a runtime on/off switch.
//
// `debug`, `log` and `info` only print when debug output is enabled;
// `warn` and `error` always print so real problems stay visible in production.
//
// Enabled state is resolved in this order:
//   1. A runtime override saved in localStorage (set from the browser console).
//   2. The build-time default: on during local development, or when the app is
//      built with REACT_APP_DEBUG=true.
//
// Toggle logs live from the browser console without rebuilding:
//   dappLogs.on()      // enable and remember across reloads
//   dappLogs.off()     // disable and remember across reloads
//   dappLogs.toggle()  // flip current state
//   dappLogs.status()  // -> true | false
//   dappLogs.reset()   // forget the override, fall back to the build default
const STORAGE_KEY = 'dapp:debug'

const buildDefault =
  process.env.NODE_ENV === 'development' || process.env.REACT_APP_DEBUG === 'true'

const readOverride = () => {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    if (value === 'true') return true
    if (value === 'false') return false
  } catch (e) {
    // localStorage may be unavailable (SSR, privacy mode) — ignore.
  }
  return null
}

const override = readOverride()
let enabled = override === null ? buildDefault : override

const persist = (value) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value))
  } catch (e) {
    // ignore write failures
  }
}

const setEnabled = (value) => {
  enabled = !!value
  persist(enabled)
  // Always report the switch itself so the user sees the effect immediately.
  console.info(`[dApp][logger] logging ${enabled ? 'ENABLED' : 'DISABLED'}`)
  return enabled
}

const logger = {
  debug: (...args) => {
    if (enabled) console.debug(...args)
  },
  log: (...args) => {
    if (enabled) console.log(...args)
  },
  info: (...args) => {
    if (enabled) console.info(...args)
  },
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
}

// Expose runtime controls on window so logs can be toggled from the console.
if (typeof window !== 'undefined') {
  window.dappLogs = {
    on: () => setEnabled(true),
    off: () => setEnabled(false),
    toggle: () => setEnabled(!enabled),
    status: () => enabled,
    reset: () => {
      try {
        window.localStorage.removeItem(STORAGE_KEY)
      } catch (e) {
        // ignore
      }
      enabled = buildDefault
      console.info(`[dApp][logger] override cleared, logging ${enabled ? 'ENABLED' : 'DISABLED'} (build default)`)
      return enabled
    },
  }
}

export default logger
