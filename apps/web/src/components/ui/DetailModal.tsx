import type { ReactNode } from 'react'
import './DetailModal.css'

export type DetailModalProps = {
  title: string
  subtitle?: string
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function DetailModal({ title, subtitle, open, onClose, children }: DetailModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className="detail-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="detail-modal-header">
          <div>
            <h2 id="detail-modal-title">{title}</h2>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <button type="button" className="detail-modal-close" onClick={onClose} aria-label="Đóng">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>
        <div className="detail-modal-body">{children}</div>
      </section>
    </div>
  )
}
