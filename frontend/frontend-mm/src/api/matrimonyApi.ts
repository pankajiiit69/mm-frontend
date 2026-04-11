import type { ApiSuccessResponse, PaginatedResult } from '../types/api'
import type { AxiosResponse } from 'axios'
import type {
  AdminPicklistEntriesQuery,
  AdminProfilesQuery,
  AdminUser,
  AdminUsersQuery,
  CreateInterestRequest,
  DashboardStats,
  DiscoveryQuery,
  Interest,
  InterestStatus,
  MatrimonyProfileDetail,
  MatrimonyProfileSummary,
  Photo,
  PicklistEntry,
  PicklistItem,
  SuccessMessageResponse,
  UpsertPicklistEntryRequest,
  UpsertMyProfileRequest,
  VerificationStatus,
} from '../types/matrimony'
import { apiConfig } from './config'
import { privateApi, publicApi } from './httpClient'

interface PicklistData {
  picklistName: string
  lang: string
  items: PicklistItem[]
}

interface PicklistEntryPage {
  items: PicklistEntry[]
  total: number
  page: number
  size: number
  totalPages: number
}

function extractFileNameFromContentDisposition(contentDisposition?: string) {
  const matchedFileName = contentDisposition?.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i)?.[1]
  return matchedFileName ? decodeURIComponent(matchedFileName.replace(/"/g, '')) : 'biodata.pdf'
}

function buildStandardBiodataFileName(fileName: string) {
  const ext = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() : undefined
  return ext ? `biodata.${ext}` : 'biodata.pdf'
}

function normalizePhotoUrl(photoUrl?: string) {
  if (!photoUrl) {
    return photoUrl
  }

  if (/^https?:\/\//i.test(photoUrl) || photoUrl.startsWith('data:')) {
    return photoUrl
  }

  const normalizedPath = photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`
  const base = apiConfig.baseUrl.endsWith('/') ? apiConfig.baseUrl.slice(0, -1) : apiConfig.baseUrl
  return `${base}${normalizedPath}`
}

function normalizeProfileSummary(profile: MatrimonyProfileSummary): MatrimonyProfileSummary {
  return {
    ...profile,
    profilePhotoIdentifier: profile.profilePhotoIdentifier,
    profilePhotoUrl: normalizePhotoUrl(profile.profilePhotoUrl),
  }
}

function normalizeProfileDetail(profile: MatrimonyProfileDetail): MatrimonyProfileDetail {
  return {
    ...profile,
    profilePhotoIdentifier: profile.profilePhotoIdentifier,
    profilePhotoUrl: normalizePhotoUrl(profile.profilePhotoUrl),
    biodataIdentifier: profile.biodataIdentifier,
    biodataUrl: normalizePhotoUrl(profile.biodataUrl),
    galleryPhotos: profile.galleryPhotos?.map(normalizePhoto) ?? [],
  }
}

function normalizePhoto(photo: Photo): Photo {
  return {
    ...photo,
    photoIdentifier: photo.photoIdentifier,
    photoUrl: normalizePhotoUrl(photo.photoUrl) ?? photo.photoUrl,
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      resolve(result)
    }
    reader.onerror = () => {
      reject(new Error('Unable to read image content.'))
    }
    reader.readAsDataURL(blob)
  })
}

function normalizeAdminUser(user: AdminUser): AdminUser {
  return {
    ...user,
  }
}

function cleanParams<T extends object>(params: T) {
  return Object.fromEntries(
    Object.entries(params as Record<string, unknown>).filter(
      ([, value]) => {
        if (value === undefined || value === null || value === '') {
          return false
        }

        if (Array.isArray(value) && value.length === 0) {
          return false
        }

        return true
      },
    ),
  )
}

export const matrimonyApi = {
  async health() {
    const response = await publicApi.get<ApiSuccessResponse<{ status: string; timestamp: string }>>('/api/health')
    return response.data
  },

  async discoverProfiles(query: DiscoveryQuery) {
    const response = await privateApi.get<ApiSuccessResponse<PaginatedResult<MatrimonyProfileSummary>>>(
      '/api/matrimony/discovery/profiles',
      {
        params: cleanParams(query),
        paramsSerializer: {
          indexes: null,
        },
      },
    )
    return {
      ...response.data,
      data: {
        ...response.data.data,
        items: response.data.data.items.map(normalizeProfileSummary),
      },
    }
  },

  async getPicklistItems(name: string, lang = 'en') {
    const response = await publicApi.get<ApiSuccessResponse<PicklistData>>(`/api/public/picklists/${name}`, {
      params: cleanParams({ lang }),
    })
    return response.data.data.items
  },

  async getMyProfile() {
    const response = await privateApi.get<ApiSuccessResponse<MatrimonyProfileDetail>>('/api/users/profile/extended/me')
    return {
      ...response.data,
      data: normalizeProfileDetail(response.data.data),
    }
  },

  async upsertMyProfile(payload: UpsertMyProfileRequest) {
    const response = await privateApi.put<ApiSuccessResponse<MatrimonyProfileDetail>>(
      '/api/users/profile/extended/me',
      payload,
    )
    return {
      ...response.data,
      data: normalizeProfileDetail(response.data.data),
    }
  },

  async getProfileById(profileId: string) {
    const response = await privateApi.get<ApiSuccessResponse<MatrimonyProfileDetail>>(
      `/api/users/profile/extended/${profileId}`,
    )
    return {
      ...response.data,
      data: normalizeProfileDetail(response.data.data),
    }
  },

  async uploadProfilePhoto(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await privateApi.post<ApiSuccessResponse<Photo>>('/api/matrimony/photos/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return {
      ...response.data,
      data: normalizePhoto(response.data.data),
    }
  },

  async listGalleryPhotos() {
    const response = await privateApi.get<ApiSuccessResponse<Photo[]>>('/api/matrimony/photos/gallery')
    return {
      ...response.data,
      data: response.data.data.map(normalizePhoto),
    }
  },

  async uploadGalleryPhoto(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await privateApi.post<ApiSuccessResponse<Photo>>('/api/matrimony/photos/gallery', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return {
      ...response.data,
      data: normalizePhoto(response.data.data),
    }
  },

  async getPhotoContentByIdentifier(photoIdentifier: string) {
    const response = await privateApi.get<Blob, AxiosResponse<Blob>>(
      `/api/matrimony/photos/identifier/${encodeURIComponent(photoIdentifier)}`,
      {
        responseType: 'blob',
      },
    )
    const imageDataUrl = await blobToDataUrl(response.data)

    return {
      data: {
        imageDataUrl,
      },
    }
  },

  async uploadBiodata(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await privateApi.post<SuccessMessageResponse>(
      '/api/matrimony/biodata',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )
    return response.data
  },

  async downloadMyBiodata() {
    const response = await privateApi.get<Blob, AxiosResponse<Blob>>('/api/matrimony/biodata', {
      responseType: 'blob',
    })

    const originalFileName = extractFileNameFromContentDisposition(response.headers['content-disposition'])
    const fileName = buildStandardBiodataFileName(originalFileName)

    return {
      blob: response.data,
      fileName,
    }
  },

  async downloadBiodataByProfileId(profileId: string) {
    const response = await privateApi.get<Blob, AxiosResponse<Blob>>(`/api/matrimony/biodata/${profileId}`, {
      responseType: 'blob',
    })

    const originalFileName = extractFileNameFromContentDisposition(response.headers['content-disposition'])
    const fileName = buildStandardBiodataFileName(originalFileName)

    return {
      blob: response.data,
      fileName,
    }
  },

  async getMyBiodataMeta() {
    try {
      const response = await privateApi.get<Blob, AxiosResponse<Blob>>('/api/matrimony/biodata', {
        responseType: 'blob',
      })

      const originalFileName = extractFileNameFromContentDisposition(response.headers['content-disposition'])

      return {
        available: true,
        fileName: buildStandardBiodataFileName(originalFileName),
      }
    } catch {
      return {
        available: false,
        fileName: 'biodata.pdf',
      }
    }
  },

  async deleteMyBiodata() {
    const response = await privateApi.delete<SuccessMessageResponse>('/api/matrimony/biodata')
    return response.data
  },

  async deleteGalleryPhoto(photoId: number) {
    const response = await privateApi.delete<SuccessMessageResponse>(`/api/matrimony/photos/gallery/${photoId}`)
    return response.data
  },

  async sendInterest(payload: CreateInterestRequest) {
    const response = await privateApi.post<ApiSuccessResponse<Interest>>('/api/matrimony/interests', payload)
    return response.data
  },

  async listSentInterests(page = 1, size = 10) {
    const response = await privateApi.get<ApiSuccessResponse<PaginatedResult<Interest>>>(
      '/api/matrimony/interests/sent',
      {
        params: { page, size },
      },
    )
    return response.data
  },

  async listReceivedInterests(page = 1, size = 10) {
    const response = await privateApi.get<ApiSuccessResponse<PaginatedResult<Interest>>>(
      '/api/matrimony/interests/received',
      {
        params: { page, size },
      },
    )
    return response.data
  },

  async updateInterestStatus(interestId: number, status: InterestStatus) {
    const response = await privateApi.patch<ApiSuccessResponse<Interest>>(
      `/api/matrimony/interests/${interestId}/status`,
      { status },
    )
    return response.data
  },

  async listShortlistedProfiles(page = 1, size = 10) {
    const response = await privateApi.get<ApiSuccessResponse<PaginatedResult<MatrimonyProfileSummary>>>(
      '/api/matrimony/shortlists',
      {
        params: { page, size },
      },
    )
    return {
      ...response.data,
      data: {
        ...response.data.data,
        items: response.data.data.items.map(normalizeProfileSummary),
      },
    }
  },

  async addProfileToShortlist(profileId: string) {
    const response = await privateApi.put<SuccessMessageResponse>(`/api/matrimony/shortlists/${profileId}`)
    return response.data
  },

  async removeProfileFromShortlist(profileId: string) {
    const response = await privateApi.delete<SuccessMessageResponse>(`/api/matrimony/shortlists/${profileId}`)
    return response.data
  },

  async getAdminDashboardStats() {
    const response = await privateApi.get<ApiSuccessResponse<DashboardStats>>('/api/admin/dashboard/stats')
    return response.data
  },

  async adminListUsers(query: AdminUsersQuery) {
    const response = await privateApi.get<ApiSuccessResponse<PaginatedResult<AdminUser>>>('/api/admin/users', {
      params: cleanParams(query),
    })
    return {
      ...response.data,
      data: {
        ...response.data.data,
        items: response.data.data.items.map(normalizeAdminUser),
      },
    }
  },

  async adminGetUser(userId: number) {
    const response = await privateApi.get<ApiSuccessResponse<AdminUser>>(`/api/admin/users/${userId}`)
    return {
      ...response.data,
      data: normalizeAdminUser(response.data.data),
    }
  },

  async adminActivateUser(userId: number) {
    const response = await privateApi.patch<ApiSuccessResponse<AdminUser>>(`/api/admin/users/${userId}/activate`)
    return {
      ...response.data,
      data: normalizeAdminUser(response.data.data),
    }
  },

  async adminDeactivateUser(userId: number) {
    const response = await privateApi.patch<ApiSuccessResponse<AdminUser>>(`/api/admin/users/${userId}/deactivate`)
    return {
      ...response.data,
      data: normalizeAdminUser(response.data.data),
    }
  },

  async adminSetUserVerificationStatus(userId: number, verificationStatus: VerificationStatus) {
    const response = await privateApi.patch<ApiSuccessResponse<AdminUser>>(
      `/api/admin/users/${userId}/verification-status`,
      {
        verificationStatus,
      },
    )
    return {
      ...response.data,
      data: normalizeAdminUser(response.data.data),
    }
  },

  async adminListProfiles(query: AdminProfilesQuery) {
    const response = await privateApi.get<ApiSuccessResponse<PaginatedResult<MatrimonyProfileSummary>>>(
      '/api/admin/profiles',
      {
        params: cleanParams(query),
      },
    )
    return {
      ...response.data,
      data: {
        ...response.data.data,
        items: response.data.data.items.map(normalizeProfileSummary),
      },
    }
  },

  async adminVerifyProfile(profileId: number) {
    const response = await privateApi.patch<SuccessMessageResponse>(`/api/admin/profiles/${profileId}/verify`)
    return response.data
  },

  async adminUnverifyProfile(profileId: number) {
    const response = await privateApi.patch<SuccessMessageResponse>(`/api/admin/profiles/${profileId}/unverify`)
    return response.data
  },

  async adminDeleteProfile(profileId: number) {
    const response = await privateApi.delete<SuccessMessageResponse>(`/api/admin/profiles/${profileId}`)
    return response.data
  },

  async adminListPicklistEntries(query: AdminPicklistEntriesQuery) {
    const response = await privateApi.get<ApiSuccessResponse<PicklistEntryPage>>('/api/admin/picklists', {
      params: cleanParams(query),
    })
    return response.data
  },

  async adminCreatePicklistEntry(payload: UpsertPicklistEntryRequest) {
    const response = await privateApi.post<ApiSuccessResponse<PicklistEntry>>('/api/admin/picklists', payload)
    return response.data
  },

  async adminUpdatePicklistEntry(id: number, payload: UpsertPicklistEntryRequest) {
    const response = await privateApi.put<ApiSuccessResponse<PicklistEntry>>(`/api/admin/picklists/${id}`, payload)
    return response.data
  },

  async adminDeletePicklistEntry(id: number) {
    const response = await privateApi.delete<SuccessMessageResponse>(`/api/admin/picklists/${id}`)
    return response.data
  },

  async adminActivatePicklistEntry(id: number) {
    const response = await privateApi.patch<ApiSuccessResponse<PicklistEntry>>(`/api/admin/picklists/${id}/activate`)
    return response.data
  },

  async adminDeactivatePicklistEntry(id: number) {
    const response = await privateApi.patch<ApiSuccessResponse<PicklistEntry>>(`/api/admin/picklists/${id}/deactivate`)
    return response.data
  },
}