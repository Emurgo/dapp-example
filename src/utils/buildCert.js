import logger from './logger'

// Shared envelope for the governance cert panels: flip the waiting flag, hand a
// fresh cert builder to the panel's buildFn (which adds its certificate(s) and
// attaches them to the tx), and route any failure to onError.
export const buildCert = (getCertBuilder, {onWaiting, onError}, buildFn) => {
  onWaiting(true)
  try {
    buildFn(getCertBuilder())
    onWaiting(false)
  } catch (error) {
    logger.error(error)
    onWaiting(false)
    onError()
  }
}

export default buildCert
