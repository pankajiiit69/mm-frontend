export type AuthTokens = {
  accessToken: string | null
  refreshToken: string | null
}

export type RefreshHandler = (refreshToken: string) => Promise<AuthTokens | null>

let accessToken: string | null = null
let refreshToken: string | null = null
let refreshHandler: RefreshHandler | null = null
let refreshInFlight: Promise<AuthTokens | null> | null = null

export function setAuthTokens(tokens: AuthTokens) {
  accessToken = tokens.accessToken
  refreshToken = tokens.refreshToken
}

export function clearAuthTokens() {
  accessToken = null
  refreshToken = null
}

export function getAccessToken() {
  return accessToken
}

export function getRefreshToken() {
  return refreshToken
}

export function registerRefreshHandler(handler: RefreshHandler) {
  refreshHandler = handler
}

export async function tryRefreshToken(): Promise<AuthTokens | null> {
  if (!refreshToken || !refreshHandler) return null

  if (!refreshInFlight) {
    refreshInFlight = refreshHandler(refreshToken).finally(() => {
      refreshInFlight = null
    })
  }

  const refreshed = await refreshInFlight
  if (refreshed) {
    setAuthTokens(refreshed)
  }

  return refreshed
}
