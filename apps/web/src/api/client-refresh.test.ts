import assert from 'node:assert/strict'
import test from 'node:test'

class StorageStub {
  readonly values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, value) }
}

const storage = new StorageStub()
Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: storage })

const { ApiError, api, setAccessToken, getAccessToken } = await import('./client.ts')

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' }, status })
}

test('401 triggers single refresh then retries original request', async () => {
  setAccessToken('expired-token')
  let refreshCalls = 0
  // Fail with stale token, succeed with fresh token.
  globalThis.fetch = async (input, init) => {
    const url = String(input)
    if (url.endsWith('/auth/refresh')) {
      refreshCalls += 1
      return jsonResponse({ accessToken: 'fresh-token', user: {} })
    }
    const auth = new Headers(init?.headers).get('Authorization')
    if (auth === 'Bearer fresh-token') return jsonResponse({ ok: true })
    return jsonResponse({ message: 'Unauthorized' }, 401)
  }

  assert.deepEqual(await api<{ ok: boolean }>('/auth/me'), { ok: true })
  assert.equal(refreshCalls, 1)
  assert.equal(getAccessToken(), 'fresh-token')
})

test('concurrent 401s share one refresh request', async () => {
  setAccessToken('expired-token')
  let refreshCalls = 0
  let releaseRefresh!: (response: Response) => void
  const refreshGate = new Promise<Response>((resolve) => { releaseRefresh = resolve })
  globalThis.fetch = async (input, init) => {
    const url = String(input)
    if (url.endsWith('/auth/refresh')) {
      refreshCalls += 1
      return refreshGate
    }
    const auth = new Headers(init?.headers).get('Authorization')
    if (auth === 'Bearer fresh-token') return jsonResponse({ ok: true })
    return jsonResponse({ message: 'Unauthorized' }, 401)
  }

  const first = api<{ ok: boolean }>('/auth/me')
  const second = api<{ ok: boolean }>('/auth/me')
  releaseRefresh(jsonResponse({ accessToken: 'fresh-token', user: {} }))
  assert.deepEqual(await first, { ok: true })
  assert.deepEqual(await second, { ok: true })
  assert.equal(refreshCalls, 1)
})

test('failed refresh clears session and throws 401', async () => {
  setAccessToken('expired-token')
  globalThis.fetch = async (input) => {
    if (String(input).endsWith('/auth/refresh')) return jsonResponse({ message: 'expired' }, 401)
    return jsonResponse({ message: 'Unauthorized' }, 401)
  }

  await assert.rejects(api('/auth/me'), (error: unknown) => error instanceof ApiError && error.status === 401)
  assert.equal(getAccessToken(), null)
})
