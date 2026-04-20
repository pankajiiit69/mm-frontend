const defaultTimeoutMs = 30000

function resolveTimeoutMs(rawValue: string | undefined): number {
  const parsed = Number(rawValue)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return defaultTimeoutMs
  }

  return parsed
}

function resolveUseMockApi(rawValue: string | undefined, mode: string | undefined): boolean {
  if (rawValue !== undefined) {
    return rawValue.toLowerCase() === 'true'
  }

  // In local/dev workflows, default to mocks to avoid noisy backend connection errors.
  return mode !== 'production'
}

export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  timeoutMs: resolveTimeoutMs(import.meta.env.VITE_REQUEST_TIMEOUT_MS),
  useMockApi: resolveUseMockApi(import.meta.env.VITE_USE_MOCK_API, import.meta.env.MODE),
}
