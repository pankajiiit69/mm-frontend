type ApiLoadingListener = (isLoading: boolean) => void

let activeRequestCount = 0
const listeners = new Set<ApiLoadingListener>()

function notify() {
  const isLoading = activeRequestCount > 0
  listeners.forEach((listener) => listener(isLoading))
}

export function startApiRequest() {
  activeRequestCount += 1
  notify()
}

export function finishApiRequest() {
  activeRequestCount = Math.max(0, activeRequestCount - 1)
  notify()
}

export function isApiLoading() {
  return activeRequestCount > 0
}

export function subscribeApiLoading(listener: ApiLoadingListener) {
  listeners.add(listener)
  listener(isApiLoading())

  return () => {
    listeners.delete(listener)
  }
}
