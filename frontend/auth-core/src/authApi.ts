import type { AxiosInstance } from 'axios'

export interface ApiSuccessResponse<T> {
  timestamp: string
  status: number
  message: string
  data: T
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthUserBase {
  id: string
  name: string
  email: string
  role: string
}

export interface AuthSessionResponse<TUser extends AuthUserBase = AuthUserBase> {
  user: TUser
  tokens: AuthTokens
}

export interface LoginRequest<TRole extends string = string> {
  email: string
  password: string
  role?: TRole
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  phone: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface SocialLoginRequest {
  idToken: string
}

export type SocialProvider = 'google' | 'github' | 'facebook' | 'apple' | 'telegram'

export interface PasswordResetOtpRequest {
  mobile: string
}

export interface PasswordResetVerifyOtpRequest {
  mobile: string
  otp: string
}

export interface PasswordResetRequest {
  resetToken: string
  newPassword: string
}

export interface MessagePayload {
  message: string
}

export interface PasswordResetTokenPayload {
  resetToken: string
}

export interface AuthApiEndpoints {
  login: string
  register: string
  refresh: string
  logout: string
  socialPrefix: string
  health: string
  requestPasswordResetOtp: string
  verifyPasswordResetOtp: string
  resetPassword: string
}

export interface CreateAuthApiClientOptions {
  publicApi: AxiosInstance
  endpoints?: Partial<AuthApiEndpoints>
  useMockApi?: boolean
  mockLatencyMs?: number
  resolveMockRole?: (email: string, fallbackRole: string) => string
  getMockHealthStatus?: () => string
}

const defaultEndpoints: AuthApiEndpoints = {
  login: '/api/auth/login',
  register: '/api/auth/register',
  refresh: '/api/auth/refresh',
  logout: '/api/auth/logout',
  socialPrefix: '/api/auth/social',
  health: '/actuator/health',
  requestPasswordResetOtp: '/api/auth/password-reset/request-otp',
  verifyPasswordResetOtp: '/api/auth/password-reset/verify-otp',
  resetPassword: '/api/auth/password-reset/reset',
}

export interface AuthApiClient<TUser extends AuthUserBase = AuthUserBase> {
  login: (payload: LoginRequest<TUser['role']>) => Promise<ApiSuccessResponse<AuthSessionResponse<TUser>>>
  register: (payload: RegisterRequest) => Promise<ApiSuccessResponse<AuthSessionResponse<TUser>>>
  refresh: (payload: RefreshTokenRequest) => Promise<ApiSuccessResponse<AuthTokens>>
  logout: (refreshToken?: string) => Promise<ApiSuccessResponse<{ loggedOut: boolean }>>
  socialLogin: (
    provider: SocialProvider,
    payload: SocialLoginRequest,
  ) => Promise<ApiSuccessResponse<AuthSessionResponse<TUser>>>
  health: () => Promise<ApiSuccessResponse<{ status: string }>>
  requestPasswordResetOtp: (payload: PasswordResetOtpRequest) => Promise<ApiSuccessResponse<MessagePayload>>
  verifyPasswordResetOtp: (
    payload: PasswordResetVerifyOtpRequest,
  ) => Promise<ApiSuccessResponse<PasswordResetTokenPayload>>
  resetPassword: (payload: PasswordResetRequest) => Promise<ApiSuccessResponse<MessagePayload>>
}

function createSuccessResponse<T>(data: T, message = 'Success'): ApiSuccessResponse<T> {
  return {
    timestamp: new Date().toISOString(),
    status: 200,
    message,
    data,
  }
}

function withMockLatency<T>(response: ApiSuccessResponse<T>, latencyMs: number): Promise<ApiSuccessResponse<T>> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(response), latencyMs)
  })
}

