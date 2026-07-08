import {render, screen, fireEvent, act} from '@testing-library/react'
import useToast, {ToastProvider} from './toastProvider'

const Trigger = () => {
  const {showToast} = useToast()
  return <button onClick={() => showToast('Boom happened')}>go</button>
}

describe('ToastProvider', () => {
  it('shows a toast and dismisses it via the close button', () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    )

    fireEvent.click(screen.getByText('go'))
    expect(screen.getByRole('alert')).toHaveTextContent('Boom happened')

    fireEvent.click(screen.getByLabelText('Dismiss'))
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('auto-dismisses after the timeout', () => {
    jest.useFakeTimers()
    try {
      render(
        <ToastProvider>
          <Trigger />
        </ToastProvider>,
      )

      fireEvent.click(screen.getByText('go'))
      expect(screen.getByRole('alert')).toBeInTheDocument()

      act(() => {
        jest.advanceTimersByTime(6000)
      })
      expect(screen.queryByRole('alert')).toBeNull()
    } finally {
      jest.useRealTimers()
    }
  })

  it('throws when useToast is used outside the provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const Bad = () => {
      useToast()
      return null
    }
    expect(() => render(<Bad />)).toThrow('useToast must be used within ToastProvider')
    spy.mockRestore()
  })
})
