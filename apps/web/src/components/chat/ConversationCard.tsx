import type { ChatConversation } from './chatTypes'
import './ChatComponents.css'

export type ConversationCardProps = {
  conversation: ChatConversation
  active?: boolean
  onClick?: () => void
}

function formatUpdatedTime(minutes: number) {
  if (minutes < 60) {
    return `${minutes} phút trước`
  }

  const hours = Math.floor(minutes / 60)
  return `${hours} giờ trước`
}

export function ConversationCard({ conversation, active = false, onClick }: ConversationCardProps) {
  const isUrgent = conversation.riskLevel === 'urgent'
  const isLowRating = typeof conversation.rating === 'number' && conversation.rating <= 2
  const handlerLabel = conversation.handlerType === 'doctor' ? 'Người dùng ↔ Bác sĩ' : 'Người dùng ↔ Bot'

  return (
    <button
      type="button"
      className={[
        'conversation-card',
        active ? 'is-active' : '',
        isUrgent ? 'is-urgent' : '',
        isLowRating ? 'is-low-rating' : '',
      ].filter(Boolean).join(' ')}
      onClick={onClick}
    >
      <div className="conversation-card-top">
        <div>
          <strong>{conversation.patientName}</strong>
          <span>#{conversation.sessionCode}</span>
        </div>
        <time>{formatUpdatedTime(conversation.updatedMinutesAgo)}</time>
      </div>
      <div className="conversation-card-badges">
        {isUrgent ? <span className="conversation-badge conversation-badge-urgent">Nguy hiểm</span> : null}
        {isLowRating ? (
          <span className="conversation-badge conversation-badge-low">Đánh giá thấp: {conversation.rating}★</span>
        ) : null}
        <span className={`conversation-badge conversation-badge-${conversation.handlerType}`}>{handlerLabel}</span>
      </div>
    </button>
  )
}
