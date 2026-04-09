export interface ApiSuccessResponse<T> {
  timestamp: string
  status: number
  message: string
  data: T
}

export interface ApiErrorResponse {
  timestamp: string
  status: number
  errorCode: string
  message: string
  path: string
  details: string[]
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  size: number
  totalPages: number
}