export function createAuthApiClient<TUser extends AuthUserBase = AuthUserBase>({
  publicApi,
  endpoints,
  useMockApi = false,
  mockLatencyMs = 250,
  resolveMockRole,
  getMockHealthStatus,
}: CreateAuthApiClientOptions) {
  const resolvedEndpoints: AuthApiEndpoints = {
    ...defaultEndpoints,
    ...endpoints,
  }

  const client: AuthApiClient<TUser> = {
    async login(
      payload: LoginRequest<TUser['role']>,
    ): Promise<ApiSuccessResponse<AuthSessionResponse<TUser>>> {
      if (useMockApi) {
        const fallbackRole = payload.role ?? ('USER' as TUser['role'])
        const role = (resolveMockRole?.(payload.email, fallbackRole) ?? fallbackRole) as TUser['role']
        const userId = String(role).toUpperCase() === 'ADMIN' ? 'admin-1' : 'user-1'

        return withMockLatency(
          createSuccessResponse(
            {
              user: {
                id: userId,
                name: userId === 'admin-1' ? 'Admin User' : 'Demo User',
                email: payload.email,
                role,
              } as TUser,
              tokens: {
                accessToken: `mock-access-${Date.now()}`,
                refreshToken: `mock-refresh-${Date.now()}`,
              },
            },
            'Login successful',
          ),
          mockLatencyMs,
        )
      }

      const response = await publicApi.post<ApiSuccessResponse<AuthSessionResponse<TUser>>>(
        resolvedEndpoints.login,
        {
          email: payload.email,
          password: payload.password,
        },
      )
      return response.data
    },

    async register(payload: RegisterRequest): Promise<ApiSuccessResponse<AuthSessionResponse<TUser>>> {
      if (useMockApi) {
        return withMockLatency(
          createSuccessResponse(
            {
              user: {
                id: `user-${Date.now()}`,
                name: payload.name,
                email: payload.email,
                role: 'USER',
              } as TUser,
              tokens: {
                accessToken: `mock-access-${Date.now()}`,
                refreshToken: `mock-refresh-${Date.now()}`,
              },
            },
            'Registration successful',
          ),
          mockLatencyMs,
        )
      }

      const response = await publicApi.post<ApiSuccessResponse<AuthSessionResponse<TUser>>>(
        resolvedEndpoints.register,
        payload,
      )
      return response.data
    },

    async refresh(payload: RefreshTokenRequest): Promise<ApiSuccessResponse<AuthTokens>> {
      if (useMockApi) {
        return withMockLatency(
          createSuccessResponse(
            {
              accessToken: `mock-access-refreshed-${Date.now()}`,
              refreshToken: payload.refreshToken,
            },
            'Token refreshed',
          ),
          mockLatencyMs,
        )
      }

      const response = await publicApi.post<ApiSuccessResponse<AuthTokens>>(resolvedEndpoints.refresh, payload)
      return response.data
    },

    async logout(refreshToken?: string): Promise<ApiSuccessResponse<{ loggedOut: boolean }>> {
      if (useMockApi) {
        return withMockLatency(createSuccessResponse({ loggedOut: true }, 'Logout successful'), 120)
      }

      const response = await publicApi.post<ApiSuccessResponse<{ loggedOut: boolean }>>(resolvedEndpoints.logout, {
        refreshToken,
      })
      return response.data
    },

    async socialLogin(
      provider: SocialProvider,
      payload: SocialLoginRequest,
    ): Promise<ApiSuccessResponse<AuthSessionResponse<TUser>>> {
      if (useMockApi) {
        const providerName = provider.charAt(0).toUpperCase() + provider.slice(1)
        return withMockLatency(
          createSuccessResponse(
            {
              user: {
                id: `${provider}-user-1`,
                name: `${providerName} User`,
                email: `${provider}-user@fruzoos.local`,
                role: 'USER',
              } as TUser,
              tokens: {
                accessToken: `mock-social-access-${Date.now()}`,
                refreshToken: `mock-social-refresh-${Date.now()}`,
              },
            },
            `${providerName} login successful`,
          ),
          mockLatencyMs,
        )
      }

      const normalizedPrefix = resolvedEndpoints.socialPrefix.endsWith('/')
        ? resolvedEndpoints.socialPrefix.slice(0, -1)
        : resolvedEndpoints.socialPrefix

      const response = await publicApi.post<ApiSuccessResponse<AuthSessionResponse<TUser>>>(
        `${normalizedPrefix}/${provider}`,
        payload,
      )
      return response.data
    },

    async health(): Promise<ApiSuccessResponse<{ status: string }>> {
      if (useMockApi) {
        return withMockLatency(
          createSuccessResponse({ status: getMockHealthStatus?.() ?? 'UP' }),
          mockLatencyMs,
        )
      }

      const response = await publicApi.get<ApiSuccessResponse<{ status: string }>>(resolvedEndpoints.health)
      return response.data
    },

    async requestPasswordResetOtp(
      payload: PasswordResetOtpRequest,
    ): Promise<ApiSuccessResponse<MessagePayload>> {
      if (useMockApi) {
        const maskedMobile = payload.mobile.length > 4 ? `+91XXXXXX${payload.mobile.slice(-4)}` : payload.mobile
        return withMockLatency(
          createSuccessResponse(
            {
              message: `OTP sent to ${maskedMobile}`,
            },
            'OTP sent to registered mobile number',
          ),
          mockLatencyMs,
        )
      }

      const response = await publicApi.post<ApiSuccessResponse<MessagePayload>>(
        resolvedEndpoints.requestPasswordResetOtp,
        payload,
      )
      return response.data
    },

    async verifyPasswordResetOtp(
      payload: PasswordResetVerifyOtpRequest,
    ): Promise<ApiSuccessResponse<PasswordResetTokenPayload>> {
      if (useMockApi) {
        return withMockLatency(
          createSuccessResponse(
            {
              resetToken: `mock-reset-token-${Date.now()}`,
            },
            'OTP verified',
          ),
          mockLatencyMs,
        )
      }

      const response = await publicApi.post<ApiSuccessResponse<PasswordResetTokenPayload>>(
        resolvedEndpoints.verifyPasswordResetOtp,
        payload,
      )
      return response.data
    },

    async resetPassword(payload: PasswordResetRequest): Promise<ApiSuccessResponse<MessagePayload>> {
      if (useMockApi) {
        return withMockLatency(
          createSuccessResponse(
            {
              message: 'Your password has been updated. Please login again.',
            },
            'Password reset successful',
          ),
          mockLatencyMs,
        )
      }

      const response = await publicApi.post<ApiSuccessResponse<MessagePayload>>(
        resolvedEndpoints.resetPassword,
        payload,
      )
      return response.data
    },
  }

  return client
}