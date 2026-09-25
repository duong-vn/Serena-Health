import assert from 'node:assert/strict'
import test from 'node:test'

class StorageStub {
  readonly values = new Map<string, string>()

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  removeItem(key: string) {
    this.values.delete(key)
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

const storage = new StorageStub()
Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: storage })

const { ApiError, api, getAccessToken, setAccessToken } = await import('./client.ts')

test('stores the access token only in session storage', () => {
  setAccessToken('access-token')
  assert.equal(getAccessToken(), 'access-token')
  assert.equal(storage.getItem('serene-health.access-token'), 'access-token')

  setAccessToken(null)
  assert.equal(getAccessToken(), null)
})

test('adds bearer auth and returns the API payload', async () => {
  setAccessToken('access-token')
  let authorization = ''
  globalThis.fetch = async (_input, init) => {
    authorization = new Headers(init?.headers).get('Authorization') ?? ''
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  }

  assert.deepEqual(await api<{ ok: boolean }>('/auth/me'), { ok: true })
  assert.equal(authorization, 'Bearer access-token')
})

test('clears an expired session when refresh also fails', async () => {
  setAccessToken('expired')
  globalThis.fetch = async (input) => {
    if (String(input).endsWith('/auth/refresh')) {
      return new Response(JSON.stringify({ message: 'Refresh expired' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401,
      })
    }
    return new Response(JSON.stringify({ message: 'Phiên đăng nhập đã hết hạn', code: 'UNAUTHORIZED' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 401,
    })
  }

  await assert.rejects(
    api('/auth/me'),
    (error: unknown) =>
      error instanceof ApiError && error.status === 401,
  )
  assert.equal(getAccessToken(), null)
})
