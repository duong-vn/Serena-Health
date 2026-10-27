import { useCallback, useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'

import { api, API_URL, getAccessToken } from '../api/client'

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

export function useChatSocket({ consultationId }: UseChatSocketOptions): UseChatSocketResult {
  const [status, setStatus] = useState<SocketStatus>('disconnected')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const socketRef = useRef<Socket | null>(null)

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect()
    socketRef.current = null
    setStatus('disconnected')
  }, [])

  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current || !consultationId || !content.trim()) return
    socketRef.current.emit('send', { consultationId, content: content.trim() })
  }, [consultationId])

  useEffect(() => {
    setMessages([])
    if (!consultationId) {
      disconnect()
      return
    }

    const token = getAccessToken()
    if (!token) {
      setStatus('error')
      return
    }

    let active = true

    // Fetch prior messages
    api<ChatMessage[]>(`/consultations/${consultationId}/messages`)
      .then((history) => {
        if (!active) return
        const list = Array.isArray(history) ? history : []
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id))
          const unadded = list.filter((m) => !ids.has(m.id))
          return [...unadded, ...prev]
        })
      })
      .catch(() => {})

    const baseUrl = API_URL.startsWith('http')
      ? API_URL.replace(/\/api\/v1$/, '')
      : window.location.origin

    setStatus('connecting')
    const socket = io(`${baseUrl}/human-chat`, {
      auth: { token },
      transports: ['websocket'],
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setStatus('connected')
      socket.emit('join', { consultationId })
    })

    socket.on('message', (incoming: ChatMessage) => {
      if (!incoming?.id) return
      setMessages((prev) => (prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]))
    })

    socket.on('connect_error', () => {
      setStatus('error')
    })

    socket.on('disconnect', () => {
      setStatus('disconnected')
    })

    return () => {
      active = false
      socket.disconnect()
      socketRef.current = null
    }
  }, [consultationId, disconnect])

  return { disconnect, messages, sendMessage, status }
}
