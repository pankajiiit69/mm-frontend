import { createAuthHttpClients } from '@fruzoos/auth-core'
import { apiConfig } from './config'

const clients = createAuthHttpClients({
  baseURL: apiConfig.baseUrl,
  timeout: apiConfig.timeoutMs,
})

export const publicApi = clients.publicApi
export const privateApi = clients.privateApi
