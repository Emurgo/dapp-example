import {renderHook, act} from '@testing-library/react'
import useConnectionState from './useConnectionState'
import {CONNECTED, IN_PROGRESS, NOT_CONNECTED, NO_PROVIDER} from '../utils/connectionStates'

describe('useConnectionState', () => {
  it('defaults to NO_PROVIDER', () => {
    const {result} = renderHook(() => useConnectionState())
    expect(result.current.connectionState).toBe(NO_PROVIDER)
  })

  it('honors a custom initial state', () => {
    const {result} = renderHook(() => useConnectionState(NOT_CONNECTED))
    expect(result.current.connectionState).toBe(NOT_CONNECTED)
  })

  it('transitions through the named setters', () => {
    const {result} = renderHook(() => useConnectionState())

    act(() => result.current.setInProgress())
    expect(result.current.connectionState).toBe(IN_PROGRESS)

    act(() => result.current.setConnected())
    expect(result.current.connectionState).toBe(CONNECTED)

    act(() => result.current.setNotConnected())
    expect(result.current.connectionState).toBe(NOT_CONNECTED)

    act(() => result.current.setNoProvider())
    expect(result.current.connectionState).toBe(NO_PROVIDER)
  })

  it('keeps setter identities stable across renders', () => {
    const {result, rerender} = renderHook(() => useConnectionState())
    const firstSetConnected = result.current.setConnected
    rerender()
    expect(result.current.setConnected).toBe(firstSetConnected)
  })
})
