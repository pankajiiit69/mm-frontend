export type Role = 'ADMIN' | 'USER'

export type VerificationStatus = 'VERIFIED' | 'PENDING' | 'UNVERIFIED' | 'REJECTED' | string

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
  phone?: string | null
  verificationStatus?: VerificationStatus | null
}

export interface AuthState {
  isAuthenticated: boolean
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
}
