import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, tokenStore } from '../api/client'
import type { AdminUser } from '../api/types'

interface AuthApi {
  admin: AdminUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthApi | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState<boolean>(!!tokenStore.get())

  useEffect(() => {
    if (!tokenStore.get()) return
    api<AdminUser>('/api/auth/me', { admin: true })
      .then(setAdmin)
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const onUnauthorized = () => setAdmin(null)
    window.addEventListener('osc:unauthorized', onUnauthorized)
    return () => window.removeEventListener('osc:unauthorized', onUnauthorized)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api<{ token: string; admin: AdminUser }>('/api/auth/login', { method: 'POST', body: { email, password } })
    tokenStore.set(res.token)
    setAdmin(res.admin)
  }, [])

  const logout = useCallback(() => {
    tokenStore.clear()
    setAdmin(null)
  }, [])

  const value = useMemo(() => ({ admin, loading, login, logout }), [admin, loading, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
