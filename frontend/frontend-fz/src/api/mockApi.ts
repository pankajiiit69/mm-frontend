import type { ApiSuccessResponse } from '../types/api'

export function successEnvelope<T>(data: T, message = 'Success'): ApiSuccessResponse<T> {
  return {
    timestamp: new Date().toISOString(),
    status: 200,
    message,
    data,
  }
}

export async function withMockLatency<T>(
  data: T,
  message?: string,
  delayMs = 200,
): Promise<ApiSuccessResponse<T>> {
  await new Promise((resolve) => setTimeout(resolve, delayMs))
  return successEnvelope(data, message)
}
