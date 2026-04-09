import { createAuthApiClient, type ApiSuccessResponse, type AuthApiClient } from '@fruzoos/auth-core'
import type { AuthUser } from '@fruzoos/auth-core'
import { apiConfig } from './config'
import { privateApi, publicApi } from './httpClient'

export const authClient: AuthApiClient<AuthUser> = createAuthApiClient<AuthUser>({
  publicApi,
  useMockApi: apiConfig.useMockApi,
  getMockHealthStatus: () => 'UP',
  resolveMockRole: (email, fallbackRole) => {
    if (email.toLowerCase().includes('admin')) {
      return 'ADMIN'
    }
    return fallbackRole
  },
})

export async function getAuthenticatedUser() {
  const response = await privateApi.get<ApiSuccessResponse<AuthUser>>('/api/auth/me')
  return response.data.data
}
