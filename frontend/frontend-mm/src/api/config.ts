const defaultTimeoutMs = 30000

function resolveTimeoutMs(rawValue: string | undefined): number {
  const parsed = Number(rawValue)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return defaultTimeoutMs
  }

  return parsed
}

export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8085',
  timeoutMs: resolveTimeoutMs(import.meta.env.VITE_REQUEST_TIMEOUT_MS),
  useMockApi: (import.meta.env.VITE_USE_MOCK_API ?? 'false').toLowerCase() === 'true',
}
