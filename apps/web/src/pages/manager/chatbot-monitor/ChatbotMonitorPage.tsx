import { useEffect, useMemo, useState } from 'react'

import { api } from '../../../api/client'
import { useApi } from '../../../api/useApi'
import { Header } from '../../../components/layout/header/Header'
import { Sidebar } from '../../../components/layout/sidebar/Sidebar'
import '../../../components/layout/DesktopShell.css'
import { ChatWindow } from '../../../components/chat/ChatWindow'
import { ConversationCard } from '../../../components/chat/ConversationCard'
import type { ChatConversation, ChatMessage } from '../../../components/chat/chatTypes'
import { DetailModal } from '../../../components/ui/DetailModal'
import { FilterSelect } from '../../../components/ui/FilterSelect'
import { Pagination } from '../../../components/ui/Pagination'
import { managerSidebarConfig } from '../managerSidebarConfig'
import './ChatbotMonitorPage.css'

interface ApiConsultationItem {
  id: string
  status: string
  summary: string | null
  reason: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  patient: { id: string; fullName: string }
  doctor?: { id: string; user: { fullName: string } }
}

interface ApiMessage {
  id: string
  role: string
  content: string
  createdAt: string
}

const CONVERSATIONS_PER_PAGE = 4

function toUiMessage(msg: ApiMessage): ChatMessage {
  const isUser = msg.role === 'USER'
  const isDoctor = msg.role === 'DOCTOR'
  const isBot = msg.role === 'ASSISTANT'
  return {
    avatarLabel: isDoctor ? 'BS' : isBot ? 'AI' : 'BN',
    id: msg.id,
    sender: isUser ? 'patient' : isDoctor ? 'doctor' : isBot ? 'chatbot' : 'system',
    text: msg.content,
    time: new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
  }
}

export function ChatbotMonitorPage() {
  const { data, error, loading } = useApi<{ items: ApiConsultationItem[] }>('/consultations')
  const consultations = data?.items || []

  const [activeConversationId, setActiveConversationId] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)

  const conversations: ChatConversation[] = useMemo(() => {
    return consultations.map((c) => ({
      botSummary: c.summary || c.notes || 'Không có tóm tắt.',
      branch: 'Hệ thống chính',
      doctorName: c.doctor?.user.fullName,
      feedback: c.notes || undefined,
      handlerType: c.doctor ? 'doctor' : 'bot',
      id: c.id,
      lastMessage: c.reason || 'Yêu cầu tư vấn',
      messages: [],
      patientAge: 0,
      patientName: c.patient.fullName,
      rating: 5,
      riskLevel: c.status === 'OPEN' ? 'urgent' : 'normal',
      sessionCode: c.id.slice(0, 6).toUpperCase(),
      specialty: 'Đa khoa',
      symptoms: c.reason ? [c.reason] : [],
      updatedMinutesAgo: Math.max(1, Math.round((Date.now() - new Date(c.updatedAt).getTime()) / 60000)),
    }))
  }, [consultations])

  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id)
    }
  }, [activeConversationId, conversations])

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([])
      return
    }
    let active = true
    setMessagesLoading(true)
    api<{ items: ApiMessage[] }>(`/consultations/${activeConversationId}/messages`)
      .then((res) => {
        if (active) setMessages(res.items.map(toUiMessage))
      })
      .catch(() => {
        if (active) setMessages([])
      })
      .finally(() => {
        if (active) setMessagesLoading(false)
      })
    return () => {
      active = false
    }
  }, [activeConversationId])

  const totalPages = Math.max(1, Math.ceil(conversations.length / CONVERSATIONS_PER_PAGE))
  const paginatedConversations = useMemo(() => {
    const startIndex = (currentPage - 1) * CONVERSATIONS_PER_PAGE
    return conversations.slice(startIndex, startIndex + CONVERSATIONS_PER_PAGE)
  }, [currentPage, conversations])

  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId)
  const fullActiveConversation: ChatConversation | undefined = activeConversation
    ? { ...activeConversation, messages }
    : undefined

  return (
    <div className="desktop-shell-page chatbot-monitor-page">
      <Sidebar config={managerSidebarConfig} />
      <Header profileRole={managerSidebarConfig.profileRole} />
      <main className="desktop-shell-main chatbot-monitor-main" aria-label="Giám sát Chatbot">
        <section className="chatbot-monitor-content" aria-busy={loading}>
          <div className="chatbot-monitor-heading">
            <div>
              <h1>Giám sát Chatbot</h1>
              <p>Theo dõi các phiên tư vấn và sự tiếp nhận của bác sĩ trong hệ thống.</p>
            </div>
          </div>

          {loading ? <p className="doctor-data-state" role="status">Đang tải lịch sử tư vấn...</p> : null}
          {error ? <p className="doctor-data-state" role="alert">{error.message}</p> : null}

          {!loading && !error && conversations.length === 0 ? (
            <div className="doctor-data-state">Chưa có phiên tư vấn nào được ghi nhận trên hệ thống.</div>
          ) : null}

          {!loading && !error && conversations.length > 0 ? (
            <div className="chatbot-monitor-layout">
              <aside className="chatbot-conversation-panel" aria-label="Danh sách cuộc hội thoại">
                <div className="chatbot-conversation-list">
                  {paginatedConversations.map((conversation) => (
                    <ConversationCard
                      key={conversation.id}
                      conversation={conversation}
                      active={conversation.id === activeConversationId}
                      onClick={() => setActiveConversationId(conversation.id)}
                    />
                  ))}
                </div>

                <Pagination
                  className="chatbot-pagination"
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </aside>

              {fullActiveConversation ? (
                <section className="chatbot-detail-panel" aria-label="Chi tiết hội thoại">
                  {messagesLoading ? (
                    <div className="doctor-data-state">Đang tải tin nhắn...</div>
                  ) : (
                    <ChatWindow
                      conversation={fullActiveConversation}
                      headerAction={(
                        <button type="button" className="chatbot-info-button" onClick={() => setIsInfoModalOpen(true)}>
                          Xem thông tin nhanh
                        </button>
                      )}
                    />
                  )}
                </section>
              ) : (
                <section className="chatbot-detail-panel chatbot-detail-empty" aria-label="Chi tiết hội thoại">
                  Chọn một cuộc hội thoại để xem nội dung chi tiết.
                </section>
              )}
            </div>
          ) : null}
        </section>
      </main>

      {activeConversation ? (
        <DetailModal
          open={isInfoModalOpen}
          onClose={() => setIsInfoModalOpen(false)}
          title="Thông tin chi tiết phiên tư vấn"
          subtitle={`${activeConversation.patientName} · Phiên #${activeConversation.sessionCode}`}
        >
          <div className="chatbot-summary-panel" aria-label="Thông tin nhanh">
            <p><strong>Lý do / Triệu chứng:</strong> {activeConversation.lastMessage}</p>
            <p><strong>Tóm tắt sơ bộ:</strong> {activeConversation.botSummary}</p>
            {activeConversation.doctorName ? <p><strong>Bác sĩ phụ trách:</strong> {activeConversation.doctorName}</p> : null}
          </div>
        </DetailModal>
      ) : null}
    </div>
  )
}
