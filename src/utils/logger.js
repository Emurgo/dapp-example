// Debug-gated logger.
//
// `debug`, `log` and `info` only print when debug output is enabled — during
// local development (NODE_ENV === 'development') or when the app is built with
// REACT_APP_DEBUG=true. `warn` and `error` always print so real problems stay
// visible in production.
const isDebugEnabled =
  process.env.NODE_ENV === 'development' || process.env.REACT_APP_DEBUG === 'true'

const logger = {
  debug: (...args) => {
    if (isDebugEnabled) console.debug(...args)
  },
  log: (...args) => {
    if (isDebugEnabled) console.log(...args)
  },
  info: (...args) => {
    if (isDebugEnabled) console.info(...args)
  },
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
}

export default logger
