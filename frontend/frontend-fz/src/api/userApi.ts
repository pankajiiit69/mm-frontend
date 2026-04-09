import type { ApiSuccessResponse } from '../types/api'
import type { UpdateUserProfileRequest, UserProfile } from '../types/contracts'
import { apiConfig } from './config'
import { withMockLatency } from './mockApi'
import { privateApi } from './httpClient'

const mockProfiles = new Map<string, UserProfile>()

function getFallbackProfile(): UserProfile {
  return {
    id: 'user-1',
    displayName: 'Demo User',
    email: 'user@fruzoos.local',
    role: 'USER',
    phone: null,
  }
}

export const userApi = {
  async getMyProfile(currentUser?: UserProfile | null): Promise<ApiSuccessResponse<UserProfile>> {
    if (apiConfig.useMockApi) {
      const key = currentUser?.id ?? 'mock-user'
      const existing = mockProfiles.get(key)
      if (existing) {
        return withMockLatency(existing)
      }

      const nextProfile = currentUser ?? getFallbackProfile()
      mockProfiles.set(key, nextProfile)
      return withMockLatency(nextProfile)
    }

    const response = await privateApi.get<ApiSuccessResponse<UserProfile>>('/api/users/profile/extended/me')
    return response.data
  },

  async updateMyProfile(
    payload: UpdateUserProfileRequest,
    currentUser?: UserProfile | null,
  ): Promise<ApiSuccessResponse<UserProfile>> {
    if (apiConfig.useMockApi) {
      const key = currentUser?.id ?? 'mock-user'
      const baseline = mockProfiles.get(key) ?? currentUser ?? getFallbackProfile()
      const updated: UserProfile = {
        ...baseline,
        ...payload,
      }
      mockProfiles.set(key, updated)
      return withMockLatency(updated, 'Profile updated')
    }

    const response = await privateApi.patch<ApiSuccessResponse<UserProfile>>('/api/users/profile/extended/me', payload)
    return response.data
  },
}
