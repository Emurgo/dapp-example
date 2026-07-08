import React, {useState, useRef, useCallback, useMemo} from 'react'
import ToastContainer from '../components/toastContainer'

const ToastContext = React.createContext(null)

const AUTO_DISMISS_MS = 6000

// App-wide toast notifications. Any component can call `useToast().showToast(...)`
// to surface a message (errors, info) as a visible banner instead of a
// console-only log.
export const ToastProvider = ({children}) => {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message, type = 'error') => {
      const id = ++nextId.current
      setToasts((current) => [...current, {id, message, type}])
      setTimeout(() => dismissToast(id), AUTO_DISMISS_MS)
      return id
    },
    [dismissToast],
  )

  const value = useMemo(() => ({showToast, dismissToast}), [showToast, dismissToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export default useToast
