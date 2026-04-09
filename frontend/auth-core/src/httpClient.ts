import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { getAccessToken, tryRefreshToken } from './tokenManager'

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

export interface HttpClientConfig {
  baseURL: string
  timeout: number
}

export interface AuthHttpClients {
  publicApi: AxiosInstance
  privateApi: AxiosInstance
}

export function createAuthHttpClients(config: HttpClientConfig): AuthHttpClients {
  const withBaseConfig = () => ({
    baseURL: config.baseURL,
    timeout: config.timeout,
  })

  const publicApi = axios.create(withBaseConfig())
  const privateApi = axios.create(withBaseConfig())

  privateApi.interceptors.request.use((requestConfig) => {
    const token = getAccessToken()
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`
    }

    return requestConfig
  })

  privateApi.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableRequestConfig | undefined

      if (!originalRequest || originalRequest._retry || error.response?.status !== 401) {
        return Promise.reject(error)
      }

      originalRequest._retry = true
      const refreshed = await tryRefreshToken()

      if (!refreshed) {
        return Promise.reject(error)
      }

      originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`
      return privateApi.request(originalRequest)
    },
  )

  return {
    publicApi,
    privateApi,
  }
}
