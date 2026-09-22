import { useCallback, useEffect, useState } from 'react'

import { api } from './client'

export interface UseApiResult<T> {
  data: T | null
  error: Error | null
  loading: boolean
  reload: () => void
}

export function useApi<T>(path: string | null): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(Boolean(path))
  const [requestVersion, setRequestVersion] = useState(0)

  const reload = useCallback(() => setRequestVersion((version) => version + 1), [])

  useEffect(() => {
    if (!path) {
      setData(null)
      setError(null)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setData(null)
    setLoading(true)
    setError(null)

    api<T>(path, { signal: controller.signal })
      .then((nextData) => {
        if (!controller.signal.aborted) {
          setData(nextData)
        }
      })
      .catch((nextError: unknown) => {
        if (!controller.signal.aborted) {
          setError(nextError instanceof Error ? nextError : new Error('Không thể tải dữ liệu.'))
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [path, requestVersion])

  return { data, error, loading, reload }
}
