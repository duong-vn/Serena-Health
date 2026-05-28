import type { ReactNode } from 'react'
import { ChatBubble } from './ChatBubble'
import type { ChatConversation } from './chatTypes'
import './ChatComponents.css'

export type ChatWindowProps = {
  conversation: ChatConversation
  headerAction?: ReactNode
}

export function ChatWindow({ conversation, headerAction }: ChatWindowProps) {
  const handlerLabel = conversation.handlerType === 'doctor' ? 'Có bác sĩ tham gia' : 'Chỉ Chatbot'
  const ageLabel = conversation.patientAge ? `${conversation.patientAge} tuổi` : 'Chưa cập nhật tuổi'

  return (
    <section className="chat-window" aria-label="Nội dung hội thoại">
      <header className="chat-window-header">
        <div className="chat-window-header-copy">
          <div className="chat-window-session-line">
            <span>Phiên #{conversation.sessionCode}</span>
            <strong className={`chat-window-handler-badge chat-window-handler-badge-${conversation.handlerType}`}>
              {handlerLabel}
            </strong>
          </div>
          <h2>{conversation.patientName} · {ageLabel}</h2>
          <p>{conversation.specialty} · {conversation.branch}</p>
        </div>
        <div className="chat-window-actions">
          {headerAction}
        </div>
      </header>
      {conversation.doctorName && conversation.takeoverTime ? (
        <div className="chat-takeover-strip">
          Bác sĩ {conversation.doctorName} đã tiếp quản lúc {conversation.takeoverTime}
        </div>
      ) : null}
      <div className="chat-message-list">
        {conversation.messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
      </div>
    </section>
  )
}
