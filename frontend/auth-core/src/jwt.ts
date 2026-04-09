export function parseJwtExpiryMs(token: string | null): number | null {
  if (!token) return null

  const parts = token.split('.')
  if (parts.length < 2) return null

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const payload = JSON.parse(atob(normalized)) as { exp?: number | string }
    const exp = typeof payload.exp === 'number' ? payload.exp : Number(payload.exp)

    if (!Number.isFinite(exp) || exp <= 0) {
      return null
    }

    return exp * 1000
  } catch {
    return null
  }
}
