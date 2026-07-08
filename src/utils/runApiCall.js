import logger from './logger'

// Shared lifecycle for the API cards: flip the waiting flag, run the wallet
// call, then publish the raw response and a parsed result — or publish the error.
// Collapses the identical then/catch envelope that every card used to repeat.
//
//   call            () => Promise<raw>   the wallet/API call to run
//   handlers        { onRawResponse, onResponse, onWaiting }  (card props)
//   options.parse   (raw) => result      value passed to onResponse (default: identity)
//   options.rawText (raw) => shown       value passed to onRawResponse (default: identity)
//   options.stringify  boolean           2nd arg to onResponse (default: true)
export const runApiCall = async (call, {onRawResponse, onResponse, onWaiting}, options = {}) => {
  const {parse = (raw) => raw, rawText = (raw) => raw, stringify = true} = options
  onWaiting(true)
  try {
    const raw = await call()
    onRawResponse(rawText(raw))
    onResponse(parse(raw), stringify)
  } catch (e) {
    onRawResponse('')
    onResponse(e)
    logger.error(e)
  } finally {
    onWaiting(false)
  }
}

export default runApiCall
