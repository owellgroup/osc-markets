import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

type Kind = 'success' | 'error'
interface ToastState {
  id: number
  message: string
  kind: Kind
}

const ToastContext = createContext<(message: string, kind?: Kind) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const counter = useRef(0)
  const timer = useRef<number | undefined>(undefined)

  const show = useCallback((message: string, kind: Kind = 'success') => {
    window.clearTimeout(timer.current)
    counter.current += 1
    setToast({ id: counter.current, message, kind })
    timer.current = window.setTimeout(() => setToast(null), 3200)
  }, [])

  const value = useMemo(() => show, [show])
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" aria-live="polite">
        {toast && (
          <div key={toast.id} className={`toast toast-${toast.kind}`} role="status">
            <span className="toast-dot" />
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
