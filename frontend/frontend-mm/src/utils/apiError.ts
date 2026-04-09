/**
 * Extracts a user-facing error message from an Axios error response.
 * Falls back to `fallback` if no server message is available.
 */
export function extractApiError(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const resp = (err as { response?: { data?: { message?: string } } }).response
    const msg = resp?.data?.message
    if (msg && typeof msg === 'string' && msg.trim()) {
      return msg.trim()
    }
  }
  if (err instanceof Error && err.message) {
    return err.message
  }
  return fallback
}
