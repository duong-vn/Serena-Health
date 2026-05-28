import './ChatComponents.css'

export type ChatSystemNoticeProps = {
  text: string
  time?: string
}

export function ChatSystemNotice({ text, time }: ChatSystemNoticeProps) {
  return (
    <div className="chat-system-notice" role="note">
      <span>{text}</span>
      {time ? <time>{time}</time> : null}
    </div>
  )
}
