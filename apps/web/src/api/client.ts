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

// Single-flight: concurrent 401s share one refresh request.
let refreshPromise: Promise<string> | null = null

function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(`${API_URL}/auth/refresh`, { credentials: 'include', method: 'POST' })
      if (!response.ok) throw new ApiError('Phiên đăng nhập đã hết hạn.', response.status)
      const body = (await response.json()) as { accessToken?: string }
      if (!body.accessToken) throw new ApiError('Phiên đăng nhập đã hết hạn.', response.status)
      setAccessToken(body.accessToken)
      return body.accessToken
    })().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

async function send<T>(path: string, options: RequestInit, token: string | null): Promise<T> {
  const headers = new Headers(options.headers)
  const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(url, { ...options, credentials: 'include', headers })
  } catch {
    throw new ApiError('Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.', 0)
  }

  const contentType = response.headers.get('Content-Type') || ''
  const body = contentType.includes('application/json')
    ? ((await response.json()) as T | ApiErrorBody)
    : null

  if (!response.ok) {
    throw new ApiError(errorMessage(body as ApiErrorBody | null, response.status), response.status, (body as ApiErrorBody | null)?.code)
  }

  if (body === null) {
    throw new ApiError('Phản hồi từ máy chủ không hợp lệ.', response.status)
  }

  return body as T
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken()
  try {
    return await send<T>(path, options, token)
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || !token || path === '/auth/refresh') throw error
    if (getAccessToken() !== token) {
      // Another request already refreshed — retry once with the fresh token.
      return send<T>(path, options, getAccessToken())
    }
    try {
      await refreshAccessToken()
    } catch {
      setAccessToken(null)
      globalThis.dispatchEvent?.(new Event('serene-auth-expired'))
      throw new ApiError('Phiên đăng nhập đã hết hạn.', 401)
    }
    return send<T>(path, options, getAccessToken())
  }
}
