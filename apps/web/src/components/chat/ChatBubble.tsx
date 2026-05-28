import { ChatSystemNotice } from './ChatSystemNotice'
import type { ChatMessage } from './chatTypes'
import './ChatComponents.css'

export type ChatBubbleProps = {
  message: ChatMessage
}

function BotAvatar() {
  return (
    <span className="chat-avatar chat-avatar-bot" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="M12 4v3" />
        <path d="M7 9h10a3 3 0 0 1 3 3v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-4a3 3 0 0 1 3-3Z" />
        <path d="M9 14h.01M15 14h.01" />
      </svg>
    </span>
  )
}

function DoctorAvatar({ label }: { label?: string }) {
  return (
    <span className="chat-avatar chat-avatar-doctor" aria-label={label || 'Bác sĩ'}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21a7 7 0 0 1 14 0v1H5v-1Z" />
      </svg>
    </span>
  )
}

export function ChatBubble({ message }: ChatBubbleProps) {
  if (message.sender === 'system') {
    return <ChatSystemNotice text={message.text} time={message.time} />
  }

  const isBot = message.sender === 'chatbot'
  const isDoctor = message.sender === 'doctor'

  return (
    <div className={`chat-bubble-row chat-bubble-row-${message.sender}`}>
      {(isBot || isDoctor) && (
        <div className="chat-bubble-avatar">
          {isBot ? <BotAvatar /> : <DoctorAvatar label={message.avatarLabel} />}
        </div>
      )}
      <div className={`chat-bubble chat-bubble-${message.sender}`}>
        {isDoctor && message.doctorName ? <strong>{message.doctorName}</strong> : null}
        <p>{message.text}</p>
        <time>{message.time}</time>
      </div>
    </div>
  )
}
