import { useCallback, useEffect, useRef, useState } from 'react'

import { API_URL, getAccessToken } from '../api/client'

type SocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

interface ChatMessage {
  id: string
  conversationId: string
  role: string
  content: string
  senderUserId: string | null
  createdAt: string
}

interface UseChatSocketOptions {
  consultationId: string | null
}

interface UseChatSocketResult {
  status: SocketStatus
  messages: ChatMessage[]
  sendMessage: (content: string) => void
  disconnect: () => void
}

// ponytail: manual WebSocket over socket.io-client since dep not installed.
// upgrade when socket.io-client is available in node_modules.
export function useChatSocket({ consultationId }: UseChatSocketOptions): UseChatSocketResult {
  const [status, setStatus] = useState<SocketStatus>('disconnected')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  const disconnect = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
    setStatus('disconnected')
  }, [])

  const sendMessage = useCallback((content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !consultationId) return
    wsRef.current.send(JSON.stringify({ event: 'send', data: { consultationId, content } }))
  }, [consultationId])

  useEffect(() => {
    if (!consultationId) {
      disconnect()
      setMessages([])
      return
    }

    const token = getAccessToken()
    if (!token) {
      setStatus('error')
      return
    }

    const configuredWs = import.meta.env?.VITE_WS_URL
    let wsUrl: string
    if (configuredWs) {
      const trimmed = configuredWs.replace(/\/$/, '')
      wsUrl = `${trimmed}/human-chat?token=${encodeURIComponent(token)}`
    } else {
      const baseUrl = API_URL.startsWith('http')
        ? API_URL
        : `${window.location.origin}${API_URL.startsWith('/') ? '' : '/'}${API_URL}`
      wsUrl = baseUrl.replace(/^http/, 'ws').replace(/\/api\/v1$/, '') + `/human-chat?token=${encodeURIComponent(token)}`
    }

    setStatus('connecting')
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({ event: 'join', data: { consultationId } }))
      setStatus('connected')
    })

    ws.addEventListener('message', (event) => {
      try {
        const parsed = JSON.parse(event.data)
        if (parsed.event === 'message') {
          setMessages((prev) => [...prev, parsed.data as ChatMessage])
        }
        if (parsed.event === 'joined') {
          setStatus('connected')
        }
        if (parsed.event === 'error') {
          // keep connected, surface errors via message
        }
      } catch {
        // ignore parse failures
      }
    })

    ws.addEventListener('error', () => setStatus('error'))
    ws.addEventListener('close', () => setStatus('disconnected'))

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [consultationId, disconnect])

  return { disconnect, messages, sendMessage, status }
}
