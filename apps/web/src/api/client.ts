const ACCESS_TOKEN_KEY = 'serene-health.access-token'

const rawApiUrl = (import.meta.env?.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')
export const API_URL = rawApiUrl.endsWith('/api/v1') ? rawApiUrl : `${rawApiUrl}/api/v1`

interface ApiErrorBody {
  message?: string | string[]
  code?: string
}

export class ApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string | null) {
  if (token) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
  } else {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  }
}

function errorMessage(body: ApiErrorBody | null, status: number) {
  if (Array.isArray(body?.message)) {
    return body.message.join(' ')
  }

  return body?.message || `Yêu cầu thất bại (${status}). Vui lòng thử lại.`
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  const token = getAccessToken()

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(`${API_URL}${path.startsWith('/') ? path : `/${path}`}`, {
      ...options,
      headers,
    })
  } catch {
    throw new ApiError('Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.', 0)
  }

  const contentType = response.headers.get('Content-Type') || ''
  const body = contentType.includes('application/json')
    ? ((await response.json()) as T | ApiErrorBody)
    : null

  if (!response.ok) {
    if (response.status === 401 && token && getAccessToken() === token) {
      setAccessToken(null)
      globalThis.dispatchEvent?.(new Event('serene-auth-expired'))
    }
    throw new ApiError(errorMessage(body as ApiErrorBody | null, response.status), response.status, (body as ApiErrorBody | null)?.code)
  }

  if (body === null) {
    throw new ApiError('Phản hồi từ máy chủ không hợp lệ.', response.status)
  }

  return body as T
}
