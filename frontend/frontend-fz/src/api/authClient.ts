import { createAuthApiClient, type AuthApiClient } from '@fruzoos/auth-core'
import type { AuthUser } from '@fruzoos/auth-core'
import { mockOrders } from '../data/mockOrders'
import { apiConfig } from './config'
import { publicApi } from './httpClient'

export const authClient: AuthApiClient<AuthUser> = createAuthApiClient<AuthUser>({
  publicApi,
  useMockApi: apiConfig.useMockApi,
  getMockHealthStatus: () => (mockOrders.length > 0 ? 'UP' : 'UNKNOWN'),
  resolveMockRole: (email, fallbackRole) => {
    if (email.toLowerCase().includes('admin')) {
      return 'ADMIN'
    }
    return fallbackRole
  },
})
