import { useEffect, useMemo, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { API_URL, getAccessToken } from '../../api/client'
import { useApi } from '../../api/useApi'
import { ChatBubble } from '../../components/chat/ChatBubble'

interface StoredMessage {
  id: string
  role: 'USER' | 'ASSISTANT' | 'DOCTOR' | 'SYSTEM'
  content: string
  parts?: UIMessage['parts']
  createdAt: string
}
interface Consultation {
  id: string
  conversationId: string
  status: string
}

export function PatientChat({ conversationId, onBook }: { conversationId: string; onBook: () => void }) {
  const history = useApi<StoredMessage[]>(`/conversations/${conversationId}/messages`)
  const cases = useApi<Consultation[]>('/consultations')
  const consultation = cases.data?.find((item) => item.conversationId === conversationId)

  if (history.loading || cases.loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--sh-slate-500)', fontSize: '14px' }}>
        Đang tải lịch sử tư vấn…
      </div>
    )
  }

  if (history.error || cases.error) {
    return (
      <section className="patient-chat">
        <div style={{ padding: '24px' }}>
          <div role="alert" className="portal-error">
            {(history.error || cases.error)?.message}
          </div>
          <button
            className="btn-primary-action"
            style={{ marginTop: '16px' }}
            onClick={() => {
              history.reload()
              cases.reload()
            }}
          >
            Thử tải lại
          </button>
        </div>
      </section>
    )
  }

  if (consultation && consultation.status !== 'AI_CHAT') {
    return (
      <section className="patient-chat">
        <div className="patient-chat-heading">
          <div className="patient-chat-heading-title">
            <span className="serene-status-dot" style={{ background: 'var(--sh-blue-500)' }} />
            <div>
              <h2>Hội thoại chuyển tiếp Bác sĩ</h2>
              <p>Phiên hỗ trợ đã được chuyển tiếp sang bác sĩ chuyên khoa</p>
            </div>
          </div>
          <button className="btn-book-quick" onClick={onBook} aria-label="Đặt lịch khám Bác sĩ" title="Đặt lịch khám Bác sĩ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Đặt lịch khám trực tiếp</span>
          </button>
        </div>

        <div style={{ padding: '16px 24px', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', color: '#166534', fontSize: '13px' }}>
          Hội thoại này hiện đã ghi nhận vào hồ sơ bác sĩ. Hãy tạo hội thoại mới nếu bạn muốn hỏi thêm cùng Serene AI.
        </div>

        <div className="patient-messages">
          {history.data?.map((message) => (
            <ChatBubble
              key={message.id}
              message={{
                id: message.id,
                sender:
                  message.role === 'USER'
                    ? 'patient'
                    : message.role === 'DOCTOR'
                    ? 'doctor'
                    : message.role === 'SYSTEM'
                    ? 'system'
                    : 'chatbot',
                text: message.content,
                time: new Date(message.createdAt).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              }}
            />
          ))}
        </div>
      </section>
    )
  }

  return <ChatSession conversationId={conversationId} initial={history.data ?? []} onBook={onBook} />
}

function ChatSession({
  conversationId,
  initial,
  onBook,
}: {
  conversationId: string
  initial: StoredMessage[]
  onBook: () => void
}) {
  const [text, setText] = useState('')
  const lastDraft = useRef('')
  const sending = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const following = useRef(true)
  const [showLatest, setShowLatest] = useState(false)
  const [times, setTimes] = useState<Record<string, string>>(() => Object.fromEntries(initial.map(message => [message.id, message.createdAt])))
  const [stopped, setStopped] = useState(false)

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${API_URL}/ai/chat`,
        headers: () => ({ Authorization: `Bearer ${getAccessToken()}` }),
        prepareSendMessagesRequest: ({ messages }) => {
          const last = messages.at(-1)
          return {
            body: {
              conversationId,
              text:
                last?.parts
                  .filter((part) => part.type === 'text')
                  .map((part) => part.text)
                  .join('') ?? '',
            },
          }
        },
      }),
    [conversationId]
  )

  const initialMessages: UIMessage[] = initial
    .filter((item) => item.role === 'USER' || item.role === 'ASSISTANT')
    .map((item) => ({
      id: item.id,
      role: item.role === 'USER' ? 'user' : 'assistant',
      parts: [{ type: 'text', text: item.content }],
    }))

  const { messages, sendMessage, status, error, stop, clearError } = useChat({
    id: conversationId,
    messages: initialMessages,
    transport,
    onError: () => setText((draft) => draft || lastDraft.current),
  })

  const busy = status === 'streaming' || status === 'submitted'

  useEffect(() => () => { void stop() }, [stop])
  useEffect(() => {
    const scroll = scrollRef.current
    const content = contentRef.current
    if (!scroll || !content) return
    const observer = new ResizeObserver(() => {
      if (following.current) scroll.scrollTop = scroll.scrollHeight
    })
    observer.observe(scroll)
    observer.observe(content)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const missing = messages.filter(message => !times[message.id])
    if (missing.length) {
      const now = new Date().toISOString()
      setTimes(previous => ({ ...previous, ...Object.fromEntries(missing.map(message => [message.id, now])) }))
    }
  }, [messages, times])

  useEffect(() => {
    const input = textareaRef.current
    if (!input) return
    const resize = () => {
      input.style.height = ''
      if (window.matchMedia('(max-width: 640px)').matches) {
        input.style.height = '0px'
        input.style.height = `${text ? Math.min(input.scrollHeight, window.innerHeight * 0.2, 120) : 44}px`
      }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [text])

  return (
    <section className="patient-chat">
      {/* Chat Room Header */}
      <div className="patient-chat-heading">
        <div className="patient-chat-heading-title">
          <span className="serene-status-dot" title="Hệ thống trực tuyến" />
          <div>
            <h2>Trợ lý Sức khỏe Serene AI</h2>
            <p>Hỗ trợ sàng lọc triệu chứng và giải đáp y tế ban đầu 24/7</p>
          </div>
        </div>
        <button className="btn-book-quick" onClick={onBook} aria-label="Đặt lịch khám Bác sĩ" title="Đặt lịch khám Bác sĩ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>Đặt lịch khám Bác sĩ</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="patient-message-area">
      <div
        ref={scrollRef}
        className="patient-messages"
        role="log"
        aria-label="Nội dung hội thoại"
        aria-live={busy ? 'off' : 'polite'}
        tabIndex={0}
        onScroll={(event) => {
          const element = event.currentTarget
          following.current = element.scrollHeight - element.scrollTop - element.clientHeight < 64
          setShowLatest(!following.current)
        }}
      >
        <div className="patient-message-content" ref={contentRef}>
        {!messages.length && (
          <div style={{ textAlign: 'center', margin: 'auto 0', padding: '32px 20px', maxWidth: '460px', alignSelf: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)', color: 'var(--sh-blue-600)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--sh-navy-950)', margin: '0 0 6px' }}>
              Bắt đầu phiên tư vấn cùng Serene
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--sh-slate-500)', lineHeight: 1.5, margin: 0 }}>
              Hãy chia sẻ triệu chứng bạn đang gặp phải, vị trí khó chịu và thời gian bắt đầu. Không cần cung cấp thông tin định danh nhạy cảm.
            </p>
          </div>
        )}

        {messages.map((message) => {
          const content = message.parts
            .filter((part) => part.type === 'text')
            .map((part) => part.text)
            .join('')
          return content ? (
            <ChatBubble
              key={message.id}
              message={{
                id: message.id,
                sender: message.role === 'user' ? 'patient' : 'chatbot',
                text: content,
                time: times[message.id] ? new Date(times[message.id]).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
              }}
            />
          ) : null
        })}
        </div>
      </div>
      {showLatest && (
        <button className="patient-jump-latest" onClick={() => {
          following.current = true
          setShowLatest(false)
          scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'instant' })
        }}>
          Tin nhắn mới nhất
        </button>
      )}
      </div>

      {/* Status alerts */}
      {error && (
        <div style={{ padding: '8px 24px' }}>
          <div role="alert" className="portal-error" style={{ fontSize: '13px', padding: '10px 14px' }}>
            Serene chưa thể hoàn tất phản hồi do kết nối mạng gián đoạn. Nội dung gõ đã được giữ lại. Vui lòng thử gửi lại.
          </div>
        </div>
      )}

      {stopped && !busy && (
        <div style={{ padding: '6px 24px', fontSize: '12px', color: 'var(--sh-slate-500)' }}>
          Đã dừng phản hồi.
        </div>
      )}

      {busy && (
        <div className="patient-response-status" role="status" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 24px', background: '#f8fafc', borderTop: '1px solid var(--sh-slate-100)', fontSize: '12.5px', color: 'var(--sh-blue-600)', fontWeight: 600 }}>
          <span>Serene đang xử lý câu trả lời…</span>
          <button
            onClick={() => {
              setStopped(true)
              void stop()
            }}
            style={{ fontSize: '11.5px', padding: '3px 10px', borderRadius: '4px', border: '1px solid var(--sh-slate-300)', background: '#fff', cursor: 'pointer' }}
          >
            Dừng
          </button>
        </div>
      )}

      {/* Modern Composer */}
      <div className="patient-composer-wrapper">
        <form
          className="patient-composer"
          onSubmit={async (event) => {
            event.preventDefault()
            if (!text.trim() || busy || sending.current) return
            sending.current = true
            const content = text.trim()
            lastDraft.current = content
            following.current = true
            setShowLatest(false)
            textareaRef.current?.focus({ preventScroll: true })
            setText('')
            setStopped(false)
            clearError()
            try {
              await sendMessage({ text: content })
            } catch {
              setText((draft) => draft || content)
            } finally {
              sending.current = false
            }
          }}
        >
          <textarea
            ref={textareaRef}
            id="patient-message"
            aria-label="Tin nhắn tư vấn"
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && !window.matchMedia('(pointer: coarse)').matches) {
                event.preventDefault()
                event.currentTarget.form?.requestSubmit()
              }
            }}
            maxLength={4000}
            required
            rows={2}
            placeholder={window.matchMedia('(max-width: 640px), (pointer: coarse)').matches ? 'Nhập câu hỏi sức khỏe…' : 'Mô tả triệu chứng hoặc đặt câu hỏi y tế cho Serene (Enter để gửi)...'}
          />
          <button
            type="submit"
            className="btn-send-message"
            disabled={busy || !text.trim()}
            title="Gửi tin nhắn"
            aria-label="Gửi tin nhắn"
            onPointerDown={(event) => event.preventDefault()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </section>
  )
}
