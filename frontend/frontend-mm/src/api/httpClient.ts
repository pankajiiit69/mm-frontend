import { createAuthHttpClients } from '@fruzoos/auth-core'
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { apiConfig } from './config'
import { finishApiRequest, startApiRequest } from './requestActivity'

const clients = createAuthHttpClients({
  baseURL: apiConfig.baseUrl,
  timeout: apiConfig.timeoutMs,
})

const TRACK_LOADER_KEY = '__trackGlobalLoader'

type LoaderTrackedConfig = InternalAxiosRequestConfig & {
  [TRACK_LOADER_KEY]?: boolean
}

function attachLoadingInterceptor(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    const nextConfig = config as LoaderTrackedConfig
    nextConfig[TRACK_LOADER_KEY] = true
    startApiRequest()
    return nextConfig
  })

  client.interceptors.response.use(
    (response) => {
      const trackedConfig = response.config as LoaderTrackedConfig
      if (trackedConfig[TRACK_LOADER_KEY]) {
        finishApiRequest()
      }
      return response
    },
    (error) => {
      const trackedConfig = error?.config as LoaderTrackedConfig | undefined
      if (trackedConfig?.[TRACK_LOADER_KEY]) {
        finishApiRequest()
      }
      return Promise.reject(error)
    },
  )
}

attachLoadingInterceptor(clients.publicApi)
attachLoadingInterceptor(clients.privateApi)

export const publicApi = clients.publicApi
export const privateApi = clients.privateApi
