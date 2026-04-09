const AUTH_KEY = 'matrimony_auth_state'

export const storage = {
  get<T>(key: string): T | null {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  },
  set<T>(key: string, value: T) {
    sessionStorage.setItem(key, JSON.stringify(value))
  },
  remove(key: string) {
    sessionStorage.removeItem(key)
  },
}

export { AUTH_KEY }
