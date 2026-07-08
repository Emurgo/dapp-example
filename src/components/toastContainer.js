import React from 'react'

const typeStyles = {
  error: 'bg-red-800 border-red-600',
  info: 'bg-blue-800 border-blue-600',
  success: 'bg-green-800 border-green-600',
}

// Renders the stack of active toasts in the top-right corner.
const ToastContainer = ({toasts, onDismiss}) => {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-white shadow-lg ${
            typeStyles[toast.type] ?? typeStyles.error
          }`}
          role="alert"
        >
          <span className="flex-1 text-sm break-words">{toast.message}</span>
          <button
            className="text-white/70 hover:text-white font-bold leading-none"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
