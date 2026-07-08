// These tests call the app logger's own debug(), not RTL's screen.debug(), so the
// testing-library debugging-utils rule is a false positive here.
/* eslint-disable testing-library/no-debugging-utils */

// NODE_ENV is 'test' here, so the build default is "logging off" — which lets us
// assert the gating and the runtime toggle cleanly.
describe('logger', () => {
  beforeEach(() => {
    jest.resetModules() // re-evaluate logger.js so it re-reads localStorage
    window.localStorage.clear()
    jest.restoreAllMocks()
  })

  it('does not print debug/log when disabled (build default in test env)', () => {
    const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {})
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    const logger = require('./logger').default

    logger.debug('nope')
    logger.log('nope')

    expect(debugSpy).not.toHaveBeenCalled()
    expect(logSpy).not.toHaveBeenCalled()
  })

  it('always prints warn and error regardless of state', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const logger = require('./logger').default

    logger.warn('w')
    logger.error('e')

    expect(warnSpy).toHaveBeenCalledWith('w')
    expect(errorSpy).toHaveBeenCalledWith('e')
  })

  it('reads a persisted override on load', () => {
    window.localStorage.setItem('dapp:debug', 'true')
    const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {})
    const logger = require('./logger').default

    logger.debug('yes')

    expect(debugSpy).toHaveBeenCalledWith('yes')
  })

  it('exposes window.dappLogs controls that toggle output and persist', () => {
    jest.spyOn(console, 'info').mockImplementation(() => {})
    const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {})
    const logger = require('./logger').default

    expect(window.dappLogs.status()).toBe(false)

    window.dappLogs.on()
    expect(window.dappLogs.status()).toBe(true)
    expect(window.localStorage.getItem('dapp:debug')).toBe('true')
    logger.debug('on')
    expect(debugSpy).toHaveBeenCalledWith('on')

    debugSpy.mockClear()
    window.dappLogs.off()
    expect(window.dappLogs.status()).toBe(false)
    logger.debug('off')
    expect(debugSpy).not.toHaveBeenCalled()
  })

  it('reset() clears the override and falls back to the build default', () => {
    window.localStorage.setItem('dapp:debug', 'true')
    jest.spyOn(console, 'info').mockImplementation(() => {})
    const logger = require('./logger').default

    expect(window.dappLogs.status()).toBe(true)
    window.dappLogs.reset()

    expect(window.localStorage.getItem('dapp:debug')).toBeNull()
    expect(window.dappLogs.status()).toBe(false) // build default in test env
    void logger
  })
})
