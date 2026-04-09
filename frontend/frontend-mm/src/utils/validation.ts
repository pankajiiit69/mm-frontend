export function isEmailValid(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function minLength(value: string, length: number): boolean {
  return value.trim().length >= length
}

export function isPositiveNumber(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

export function isAddressValid(value: string): boolean {
  return value.trim().length >= 10
}
