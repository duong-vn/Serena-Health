import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { api, getAccessToken, setAccessToken } from '../api/client'

export type UserRole = 'PATIENT' | 'DOCTOR' | 'EXPERT' | 'MANAGER'

export interface AuthUser {
  id: string
  email: string
  phone: string | null
  fullName: string
  role: UserRole
  active: boolean
}

export interface RegisterInput {
  email: string
  phone?: string
  fullName: string
  password: string
  gender?: string
  birthday?: string
}

interface AuthPayload {
  accessToken: string
  user: AuthUser
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  error: string | null
  retry: () => void
  login: (email: string, password: string) => Promise<AuthUser>
  logout: () => void
  register: (input: RegisterInput) => Promise<AuthUser>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function persistSession(payload: AuthPayload, setUser: (user: AuthUser) => void) {
  setAccessToken(payload.accessToken)
  setUser(payload.user)
  return payload.user
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(Boolean(getAccessToken()))
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const retry = useCallback(() => setAttempt((value) => value + 1), [])

  const logout = useCallback(() => {
    setAccessToken(null)
    setUser(null)
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    const handleExpired = () => setUser(null)
    globalThis.addEventListener('serene-auth-expired', handleExpired)
    return () => globalThis.removeEventListener('serene-auth-expired', handleExpired)
  }, [])

  useEffect(() => {
    if (!getAccessToken()) {
      setLoading(false)
      return
    }

    let active = true
    const session = getAccessToken()
    setLoading(true)
    setError(null)
    api<AuthUser>('/auth/me')
      .then((currentUser) => {
        if (active && getAccessToken() === session) setUser(currentUser)
      })
      .catch((failure: unknown) => {
        if (active && getAccessToken() === session) {
          setError(failure instanceof Error ? failure.message : 'Không thể xác thực phiên. Vui lòng thử lại.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [attempt])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      retry,
      login: async (email, password) =>
        persistSession(
          await api<AuthPayload>('/auth/login', {
            body: JSON.stringify({ email, password }),
            method: 'POST',
          }),
          setUser,
        ),
      logout,
      register: async (input) =>
        persistSession(
          await api<AuthPayload>('/auth/register', {
            body: JSON.stringify(input),
            method: 'POST',
          }),
          setUser,
        ),
    }),
    [error, loading, logout, retry, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
