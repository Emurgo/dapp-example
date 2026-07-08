import {runApiCall} from './runApiCall'

const makeHandlers = () => ({
  onRawResponse: jest.fn(),
  onResponse: jest.fn(),
  onWaiting: jest.fn(),
})

describe('runApiCall', () => {
  it('toggles waiting on then off around a successful call', async () => {
    const handlers = makeHandlers()
    await runApiCall(() => Promise.resolve('ok'), handlers)

    expect(handlers.onWaiting).toHaveBeenNthCalledWith(1, true)
    expect(handlers.onWaiting).toHaveBeenLastCalledWith(false)
  })

  it('publishes the raw and parsed response (stringify default true)', async () => {
    const handlers = makeHandlers()
    await runApiCall(() => Promise.resolve('42'), handlers)

    expect(handlers.onRawResponse).toHaveBeenCalledWith('42')
    expect(handlers.onResponse).toHaveBeenCalledWith('42', true)
  })

  it('applies parse, rawText and stringify options', async () => {
    const handlers = makeHandlers()
    await runApiCall(() => Promise.resolve(2), handlers, {
      parse: (n) => n * 10,
      rawText: (n) => `raw:${n}`,
      stringify: false,
    })

    expect(handlers.onRawResponse).toHaveBeenCalledWith('raw:2')
    expect(handlers.onResponse).toHaveBeenCalledWith(20, false)
  })

  it('publishes the error and clears raw on failure', async () => {
    const handlers = makeHandlers()
    const err = new Error('boom')
    await runApiCall(() => Promise.reject(err), handlers)

    expect(handlers.onRawResponse).toHaveBeenCalledWith('')
    expect(handlers.onResponse).toHaveBeenCalledWith(err)
    expect(handlers.onWaiting).toHaveBeenLastCalledWith(false)
  })
})
