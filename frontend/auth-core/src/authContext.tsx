import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { parseJwtExpiryMs } from './jwt'
import { clearAuthTokens, registerRefreshHandler, setAuthTokens } from './tokenManager'
import type { AuthApiClient, RefreshTokenRequest, SocialProvider } from './authApi'
import type { AuthState, AuthUser } from './authTypes'

interface LoginInput {
  email: string
  password: string
}

interface RegisterInput {
  name: string
  email: string
  password: string
  phone: string
}

export interface AuthContextValue {
  auth: AuthState
  login: (input: LoginInput) => Promise<void>
  socialLogin: (provider: SocialProvider, idToken: string) => Promise<void>
  register: (input: RegisterInput) => Promise<AuthUser>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  updateAuthUser: (user: AuthUser) => void
}

interface StorageLike {
  get: <T>(key: string) => T | null
  set: <T>(key: string, value: T) => void
  remove: (key: string) => void
}

interface AuthProviderProps {
  children: ReactNode
  authClient: Pick<
    AuthApiClient<AuthUser>,
    'login' | 'register' | 'socialLogin' | 'logout' | 'refresh'
  >
  storage: StorageLike
  storageKey: string
}

const defaultAuth: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children, authClient, storage, storageKey }: AuthProviderProps) {
  const [auth, setAuth] = useState<AuthState>(() => storage.get<AuthState>(storageKey) ?? defaultAuth)

  const clearAuthState = () => {
    setAuth(defaultAuth)
    storage.remove(storageKey)
    clearAuthTokens()
  }

  const persist = (nextAuth: AuthState) => {
    setAuth(nextAuth)
    storage.set(storageKey, nextAuth)
    setAuthTokens({
      accessToken: nextAuth.accessToken,
      refreshToken: nextAuth.refreshToken,
    })
  }

  const login = async ({ email, password }: LoginInput) => {
    const response = await authClient.login({ email, password })
    const nextAuth: AuthState = {
      isAuthenticated: true,
      user: response.data.user,
      accessToken: response.data.tokens.accessToken,
      refreshToken: response.data.tokens.refreshToken,
    }
    persist(nextAuth)
  }

  const socialLogin = async (provider: SocialProvider, idToken: string) => {
    const response = await authClient.socialLogin(provider, { idToken })
    const nextAuth: AuthState = {
      isAuthenticated: true,
      user: response.data.user,
      accessToken: response.data.tokens.accessToken,
      refreshToken: response.data.tokens.refreshToken,
    }
    persist(nextAuth)
  }

  const register = async ({ name, email, password, phone }: RegisterInput): Promise<AuthUser> => {
    const response = await authClient.register({ name, email, password, phone })
    const nextAuth: AuthState = {
      isAuthenticated: true,
      user: response.data.user,
      accessToken: response.data.tokens.accessToken,
      refreshToken: response.data.tokens.refreshToken,
    }
    persist(nextAuth)
    return response.data.user
  }

  const logout = async () => {
    await authClient.logout(auth.refreshToken ?? undefined)
    clearAuthState()
  }

  const refreshSession = async () => {
    if (!auth.isAuthenticated || !auth.refreshToken) return

    const payload: RefreshTokenRequest = { refreshToken: auth.refreshToken }
    const response = await authClient.refresh(payload)
    persist({
      ...auth,
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    })
  }

  const updateAuthUser = (user: AuthUser) => {
    setAuth((prev) => {
      if (!prev.isAuthenticated) return prev

      const nextAuth = {
        ...prev,
        user,
      }
      storage.set(storageKey, nextAuth)
      return nextAuth
    })
  }

  useEffect(() => {
    setAuthTokens({ accessToken: auth.accessToken, refreshToken: auth.refreshToken })
  }, [auth.accessToken, auth.refreshToken])

  useEffect(() => {
    registerRefreshHandler(async (currentRefreshToken) => {
      try {
        const response = await authClient.refresh({ refreshToken: currentRefreshToken })
        setAuth((prev) => {
          if (!prev.isAuthenticated) return prev

          const nextAuth = {
            ...prev,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          }
          storage.set(storageKey, nextAuth)
          return nextAuth
        })

        return {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        }
      } catch {
        clearAuthState()
        return null
      }
    })
  }, [authClient, storage, storageKey])

  useEffect(() => {
    if (!auth.isAuthenticated) return

    const expiryMs = parseJwtExpiryMs(auth.accessToken)
    if (!expiryMs) return

    const msUntilExpiry = expiryMs - Date.now()
    if (msUntilExpiry <= 0) {
      clearAuthState()
      return
    }

    const timeoutId = window.setTimeout(() => {
      clearAuthState()
    }, msUntilExpiry)

    return () => window.clearTimeout(timeoutId)
  }, [auth.isAuthenticated, auth.accessToken])

  const value = useMemo(
    () => ({ auth, login, socialLogin, register, logout, refreshSession, updateAuthUser }),
    [auth],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
